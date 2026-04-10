import { lazy, Suspense } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import GymStickers from '../components/GymStickers'

const GymScene = lazy(() => import('../components/GymScene'))

function LandingPage() {
  const reduceMotion = useReducedMotion()
  const section = {
    hidden: { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 20 },
    show: { opacity: 1, y: 0, transition: { duration: reduceMotion ? 0 : 0.55 } },
  }
  const floatProps = reduceMotion
    ? {}
    : {
        animate: { y: [0, -6, 0] },
        transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
      }

  return (
    <div className="landing-page neo-shell">
      <Suspense fallback={null}>
        <GymScene />
      </Suspense>
      <GymStickers variant="landing" />
      <div className="app-shell landing-root">
      <header className="top-nav landing-nav">
        <div className="logo">Gymverse</div>
        <Link to="/login" className="btn-nav">
          Open dashboard
        </Link>
      </header>

      <main className="landing-main">
        <motion.section
          className="hero hero-grid"
          initial="hidden"
          animate="show"
          variants={section}
        >
          <div className="hero-card accent-card">
            <p className="chip">Recomp program</p>
            <h1>Train with structure. Track with clarity.</h1>
            <p>
              Six-day split, vegetarian macro flow, body check-ins, and session history—built
              for consistent progression without guesswork.
            </p>
            <div className="hero-actions stacked">
              <Link to="/login" className="btn-primary">
                Start training log
              </Link>
              <a href="#plan" className="btn-secondary">How it works</a>
            </div>
          </div>
          <motion.div
            className="floating-lifter plate-showcase"
            {...floatProps}
          >
            <div className="plate-stat">
              <span>Calories</span>
              <strong>2100</strong>
            </div>
            <div className="plate-stat">
              <span>Protein</span>
              <strong>115g</strong>
            </div>
            <div className="plate-stat">
              <span>Split</span>
              <strong>6 Days</strong>
            </div>
          </motion.div>
        </motion.section>

        <motion.section id="plan" className="panel" variants={section} initial="hidden" whileInView="show">
          <h2>Training Blueprint</h2>
          <p>Push / Pull / Shoulders+Abs / Legs / Upper Pump / Weak Point + Rest.</p>
        </motion.section>

        <motion.section id="diet" className="panel" variants={section} initial="hidden" whileInView="show">
          <h2>Veg Recomp Nutrition</h2>
          <p>Meal-by-meal checklist with calorie and protein progress against your target.</p>
        </motion.section>

        <motion.section id="tracking" className="panel" variants={section} initial="hidden" whileInView="show">
          <h2>Track, Review, Improve</h2>
          <p>Exercise logs, body calendar, and previous-session references to ensure progression.</p>
        </motion.section>
      </main>
      </div>
    </div>
  )
}

export default LandingPage
