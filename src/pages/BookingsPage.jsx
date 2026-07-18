import { useState } from 'react';
import { formatTimeRange } from '../utils/helpers';
import { useAuth } from '../contexts/AuthContext';
import {
  listenBookings,
  completeLesson,
  cancelBooking
} from '../services/bookingService';
import { useRealtime } from '../hooks/useRealtime';
import { useToast } from '../contexts/ToastContext';
import BookingCard from '../components/BookingCard';
import { listenClassSkills } from '../services/skillService';

export default function BookingsPage() {
  const { authUser, profile } = useAuth();
  const toast = useToast();

  const [busy, setBusy] = useState('');

  const { data, error } = useRealtime(
    (ok, fail) => listenBookings(authUser.uid, ok, fail),
    [authUser.uid]
  );

  const bookings = data ?? {
    made: [],
    received: []
  };
  const { data: skillsData } = useRealtime((ok, fail) => listenClassSkills(profile.classId, ok, fail), [profile.classId]);
  const skillsById = Object.fromEntries((skillsData ?? []).map(skill => [skill.id, skill]));
  const [focusedId, setFocusedId] = useState(() => localStorage.getItem('selectedBookingId') || '');
  const focusedBooking = [...bookings.made, ...bookings.received].find(booking => booking.id === focusedId);
  const focusedSkill = focusedBooking ? skillsById[focusedBooking.skillId] : null;
  const clearFocusedBooking = () => { localStorage.removeItem('selectedBookingId'); setFocusedId(''); };

  const complete = async id => {
    setBusy(id);

    try {
      await completeLesson(id, authUser.uid);
      toast('レッスンを完了しました。コインを送金しました！');
    } catch (e) {
      toast(e.message || '完了処理に失敗しました。', 'error');
    } finally {
      setBusy('');
    }
  };

  const cancel = async booking => {

  const ok = window.confirm(
    `「${booking.skillTitle}」の予約をキャンセルしますか？`
  );

  if (!ok) return;

  try {
    await cancelBooking(booking);
    toast('予約をキャンセルしました！');
  } catch (e) {
    toast(e.message || 'キャンセルできませんでした。', 'error');
  }

};

  const list = (title, rows, buyer) => (
    <section className="booking-section">

      <h2>{title}</h2>

      {rows.length ? (
        rows.map(b => (
          <div key={b.id}>

            <BookingCard
  booking={b}
  participantNames={skillsById[b.skillId]?.participantNames}
  isBuyer={buyer}
  onComplete={id => (busy ? null : complete(id))}
  onCancel={cancel}
/>

          </div>
        ))
      ) : (
        <div className="empty">
          まだありません。
        </div>
      )}

    </section>
  );

  return (
    <>
      <header className="simple-header">
        <p className="eyebrow">MY LESSONS</p>
        <h1>予約一覧</h1>
        <p>
          受講後は受講者が「Lesson Completed」を押してください。
        </p>
      </header>

      {error && (
        <p className="message error">
          {error}
        </p>
      )}

      {focusedBooking && <section className="booking-detail"><div className="section-heading"><div><p className="eyebrow">BOOKING DETAILS</p><h2>{focusedBooking.skillTitle}</h2></div><button className="outline" onClick={clearFocusedBooking}>閉じる</button></div><div className="detail-grid"><span>教科<b>{focusedBooking.subject || '未設定'}</b></span><span>カテゴリー<b>{focusedBooking.category || '未設定'}</b></span><span>出品者<b>{focusedBooking.sellerName}</b></span><span>参加者<b>{(focusedSkill?.participantNames || focusedBooking.participantNames || [focusedBooking.buyerName]).join('、')}</b></span><span>日付・時間<b>{focusedBooking.availableDate} · {formatTimeRange(focusedBooking.startTime, focusedBooking.duration)}</b></span><span>所要時間<b>{focusedBooking.duration}分</b></span><span>ステータス<b>{focusedBooking.status === 'completed' ? '完了' : '予約中'}</b></span></div></section>}

      {list('予約したレッスン', bookings.made, true)}
      {list('予約を受けたレッスン', bookings.received, false)}
    </>
  );
}
