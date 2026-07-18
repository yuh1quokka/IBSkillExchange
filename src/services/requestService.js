import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  deleteDoc,
  updateDoc,
  where
} from 'firebase/firestore';

import { db } from './firebase';

export async function createRequest(data, user) {

  return addDoc(
    collection(db, 'requests'),
    {

      title: data.title,

      subject: data.subject,

      category: data.category,

      description: data.description,

      reward: Number(data.reward),

      preferredSchedule: data.preferredSchedule,

      userId: user.uid,

      userName: user.username,

      classId: user.classId,

      status: 'open',

      answeredBy: '',

      skillId: '',

      createdAt: serverTimestamp()

    }
  );

}

export async function updateRequest(id, data, user) {
  const reference = doc(db, 'requests', id);
  const snapshot = await getDoc(reference);
  if (!snapshot.exists() || snapshot.data().userId !== user.uid) throw new Error('自分が投稿したリクエストだけ編集できます。');
  return updateDoc(reference, { title: String(data.title || '').trim(), subject: String(data.subject || '').trim(), category: String(data.category || 'Other').trim(), description: String(data.description || '').trim(), reward: Number(data.reward) || 0, preferredSchedule: String(data.preferredSchedule || '').trim() });
}

export async function deleteRequest(id, user) {
  const reference = doc(db, 'requests', id);
  const snapshot = await getDoc(reference);
  if (!snapshot.exists() || snapshot.data().userId !== user.uid) throw new Error('自分が投稿したリクエストだけ削除できます。');
  return deleteDoc(reference);
}

export function listenRequests(classId, callback, onError) {

  return onSnapshot(

    query(
      collection(db, 'requests'),
      where('classId', '==', classId),
      orderBy('createdAt', 'desc')
    ),

    snap =>
      callback(
        snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }))
      ),

    onError

  );

}

export async function answerRequest(request, skillId, responderName) {

  await updateDoc(
    doc(db, 'requests', request.id),
    {
      skillId,
      status: 'answered'
    }
  );

  await addDoc(collection(db, 'notifications'), {
    userId: String(request.userId || ''), classId: String(request.classId || ''), title: '回答が届きました',
    message: 'あなたのリクエストに回答が届きました', type: 'request_answered', targetPage: 'requests', targetId: String(request.id || ''), read: false, createdAt: serverTimestamp()
  });

}
