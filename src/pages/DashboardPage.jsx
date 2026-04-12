import { useEffect, useMemo, useRef, useState } from 'react'
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { motion, useReducedMotion } from 'framer-motion'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { db, storage } from '../firebase'
import { baselineTargets, dietPlan, weeklySplit } from '../data/plan'
import DashboardSectionBridge from '../components/DashboardSectionBridge'
import DashboardStickerDeck from '../components/DashboardStickers'

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

const initialLog = {
  weight: '',
  waist: '',
  calories: '',
  protein: '',
  sleepHours: '',
  waterLiters: '',
  cardioDone: false,
  workoutDone: false,
  mealChecks: {},
  notes: '',
}

const initialBodyCheckin = {
  weight: '',
  waist: '',
  mirrorFrontDataUrl: '',
  mirrorSideDataUrl: '',
  visualNotes: '',
}

function buildExercisePerformance(exercises, existing = {}) {
  return exercises.reduce((acc, exercise) => {
    const prev = existing[exercise] || {}
    acc[exercise] = {
      weight: prev.weight || '',
      reps: prev.reps || '',
      notes: prev.notes || '',
    }
    return acc
  }, {})
}

function parsePrescription(exercise) {
  const parts = exercise.split(' - ')
  if (parts.length < 2) return { name: exercise, prescription: 'Follow planned sets/reps' }
  const [name, ...rest] = parts
  return { name, prescription: rest.join(' - ') }
}

function buildMealChecks(existing = {}) {
  return dietPlan.reduce((acc, meal) => {
    acc[meal.id] = Boolean(existing[meal.id])
    return acc
  }, {})
}

function monthStart(dateObj) {
  return new Date(dateObj.getFullYear(), dateObj.getMonth(), 1)
}

