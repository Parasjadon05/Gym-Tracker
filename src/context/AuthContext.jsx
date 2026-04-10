import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
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

  const value = {
    user,
    loading,
    hasFirebaseConfig,
    signup: (email, password) => {
      if (!auth) throw new Error('Firebase is not configured. Add .env keys first.')
      return createUserWithEmailAndPassword(auth, email, password)
    },
    login: (email, password) => {
      if (!auth) throw new Error('Firebase is not configured. Add .env keys first.')
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
