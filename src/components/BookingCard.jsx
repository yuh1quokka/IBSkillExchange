import { BOOKING_STATUS } from '../types/models';
import {
  formatTimeRange
} from '../utils/helpers';

export default function BookingCard({
  booking,
  participantNames,
  isBuyer,
  onComplete,
  onCancel
}) {

  const done =
    booking.status === BOOKING_STATUS.COMPLETED;

  return (
    <article className="booking-card">

      <div>

        <span className={`status ${booking.status}`}>
          {done ? '完了' : '予約中'}
        </span>

        <h3>{booking.skillTitle}</h3>

        <p>
          {isBuyer
            ? `学び合う相手: ${booking.sellerName}`
            : `学び合う相手: ${booking.buyerName}`}
          {' '}· ◉ {booking.price}
        </p>

        <small>
          予定: {booking.availableDate || '日付未設定'} · {formatTimeRange(booking.startTime, booking.duration)}
        </small>
        {(participantNames || booking.participantNames)?.length > 1 && <small className="participants">参加者: {(participantNames || booking.participantNames).join('、')}</small>}

      </div>

      <div style={{ display: 'flex', gap: '8px' }}>

        {isBuyer && !done && (
          <button onClick={() => onComplete(booking.id)}>
            Lesson Completed
          </button>
        )}

        {isBuyer && !done && onCancel && (
          <button
            className="outline"
            onClick={() => onCancel(booking)}
          >
            キャンセル
          </button>
        )}

      </div>

    </article>
  );
}