function toDateKey(dateObj) {
  const y = dateObj.getFullYear()
  const m = String(dateObj.getMonth() + 1).padStart(2, '0')
  const d = String(dateObj.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function dateDaysAgo(days) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
}

function hasAnyExerciseLog(perf = {}) {
  return Object.values(perf || {}).some((v) => {
    const weight = String(v?.weight || '').trim()
    const reps = String(v?.reps || '').trim()
    const notes = String(v?.notes || '').trim()
    return weight || reps || notes
  })
}

function mealCaloriesFromChecks(mealChecks = {}) {
  return dietPlan.reduce(
    (sum, meal) => sum + (mealChecks?.[meal.id] ? meal.calories : 0),
    0,
  )
}

function averageLoggedWeight(exercisePerformance = {}) {
  const values = Object.values(exercisePerformance || {})
    .map((v) => Number(v?.weight))
    .filter((n) => Number.isFinite(n) && n > 0)
  if (!values.length) return 0
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
}

function getExerciseWarning(entry = {}) {
  const weightRaw = String(entry.weight || '').trim()
  const repsRaw = String(entry.reps || '').trim()
  const notesRaw = String(entry.notes || '').trim()
  const weight = Number(weightRaw)
  const reps = Number(repsRaw)
  if (!weightRaw && !repsRaw && !notesRaw) return 'Add at least one field before saving.'
  if (repsRaw && reps <= 0) return 'Reps should be above 0.'
  if (weightRaw && weight > 300) return 'Weight looks unusually high (>300 kg).'
  return ''
}

function toSparkPath(points = []) {
  if (!points.length) return ''
  const max = Math.max(...points, 1)
  const min = Math.min(...points, 0)
  const span = Math.max(max - min, 1)
  return points
    .map((value, i) => {
      const x = (i / Math.max(points.length - 1, 1)) * 100
      const y = 100 - ((value - min) / span) * 100
      return `${x},${y}`
    })
    .join(' ')
}

function DashboardPage() {
  const reduceMotion = useReducedMotion()
  const fadeUp = useMemo(
    () => ({
      hidden: { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 12 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: reduceMotion ? 0 : 0.35 },
      },
    }),
    [reduceMotion],
  )
  const hoverCard = reduceMotion ? undefined : { y: -2 }

  const { user, logout } = useAuth()
  const { section } = useParams()
  const navigate = useNavigate()
  const [dailyLog, setDailyLog] = useState(initialLog)
  const [exercisePerformance, setExercisePerformance] = useState({})
  const [previousExercisePerformance, setPreviousExercisePerformance] = useState({})
  const [bodyCheckin, setBodyCheckin] = useState(initialBodyCheckin)
  const [bodyTrackingDate, setBodyTrackingDate] = useState(todayKey())
  const [recentBodyDates, setRecentBodyDates] = useState([])
  const [calendarMonth, setCalendarMonth] = useState(monthStart(new Date()))
  const [monthBodyDates, setMonthBodyDates] = useState([])
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const [savingExercise, setSavingExercise] = useState({})
  const [exerciseStatus, setExerciseStatus] = useState({})
  const [bodySaving, setBodySaving] = useState(false)
  const [bodyStatus, setBodyStatus] = useState('')
  const [mealSaving, setMealSaving] = useState(false)
  const [exerciseWarnings, setExerciseWarnings] = useState({})
  const [exerciseTrend, setExerciseTrend] = useState(Array(7).fill(0))
  const [dietTrend, setDietTrend] = useState(Array(7).fill(0))
  const [consistencyBadge, setConsistencyBadge] = useState('0-day streak • 0/7 active')
  const exerciseWeightInputRefs = useRef({})

  const dayIndex = useMemo(() => {
    const jsDay = new Date().getDay()
    return jsDay === 0 ? 6 : jsDay - 1
  }, [])

  const todayPlan = weeklySplit[dayIndex]
  const key = todayKey()
  const activeSection = ['exercise', 'diet', 'weekly'].includes(section)
    ? section
    : 'exercise'

  useEffect(() => {
    if (!['exercise', 'diet', 'weekly'].includes(section || '')) {
      navigate('/dashboard/exercise', { replace: true })
    }
  }, [section, navigate])

  useEffect(() => {
    setExercisePerformance((prev) => buildExercisePerformance(todayPlan.exercises, prev))
  }, [todayPlan.exercises])

  useEffect(() => {
    setDailyLog((prev) => ({ ...prev, mealChecks: buildMealChecks(prev.mealChecks) }))
  }, [])

  useEffect(() => {
    async function cleanupSeededDemoDataIfRequested() {
      if (!user || !db) return
      const markerRef = doc(db, 'users', user.uid, 'meta', 'seedStatus')
      const markerSnap = await getDoc(markerRef)
      const marker = markerSnap.exists() ? markerSnap.data() : {}
      if (!marker?.lastWeekSeeded || marker?.demoDataDeleted) return

      for (let i = 0; i <= 7; i += 1) {
        const d = dateDaysAgo(i)
        const dateKey = toDateKey(d)

        const logRef = doc(db, 'users', user.uid, 'dailyLogs', dateKey)
        const logSnap = await getDoc(logRef)
        if (logSnap.exists()) {
          const logData = logSnap.data()
          const perf = logData?.exercisePerformance || {}
          const looksSeededWorkout = Object.values(perf).some(
            (v) => typeof v?.notes === 'string' && v.notes === 'Demo seeded entry',
          )
          if (looksSeededWorkout) await deleteDoc(logRef)
        }

        const bodyRef = doc(db, 'users', user.uid, 'bodyCheckins', dateKey)
        const bodySnap = await getDoc(bodyRef)
        if (bodySnap.exists()) {
          const bodyData = bodySnap.data()
          const looksSeededBody =
            typeof bodyData?.visualNotes === 'string' &&
            bodyData.visualNotes === 'Demo: tighter waist, better shoulder pump.'
          if (looksSeededBody) await deleteDoc(bodyRef)
        }
      }

      await setDoc(
        markerRef,
        {
          demoDataDeleted: true,
          lastWeekSeeded: false,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
    }

    cleanupSeededDemoDataIfRequested()
  }, [user])

  useEffect(() => {
    async function loadLog() {
      if (!user || !db) return
      const ref = doc(db, 'users', user.uid, 'dailyLogs', key)
      const snap = await getDoc(ref)
      if (snap.exists()) {
        const data = snap.data()
        setDailyLog({
          ...initialLog,
          ...data,
          mealChecks: buildMealChecks(data.mealChecks || {}),
        })
        setExercisePerformance(
          buildExercisePerformance(todayPlan.exercises, data.exercisePerformance || {}),
        )
      }
      const logsRef = collection(db, 'users', user.uid, 'dailyLogs')
      const logsQuery = query(logsRef, orderBy('date', 'desc'), limit(30))
      const logsSnap = await getDocs(logsQuery)
      const priorMap = {}
      logsSnap.docs.forEach((d) => {
        const entry = d.data()
        if (!entry?.date || entry.date >= key) return
        const perf = entry.exercisePerformance || {}
        Object.entries(perf).forEach(([exerciseName, val]) => {
          if (!priorMap[exerciseName] && (val?.weight || val?.reps)) {
            priorMap[exerciseName] = {
              date: entry.date,
              weight: val.weight || '-',
              reps: val.reps || '-',
            }
          }
        })
      })
      setPreviousExercisePerformance(priorMap)

      const logsByDate = {}
      logsSnap.docs.forEach((d) => {
        const entry = d.data()
        if (entry?.date) logsByDate[entry.date] = entry
      })
      const last7Keys = Array.from({ length: 7 }, (_, i) => toDateKey(dateDaysAgo(6 - i)))
      const exSeries = last7Keys.map((k) =>
        averageLoggedWeight(logsByDate[k]?.exercisePerformance || {}),
      )
      const dietSeries = last7Keys.map((k) =>
        mealCaloriesFromChecks(logsByDate[k]?.mealChecks || {}),
      )
      setExerciseTrend(exSeries)
      setDietTrend(dietSeries)

      const isActiveDate = (dateKey) => {
        const entry = logsByDate[dateKey]
        if (!entry) return false
        return (
          hasAnyExerciseLog(entry.exercisePerformance) ||
          mealCaloriesFromChecks(entry.mealChecks || {}) > 0 ||
          Boolean(entry.workoutDone) ||
          Boolean(entry.cardioDone)
        )
      }
      const activeDays = last7Keys.reduce((sum, k) => sum + (isActiveDate(k) ? 1 : 0), 0)
      let streak = 0
      for (let i = 0; i < 30; i += 1) {
        const dKey = toDateKey(dateDaysAgo(i))
        if (!isActiveDate(dKey)) break
        streak += 1
      }
      setConsistencyBadge(`${streak}-day streak • ${activeDays}/7 active`)
    }
    loadLog()
  }, [user, key, todayPlan.exercises])

  useEffect(() => {
    async function loadBodyTracking() {
      if (!user || !db) return
      const ref = doc(db, 'users', user.uid, 'bodyCheckins', bodyTrackingDate)
      const snap = await getDoc(ref)
      if (snap.exists()) setBodyCheckin({ ...initialBodyCheckin, ...snap.data() })
      else setBodyCheckin(initialBodyCheckin)

      const bodyRef = collection(db, 'users', user.uid, 'bodyCheckins')
      const bodyQuery = query(bodyRef, orderBy('date', 'desc'), limit(14))
      const bodySnap = await getDocs(bodyQuery)
      setRecentBodyDates(bodySnap.docs.map((d) => d.id))
    }
    loadBodyTracking()
  }, [user, bodyTrackingDate])

  useEffect(() => {
    async function loadMonthDates() {
      if (!user || !db) return
      const start = toDateKey(monthStart(calendarMonth))
      const end = toDateKey(
        new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0),
      )
      const bodyRef = collection(db, 'users', user.uid, 'bodyCheckins')
      const q = query(
        bodyRef,
        where('date', '>=', start),
        where('date', '<=', end),
        orderBy('date', 'asc'),
      )
      const snap = await getDocs(q)
      setMonthBodyDates(snap.docs.map((d) => d.id))
    }
    loadMonthDates()
  }, [user, calendarMonth])

  const saveLog = async () => {
    if (!user || !db) return
    setSaving(true)
    setStatus('')
    try {
      const ref = doc(db, 'users', user.uid, 'dailyLogs', key)
      await setDoc(
        ref,
        {
          ...dailyLog,
          exercisePerformance,
          updatedAt: serverTimestamp(),
          date: key,
        },
        { merge: true },
      )
      setStatus('Saved.')
    } catch (err) {
      setStatus(`Save failed: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const saveSingleExercise = async (exerciseName) => {
    if (!user || !db) return
    const entry = exercisePerformance[exerciseName] || {}
    const warning = getExerciseWarning(entry)
    setExerciseWarnings((prev) => ({ ...prev, [exerciseName]: warning }))
    if (warning === 'Add at least one field before saving.') {
      setExerciseStatus((prev) => ({ ...prev, [exerciseName]: 'retry' }))
      return
    }
    setSavingExercise((prev) => ({ ...prev, [exerciseName]: true }))
    setExerciseStatus((prev) => ({ ...prev, [exerciseName]: 'saving' }))
    try {
      const ref = doc(db, 'users', user.uid, 'dailyLogs', key)
      await setDoc(
        ref,
        {
          date: key,
          updatedAt: serverTimestamp(),
          exercisePerformance: {
            [exerciseName]: exercisePerformance[exerciseName] || {
              weight: '',
              reps: '',
              notes: '',
            },
          },
        },
        { merge: true },
      )
      setExerciseStatus((prev) => ({ ...prev, [exerciseName]: 'saved' }))
      const currentIndex = todayPlan.exercises.indexOf(exerciseName)
      const nextExercise = todayPlan.exercises[currentIndex + 1]
      if (nextExercise) {
        setTimeout(() => {
          exerciseWeightInputRefs.current[nextExercise]?.focus()
        }, 0)
      }
    } catch (err) {
      setExerciseStatus((prev) => ({
        ...prev,
        [exerciseName]: 'retry',
      }))
    } finally {
      setSavingExercise((prev) => ({ ...prev, [exerciseName]: false }))
    }
  }

  const saveMealChecks = async (nextMealChecks) => {
    if (!user || !db) return
    setMealSaving(true)
    try {
      const ref = doc(db, 'users', user.uid, 'dailyLogs', key)
      await setDoc(
        ref,
        {
          date: key,
          updatedAt: serverTimestamp(),
          mealChecks: nextMealChecks,
        },
        { merge: true },
      )
    } finally {
      setMealSaving(false)
    }
  }

  const saveBodyCheckin = async () => {
    if (!user || !db) return
    setBodySaving(true)
    setBodyStatus('')
    try {
      const bodyRef = doc(db, 'users', user.uid, 'bodyCheckins', bodyTrackingDate)
      await setDoc(
        bodyRef,
        {
          ...bodyCheckin,
          date: bodyTrackingDate,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
      setBodyStatus('Body tracking saved.')
    } catch (err) {
      setBodyStatus(`Save failed: ${err.message}`)
    } finally {
      setBodySaving(false)
    }
  }

  const handleBodyImageUpload = async (e, side) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setBodyStatus('Please upload a valid image file.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setBodyStatus('Please upload images under 2MB each.')
      return
    }
    if (!user || !storage) {
      setBodyStatus('Firebase Storage is not configured.')
      return
    }
    try {
      setBodyStatus('Uploading image...')
      const ext = file.name.split('.').pop() || 'jpg'
      const imageRef = ref(
        storage,
        `users/${user.uid}/bodyCheckins/${bodyTrackingDate}/${side}-${Date.now()}.${ext}`,
      )
      await uploadBytes(imageRef, file, { contentType: file.type })
      const url = await getDownloadURL(imageRef)
      if (side === 'front') setBodyCheckin((p) => ({ ...p, mirrorFrontDataUrl: url }))
      else setBodyCheckin((p) => ({ ...p, mirrorSideDataUrl: url }))
      setBodyStatus('Image uploaded. Save body tracking to persist.')
    } catch (err) {
      setBodyStatus(err.message)
    }
  }

  const onLogout = async () => {
    await logout()
    navigate('/login')
  }

  const caloriesFromMeals = useMemo(
    () =>
      dietPlan.reduce(
        (total, meal) => total + (dailyLog.mealChecks?.[meal.id] ? meal.calories : 0),
        0,
      ),
    [dailyLog.mealChecks],
  )

  const proteinFromMeals = useMemo(
    () =>
      dietPlan.reduce(
        (total, meal) => total + (dailyLog.mealChecks?.[meal.id] ? meal.protein : 0),
        0,
      ),
    [dailyLog.mealChecks],
  )

  const calorieProgress = Math.min(
    100,
    Math.round((caloriesFromMeals / baselineTargets.calories) * 100),
  )
  const proteinProgress = Math.min(
    100,
    Math.round((proteinFromMeals / baselineTargets.protein) * 100),
  )
  const exerciseTrendPath = useMemo(() => toSparkPath(exerciseTrend), [exerciseTrend])
  const dietTrendPath = useMemo(() => toSparkPath(dietTrend), [dietTrend])

  const calendarCells = useMemo(() => {
    const first = monthStart(calendarMonth)
    const firstWeekday = first.getDay()
    const daysInMonth = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth() + 1,
      0,
    ).getDate()
    const cells = []
    for (let i = 0; i < firstWeekday; i += 1) cells.push(null)
    for (let d = 1; d <= daysInMonth; d += 1) {
      const dateKey = toDateKey(
        new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), d),
      )
      cells.push(dateKey)
    }
    return cells
  }, [calendarMonth])

  return (
    <div className="dashboard-shell neo-shell dashboard-root">
      <motion.header className="top-nav" initial="hidden" animate="show" variants={fadeUp}>
        <div className="logo">Gymverse</div>
        <div className="nav-actions">
          {user?.email && (
            <span className="chip chip--muted" title={user.email}>
              {user.email.length > 22 ? `${user.email.slice(0, 20)}…` : user.email}
            </span>
          )}
          <span className="chip">{key}</span>
          <button className="btn-secondary" onClick={onLogout}>
            Logout
          </button>
        </div>
      </motion.header>

      <div className="dashboard-layout">
        <motion.aside className="section-nav side-nav" initial="hidden" animate="show" variants={fadeUp}>
          <NavLink to="/dashboard/exercise" className={({ isActive }) => `section-link ${isActive ? 'active' : ''}`}>
            Exercise Tracking
          </NavLink>
          <NavLink to="/dashboard/diet" className={({ isActive }) => `section-link ${isActive ? 'active' : ''}`}>
            Diet Tracking
          </NavLink>
          <NavLink to="/dashboard/weekly" className={({ isActive }) => `section-link ${isActive ? 'active' : ''}`}>
            Body Tracking
          </NavLink>
        </motion.aside>

        <main className="dashboard-content">
          <DashboardStickerDeck section={activeSection} consistencyBadge={consistencyBadge} />
          {activeSection === 'exercise' && (
            <div className="dashboard-stack-tight">
              <motion.section className="stats-grid" initial="hidden" animate="show" variants={fadeUp}>
                <div className="stat-card"><h3>Calories</h3><p>{baselineTargets.calories} kcal</p></div>
                <div className="stat-card"><h3>Protein</h3><p>{baselineTargets.protein} g</p></div>
                <div className="stat-card"><h3>Water</h3><p>{baselineTargets.waterLiters} L</p></div>
                <div className="stat-card trend-card">
                  <h3>Cardio</h3>
                  <p>{baselineTargets.cardio}</p>
                  <svg className="mini-sparkline" viewBox="0 0 100 100" aria-hidden>
                    <polyline points={exerciseTrendPath} />
                  </svg>
                </div>
              </motion.section>

              <DashboardSectionBridge section="exercise" />

              <motion.section className="panel" initial="hidden" animate="show" variants={fadeUp}>
                <h2>Today&apos;s Training - {todayPlan.day}</h2>
                <p>{todayPlan.focus}</p>
                <div className="exercise-grid">
                  {todayPlan.exercises.map((item) => {
                    const parsed = parsePrescription(item)
                    const last = previousExercisePerformance[item]
                    const saveState = savingExercise[item]
                      ? 'saving'
                      : (exerciseStatus[item] || 'idle')
                    return (
                      <motion.div key={item} className="exercise-item exercise-card" whileHover={hoverCard}>
                        <div className="exercise-headline">
                          <strong>{parsed.name}</strong>
                          <div className="exercise-meta">
                            <span className="prescription">{parsed.prescription}</span>
                            {last && (
                              <span className="last-time">
                                Last: {last.weight} kg, {last.reps} reps ({last.date})
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="exercise-log-grid">
                          <input
                            placeholder="Weight (kg)"
                            ref={(el) => {
                              exerciseWeightInputRefs.current[item] = el
                            }}
                            value={exercisePerformance[item]?.weight || ''}
                            onChange={(e) =>
                              {
                                const nextEntry = { ...(exercisePerformance[item] || {}), weight: e.target.value }
                                setExercisePerformance((prev) => ({
                                  ...prev,
                                  [item]: nextEntry,
                                }))
                                setExerciseWarnings((prev) => ({ ...prev, [item]: getExerciseWarning(nextEntry) }))
                              }
                            }
                          />
                          <input
                            placeholder="Reps"
                            value={exercisePerformance[item]?.reps || ''}
                            onChange={(e) =>
                              {
                                const nextEntry = { ...(exercisePerformance[item] || {}), reps: e.target.value }
                                setExercisePerformance((prev) => ({
                                  ...prev,
                                  [item]: nextEntry,
                                }))
                                setExerciseWarnings((prev) => ({ ...prev, [item]: getExerciseWarning(nextEntry) }))
                              }
                            }
                          />
                          <input
                            placeholder="Notes (optional)"
                            value={exercisePerformance[item]?.notes || ''}
                            onChange={(e) =>
                              {
                                const nextEntry = { ...(exercisePerformance[item] || {}), notes: e.target.value }
                                setExercisePerformance((prev) => ({
                                  ...prev,
                                  [item]: nextEntry,
                                }))
                                setExerciseWarnings((prev) => ({ ...prev, [item]: getExerciseWarning(nextEntry) }))
                              }
                            }
                          />
                          <button
                            className="btn-secondary inline-save"
                            type="button"
                            disabled={saveState === 'saving'}
                            onClick={() => saveSingleExercise(item)}
                          >
                            Save Exercise
                          </button>
                        </div>
                        <div className="actions-row exercise-actions">
                          {exerciseWarnings[item] && (
                            <span className="exercise-warning">{exerciseWarnings[item]}</span>
                          )}
                          {saveState !== 'idle' && (
                            <span className={`save-chip ${saveState}`}>
                              {saveState === 'saving' && 'Saving'}
                              {saveState === 'saved' && 'Saved'}
                              {saveState === 'retry' && 'Retry'}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.section>
            </div>
          )}

          {activeSection === 'diet' && (
            <div className="dashboard-stack-tight">
              <motion.section className="stats-grid" initial="hidden" animate="show" variants={fadeUp}>
                <div className="stat-card">
                  <h3>Calories Target</h3>
                  <p>{baselineTargets.calories} kcal</p>
                  <div className="macro-row card-row">
                    <span>Progress</span>
                    <span>{caloriesFromMeals} / {baselineTargets.calories} kcal</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${calorieProgress}%` }} />
                  </div>
                </div>
                <div className="stat-card">
                  <h3>Protein Target</h3>
                  <p>{baselineTargets.protein} g</p>
                  <div className="macro-row card-row">
                    <span>Progress</span>
                    <span>{proteinFromMeals} / {baselineTargets.protein} g</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill protein" style={{ width: `${proteinProgress}%` }} />
                  </div>
                </div>
                <div className="stat-card"><h3>Water Target</h3><p>{baselineTargets.waterLiters} L</p></div>
                <div className="stat-card trend-card">
                  <h3>Cardio Plan</h3>
                  <p>{baselineTargets.cardio}</p>
                  <svg className="mini-sparkline diet" viewBox="0 0 100 100" aria-hidden>
                    <polyline points={dietTrendPath} />
                  </svg>
                </div>
              </motion.section>

              <DashboardSectionBridge section="diet" />

              <div className="diet-layout">
                <motion.section className="panel" initial="hidden" animate="show" variants={fadeUp}>
                  <h2>Your Veg Diet Flow</h2>
                  <div className="exercise-grid">
                    {dietPlan.map((item) => (
                      <motion.label key={item.id} className="exercise-item meal-item" whileHover={hoverCard}>
                        <input
                          type="checkbox"
                          checked={Boolean(dailyLog.mealChecks?.[item.id])}
                          onChange={async (e) => {
                            const nextMealChecks = {
                              ...buildMealChecks(dailyLog.mealChecks),
                              [item.id]: e.target.checked,
                            }
                            setDailyLog((prev) => ({ ...prev, mealChecks: nextMealChecks }))
                            await saveMealChecks(nextMealChecks)
                          }}
                        />
                        <div>
                          <strong>{item.label}</strong>
                          <p className="meal-macros">{item.calories} kcal • {item.protein} g protein</p>
                        </div>
                      </motion.label>
                    ))}
                  </div>
                  {mealSaving && <p className="meal-save-hint">Saving meal checks...</p>}
                </motion.section>

                <motion.section className="panel" initial="hidden" animate="show" variants={fadeUp}>
                  <h2>Progress Rules (Strict)</h2>
                  <div className="exercise-grid">
                    <div className="exercise-item"><strong>Rule 1 - Double Progression</strong><p>First increase reps in range, then increase weight.</p></div>
                    <div className="exercise-item"><strong>Rule 2 - Stuck 2 weeks</strong><p>Increase calories by +100 kcal/day.</p></div>
                    <div className="exercise-item"><strong>Rule 3 - Gaining fat</strong><p>Reduce carbs slightly, especially dinner carbs.</p></div>
                    <div className="exercise-item"><strong>Perfect Recomp Signal</strong><p>Weight stable/slight up + waist down + upper body fuller.</p></div>
                  </div>
                </motion.section>
              </div>
            </div>
          )}

          {activeSection === 'weekly' && (
            <div className="body-layout">
              <motion.section className="panel" initial="hidden" animate="show" variants={fadeUp}>
                <h2>Daily Body Tracking</h2>
                <p>Track daily (morning, empty stomach). You can open any previous day.</p>
                <div className="body-date-row">
                  <span className="chip">Today: {todayKey()}</span>
                  <span className="chip">Viewing: {bodyTrackingDate}</span>
                </div>
                {recentBodyDates.length > 0 && (
                  <div className="history-row">
                    {recentBodyDates.map((d) => (
                      <button key={d} className="btn-secondary history-btn" type="button" onClick={() => setBodyTrackingDate(d)}>
                        {d}
                      </button>
                    ))}
                  </div>
                )}
                <div className="form-grid">
                  <input placeholder="Weight (kg)" value={bodyCheckin.weight} onChange={(e) => setBodyCheckin((p) => ({ ...p, weight: e.target.value }))} />
                  <input placeholder="Waist (cm)" value={bodyCheckin.waist} onChange={(e) => setBodyCheckin((p) => ({ ...p, waist: e.target.value }))} />
                  <label className="file-field">Front Mirror Image<input type="file" accept="image/*" onChange={(e) => handleBodyImageUpload(e, 'front')} /></label>
                  <label className="file-field">Side Mirror Image<input type="file" accept="image/*" onChange={(e) => handleBodyImageUpload(e, 'side')} /></label>
                </div>
                <div className="preview-grid">
                  <div className="preview-card">
                    <p>Front preview</p>
                    {bodyCheckin.mirrorFrontDataUrl ? <img src={bodyCheckin.mirrorFrontDataUrl} alt="Front progress" /> : <span>No image uploaded</span>}
                  </div>
                  <div className="preview-card">
                    <p>Side preview</p>
                    {bodyCheckin.mirrorSideDataUrl ? <img src={bodyCheckin.mirrorSideDataUrl} alt="Side progress" /> : <span>No image uploaded</span>}
                  </div>
                </div>
                <textarea
                  placeholder="Shoulders/chest fullness notes, visual changes"
                  value={bodyCheckin.visualNotes}
                  onChange={(e) => setBodyCheckin((p) => ({ ...p, visualNotes: e.target.value }))}
                  rows={3}
                />
                <div className="actions-row">
                  <button className="btn-primary" onClick={saveBodyCheckin} disabled={bodySaving}>
                    {bodySaving ? 'Saving...' : 'Save Body Tracking'}
                  </button>
                  <span>{bodyStatus}</span>
                </div>
              </motion.section>

              <motion.section className="panel" initial="hidden" animate="show" variants={fadeUp}>
                <h2>Body Log Calendar</h2>
                <div className="calendar-wrap">
                  <div className="calendar-header">
                    <button type="button" className="btn-secondary history-btn" onClick={() => setCalendarMonth(monthStart(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)))}>
                      Prev
                    </button>
                    <strong>{calendarMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</strong>
                    <button type="button" className="btn-secondary history-btn" onClick={() => setCalendarMonth(monthStart(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)))}>
                      Next
                    </button>
                  </div>
                  <div className="calendar-grid week-head">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                      <span key={d}>{d}</span>
                    ))}
                  </div>
                  <div className="calendar-grid">
                    {calendarCells.map((dateKey, idx) =>
                      dateKey ? (
                        <button
                          key={dateKey}
                          type="button"
                          className={`calendar-cell ${dateKey === bodyTrackingDate ? 'selected' : ''} ${monthBodyDates.includes(dateKey) ? 'has-log' : ''}`}
                          onClick={() => setBodyTrackingDate(dateKey)}
                        >
                          {Number(dateKey.slice(-2))}
                        </button>
                      ) : (
                        <span key={`empty-${idx}`} className="calendar-cell empty" />
                      ),
                    )}
                  </div>
                </div>
              </motion.section>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default DashboardPage
