import { collection, doc, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';

export function listenNotifications(uid, callback, onError) {
  return onSnapshot(query(collection(db, 'notifications'), where('userId', '==', uid), orderBy('createdAt', 'desc')), snapshot => callback(snapshot.docs.map(item => ({ id: item.id, ...item.data() }))), onError);
}
export const markNotificationRead = id => updateDoc(doc(db, 'notifications', id), { read: true });
