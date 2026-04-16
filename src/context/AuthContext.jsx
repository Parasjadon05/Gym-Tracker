import { createContext, useContext, useEffect, useState } from 'react'
import {
  browserLocalPersistence,
  browserSessionPersistence,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { auth, hasFirebaseConfig } from '../firebase'

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

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
    loginWithGoogle: async ({ persist = true } = {}) => {
      if (!auth) throw new Error('Firebase is not configured. Add .env keys first.')
      await applyPersistence(persist)
      return signInWithPopup(auth, googleProvider)
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
