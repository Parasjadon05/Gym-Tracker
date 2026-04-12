import { createContext, useContext, useEffect, useState } from 'react'
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth, hasFirebaseConfig } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!hasFirebaseConfig || !auth) {
      setLoading(false)
      return
    }

    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return unsub
  }, [])

  /**
   * Session persistence (web):
   * - `persist: true` (default): survives browser close — `LOCAL` storage
   * - `persist: false`: cleared when the tab/window session ends — `SESSION` storage
   */
  const applyPersistence = async (persist = true) => {
    if (!auth) return
    await setPersistence(
      auth,
      persist ? browserLocalPersistence : browserSessionPersistence,
    )
  }

  const value = {
    user,
    loading,
    hasFirebaseConfig,
    signup: async (email, password, { persist = true } = {}) => {
      if (!auth) throw new Error('Firebase is not configured. Add .env keys first.')
      await applyPersistence(persist)
      return createUserWithEmailAndPassword(auth, email, password)
    },
    login: async (email, password, { persist = true } = {}) => {
      if (!auth) throw new Error('Firebase is not configured. Add .env keys first.')
      await applyPersistence(persist)
      return signInWithEmailAndPassword(auth, email, password)
    },
    logout: () => {
      if (!auth) return Promise.resolve()
      return signOut(auth)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
