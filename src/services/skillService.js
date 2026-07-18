import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';

import { db } from './firebase';

// スキル作成
export async function createSkill(data, user) {

  return addDoc(
    collection(db, 'skills'),
    {
      title: String(data.title || '').trim(),
      subject: String(data.subject || 'Other').trim(),
      category: String(data.category || 'Other').trim(),
      description: String(data.description || '').trim(),

      price: Number(data.price),
      duration: Number(data.duration),

      availableDate: typeof data.availableDate === 'string' ? data.availableDate : '',
      startTime: typeof data.startTime === 'string' ? data.startTime : '',

      maxStudents: Number(data.maxStudents) || 1,
      currentStudents: 0,
      participantNames: [],

      userId: user.uid,
      sellerName: String(user.username || 'クラスメイト'),
      classId: String(user.classId || ''),

      isActive: true,

      createdAt: serverTimestamp()
    }
  );

}

export async function getSkill(id) {
  const snapshot = await getDoc(doc(db, 'skills', id));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function updateSkill(id, data, user) {
  const reference = doc(db, 'skills', id);
  const snapshot = await getDoc(reference);
  if (!snapshot.exists() || snapshot.data().userId !== user.uid) throw new Error('自分が出品したスキルだけ編集できます。');
  return updateDoc(reference, {
    title: String(data.title || '').trim(), subject: String(data.subject || 'Other').trim(), category: String(data.category || 'Other').trim(), description: String(data.description || '').trim(),
    price: Number(data.price) || 0, duration: Number(data.duration) || 15, maxStudents: Number(data.maxStudents) || 1,
    availableDate: typeof data.availableDate === 'string' ? data.availableDate : '', startTime: typeof data.startTime === 'string' ? data.startTime : ''
  });
}

export function listenClassSkills(classId, callback, onError) {
  return onSnapshot(query(collection(db, 'skills'), where('classId', '==', classId)), snapshot => callback(snapshot.docs.map(item => ({ id: item.id, ...item.data() }))), onError);
}

// ホーム画面用
export function listenSkills(
  classId,
  callback,
 onError
) {

  return onSnapshot(
    query(
      collection(db, 'skills'),
      where('classId', '==', classId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    ),

    snap => {
      callback(
        snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }))
      );
    },

    onError
  );

}

// プロフィール画面用
export function listenMySkills(
  uid,
  callback,
  onError
) {

  return onSnapshot(
    query(
      collection(db, 'skills'),
      where('userId', '==', uid),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    ),

    snap => {
      callback(
        snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }))
      );
    },

    onError
  );

}

// 手動削除
export async function deactivateSkill(id) {

  return updateDoc(
    doc(db, 'skills', id),
    {
      isActive: false
    }
  );

}
