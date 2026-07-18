import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';

import { db } from './firebase';
import { BOOKING_STATUS } from '../types/models';
import { monthKey } from '../utils/helpers';

const notificationRef = () => doc(collection(db, 'notifications'));
const safeText = (value, fallback = '') => typeof value === 'string' && value.trim() ? value : fallback;
const dateParts = value => {
  const date = value?.toDate ? value.toDate() : value instanceof Date ? value : typeof value === 'string' ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return { availableDate: '', startTime: '' };
  const pad = number => String(number).padStart(2, '0');
  return { availableDate: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`, startTime: `${pad(date.getHours())}:${pad(date.getMinutes())}` };
};
const bookingSchedule = skill => {
  const legacy = dateParts(skill.availableTime);
  return { availableDate: safeText(skill.availableDate, legacy.availableDate), startTime: safeText(skill.startTime, legacy.startTime), duration: Number(skill.duration) > 0 ? Number(skill.duration) : 60 };
};


export async function reserveSkill(skill, buyer) {

  if ((skill.userId || skill.sellerId) === buyer.uid) {
    throw new Error('自分のスキルは予約できません。');
  }


  const bookingRef = doc(collection(db, 'bookings'));
  const skillRef = doc(db, 'skills', skill.id);
  await runTransaction(db, async tx => {
    const skillSnapshot = await tx.get(skillRef);
    if (!skillSnapshot.exists()) throw new Error('このスキルは見つかりません。');
    const latestSkill = skillSnapshot.data();
    const currentStudents = latestSkill.currentStudents || 0;
    const maxStudents = latestSkill.maxStudents || 1;
    if (latestSkill.isActive === false || currentStudents >= maxStudents) throw new Error('このスキルは満員です。');
    const sellerId = safeText(latestSkill.userId, safeText(latestSkill.sellerId));
    if (!sellerId) throw new Error('このスキルの出品者情報が不足しています。');
    const schedule = bookingSchedule(latestSkill);
    const participantNames = [...(Array.isArray(latestSkill.participantNames) ? latestSkill.participantNames : []), safeText(buyer.username, 'クラスメイト')];
    tx.set(bookingRef, {
      buyerId: buyer.uid,
      buyerName: safeText(buyer.username, 'クラスメイト'),

      sellerId,
      sellerName: safeText(latestSkill.sellerName, 'クラスメイト'),

      skillId: skill.id,
      skillTitle: safeText(latestSkill.title, 'スキルセッション'),
      subject: safeText(latestSkill.subject, 'Other'),
      category: safeText(latestSkill.category, 'Other'),

      classId: safeText(latestSkill.classId, safeText(buyer.classId)),

      price: Number(latestSkill.price) || 0,
      duration: schedule.duration,
      availableDate: schedule.availableDate,
      startTime: schedule.startTime,
      participantNames,

bookingTime: serverTimestamp(),

      status: BOOKING_STATUS.RESERVED
    });
    tx.update(skillRef, { currentStudents: currentStudents + 1, participantNames, isActive: currentStudents + 1 < maxStudents });
    tx.set(notificationRef(), { userId: sellerId, classId: safeText(latestSkill.classId, safeText(buyer.classId)), title: '予約されました', message: `${safeText(buyer.username, 'クラスメイト')}さんがあなたのスキルを予約しました`, type: 'booking_created', targetPage: 'bookings', targetId: bookingRef.id, read: false, createdAt: serverTimestamp() });
  });
  return bookingRef;
}




export function listenBookings(uid, callback, onError) {

  const made = query(
    collection(db, 'bookings'),
    where('buyerId', '==', uid),
    orderBy('bookingTime', 'desc')
  );


  const received = query(
    collection(db, 'bookings'),
    where('sellerId', '==', uid),
    orderBy('bookingTime', 'desc')
  );


  let a = [];
  let b = [];


  const emit = () => {
    callback({
      made: a,
      received: b
    });
  };


  const ua = onSnapshot(
    made,
    snap => {
      a = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      emit();
    },
    onError
  );


  const ub = onSnapshot(
    received,
    snap => {
      b = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      emit();
    },
    onError
  );


  return () => {
    ua();
    ub();
  };
}





export async function completeLesson(bookingId, buyerId) {


  await runTransaction(db, async tx => {


    const bookingRef = doc(db, 'bookings', bookingId);

    const bookingSnap = await tx.get(bookingRef);



    if (!bookingSnap.exists()) {
      throw new Error('予約が見つかりません。');
    }



    const booking = bookingSnap.data();

    if (!booking.buyerId || !booking.sellerId || !booking.skillId || !booking.classId) {
      throw new Error('この予約は必要な情報が不足しているため、完了できません。');
    }



    if (booking.buyerId !== buyerId) {
      throw new Error('受講者のみ完了できます。');
    }



    if (booking.status !== BOOKING_STATUS.RESERVED) {
      throw new Error('このレッスンは既に処理されています。');
    }




    const buyerRef = doc(
      db,
      'users',
      booking.buyerId
    );


    const sellerRef = doc(
      db,
      'users',
      booking.sellerId
    );



    const [
      buyerSnap,
      sellerSnap
    ] = await Promise.all([
      tx.get(buyerRef),
      tx.get(sellerRef)
    ]);



    if (!buyerSnap.exists() || !sellerSnap.exists()) {
      throw new Error('ユーザー情報が見つかりません。');
    }




    if (
      (buyerSnap.data().currentCoins || 0)
      < (Number(booking.price) || 0)
    ) {
      throw new Error('コインが不足しています。');
    }




    const seller = sellerSnap.data();



    const isNewMonth =
      seller.monthlyContributionKey !== monthKey();




    tx.update(
      buyerRef,
      {
        currentCoins:
          buyerSnap.data().currentCoins - (Number(booking.price) || 0)
      }
    );




    tx.update(
      sellerRef,
      {
        currentCoins:
          (seller.currentCoins || 0)
          + (Number(booking.price) || 0),

        contributionCoins:
          (seller.contributionCoins || 0)
          + (Number(booking.price) || 0),

        monthlyContributionCoins:
          (isNewMonth
            ? 0
            : seller.monthlyContributionCoins || 0)
          + (Number(booking.price) || 0),

        monthlyContributionKey:
          monthKey()
      }
    );




    tx.update(
      bookingRef,
      {
        status: BOOKING_STATUS.COMPLETED,
        completedAt: serverTimestamp()
      }
    );



    // 1対1の場合、完了したら出品削除
    const skillRef = doc(
      db,
      'skills',
      booking.skillId
    );


    tx.update(
      skillRef,
      {
        isActive:false
      }
    );




    const histories = collection(
      db,
      'histories'
    );



    tx.set(
      doc(histories),
      {
        userId: booking.buyerId,
        classId: booking.classId,
        type:'spent',
        amount:-(Number(booking.price) || 0),
        description:`「${safeText(booking.skillTitle, 'スキルセッション')}」を受講完了`,
        bookingId,
        createdAt:serverTimestamp()
      }
    );

    tx.set(notificationRef(), { userId: booking.sellerId, classId: booking.classId, title: '授業が完了しました', message: '授業が完了しました。コインが移動しました', type: 'lesson_completed', targetPage: 'history', targetId: bookingId, read: false, createdAt: serverTimestamp() });



    tx.set(
      doc(histories),
      {
        userId: booking.sellerId,
        classId: booking.classId,
        type:'earned',
        amount:Number(booking.price) || 0,
        description:`「${safeText(booking.skillTitle, 'スキルセッション')}」を教えました`,
        bookingId,
        createdAt:serverTimestamp()
      }
    );

  });

}

export async function cancelBooking(booking) {

  await runTransaction(db, async tx => {

    const bookingRef = doc(db, 'bookings', booking.id);
    const skillRef = doc(db, 'skills', booking.skillId);

    const skillSnap = await tx.get(skillRef);

    if (!skillSnap.exists()) {
      throw new Error('スキルが見つかりません。');
    }

    const skill = skillSnap.data();

    const currentStudents = Math.max(
      (skill.currentStudents || 1) - 1,
      0
    );

    tx.update(skillRef, {
      currentStudents,
      isActive: true
    });

    tx.delete(bookingRef);

  });

}
