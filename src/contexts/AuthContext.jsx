import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { listenUser } from '../services/userService';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null), [profile, setProfile] = useState(null), [loading, setLoading] = useState(true), [error, setError] = useState('');
  useEffect(() => onAuthStateChanged(auth, user => { setAuthUser(user); if (!user) { setProfile(null); setLoading(false); } }), []);
  useEffect(() => { if (!authUser) return; setLoading(true); return listenUser(authUser.uid, user => { setProfile(user); setLoading(false); }, () => { setError('プロフィールを読み込めませんでした。'); setLoading(false); }); }, [authUser]);
  return <AuthContext.Provider value={{ authUser, profile, loading, error, setError }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
