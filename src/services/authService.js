import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { monthKey } from '../utils/helpers';

export async function register({ email, password, username, classId }) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, 'users', credential.user.uid), { uid: credential.user.uid, email, username, classId, currentCoins: 100, contributionCoins: 0, monthlyContributionCoins: 0, monthlyContributionKey: monthKey(), createdAt: serverTimestamp() });
  return credential.user;
}
export const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const logout = () => signOut(auth);
