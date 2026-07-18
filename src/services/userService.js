import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { monthKey } from '../utils/helpers';

export function listenUser(uid, callback, onError) {
  return onSnapshot(
    query(collection(db, 'users'), where('uid', '==', uid)),
    s => {
      console.log("Snapshot empty:", s.empty);
      console.log("Snapshot docs:", s.docs.map(d => d.data()));
      callback(s.empty ? null : s.docs[0].data());
    },
    err => {
      console.error("Firestore Error:", err);
      onError(err);
    }
  );
}

export function listenRanking(classId, callback, onError) {
  return onSnapshot(
    query(
      collection(db, 'users'),
      where('classId', '==', classId),
      where('monthlyContributionKey', '==', monthKey()),
      orderBy('monthlyContributionCoins', 'desc')
    ),
    s => callback(s.docs.map(d => d.data())),
    onError
  );
}

export function listenHistories(uid, callback, onError) {
  return onSnapshot(
    query(
      collection(db, 'histories'),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc')
    ),
    s => callback(s.docs.map(d => ({ id: d.id, ...d.data() }))),
    onError
  );
}