import { useAuth } from '../contexts/AuthContext';
import { useRealtime } from '../hooks/useRealtime';
import {
  listenMySkills,
  deactivateSkill
} from '../services/skillService';
import { listenBookings } from '../services/bookingService';
import { logout } from '../services/authService';
import SkillCard from '../components/SkillCard';
import MyCalendar from '../components/MyCalendar';
import { listenNotifications, markNotificationRead } from '../services/notificationService';
import { formatDate } from '../utils/helpers';
import { User } from "lucide-react";

export default function ProfilePage({ setPage }) {

  const { authUser, profile } = useAuth();

  const { data: skillsData } = useRealtime(
    (ok, fail) => listenMySkills(authUser.uid, ok, fail),
    [authUser.uid]
  );

  const { data: bookingsData } = useRealtime(
    (ok, fail) => listenBookings(authUser.uid, ok, fail),
    [authUser.uid]
  );

  const { data: notificationsData } = useRealtime(
    (ok, fail) => listenNotifications(authUser.uid, ok, fail),
    [authUser.uid]
  );

  const skills = skillsData ?? [];

  const bookings = bookingsData ?? {
    made: [],
    received: []
  };
  const notifications = notificationsData ?? [];
  const unreadNotifications = notifications.filter(notification => !notification.read);
  const allBookings = [...bookings.made, ...bookings.received];

  const removeSkill = async id => {

    if (!window.confirm('このスキルを削除しますか？')) {
      return;
    }

    try {
      await deactivateSkill(id);
    } catch {
      alert('削除に失敗しました。');
    }

  };
  const openNotification = async notification => {
    if (!notification.read) await markNotificationRead(notification.id);
    if (notification.targetId) localStorage.setItem('selectedBookingId', notification.targetId);
    setPage(notification.targetPage || (notification.type === 'booking_created' ? 'bookings' : notification.type === 'request_answered' ? 'requests' : 'history'));
  };
  const openBooking = bookingId => { localStorage.setItem('selectedBookingId', bookingId); setPage('bookings'); };
  const editSkill = skill => { localStorage.setItem('editingSkill', JSON.stringify(skill)); setPage('create'); };

  return (
    <>

      <header className="profile-head">

        <div className="big-avatar">
  <User />
</div>

        <div>
          <p className="eyebrow">
            {profile.classId}
          </p>

          <h1>
            {profile.username}
          </h1>

          <p>
            {profile.email}
          </p>
        </div>

        <div className="profile-actions"><button className="outline" onClick={() => setPage('history')}>履歴を見る</button><button className="outline logout" onClick={logout}>ログアウト</button></div>

      </header>



      <div className="stats">

        <div>
          <b>{profile.currentCoins ?? 0}</b>
          <span>Current Coins</span>
        </div>

        <div>
          <b>{profile.contributionCoins ?? 0}</b>
          <span>Contribution Coins</span>
        </div>

        <div>
          <b>{skills.length}</b>
          <span>出品中スキル</span>
        </div>

      </div>

      <section className="notification-section profile-notifications">
        <div className="section-heading"><div><p className="eyebrow">UPDATES</p><h2>🔔 Notifications</h2></div></div>
        <div className="notification-list">{unreadNotifications.length ? unreadNotifications.map(notification => <div key={notification.id} className="notification-item unread"><span className="notification-dot" /><button className="notification-content" onClick={() => openNotification(notification)}><strong>{notification.title}</strong><small>{notification.message} · {formatDate(notification.createdAt)}</small></button><button className="outline notification-confirm" onClick={() => markNotificationRead(notification.id)}>確認</button></div>) : <div className="empty">未確認の通知はありません。</div>}</div>
      </section>



      <section className="booking-section">

        <h2>出品中のスキル</h2>

        <div className="skill-grid compact">

          {skills.map(skill => (

            <SkillCard
              key={skill.id}
              skill={skill}
              onDelete={removeSkill}
              onEdit={editSkill}
            />

          ))}

          {!skills.length && (

            <div className="empty">
              出品中のスキルはありません。
            </div>

          )}

        </div>

      </section>



      <section className="mini-lists">

        <div>

          <h2>予約した一覧</h2>

          {bookings.made.length ? (

            bookings.made
              .slice(0, 5)
              .map(item => (

                <p key={item.id}>
                  {item.skillTitle}{' '}
                  <small>
                    {item.status === 'completed'
                      ? '完了'
                      : '予約中'}
                  </small>
                </p>

              ))

          ) : (

            <p>—</p>

          )}

        </div>


        <div>

          <h2>予約を受けた一覧</h2>

          {bookings.received.length ? (

            bookings.received
              .slice(0, 5)
              .map(item => (

                <p key={item.id}>
                  {item.skillTitle}{' '}
                  <small>
                    {item.status === 'completed'
                      ? '完了'
                      : '予約中'}
                  </small>
                </p>

              ))

          ) : (

            <p>—</p>

          )}

        </div>

      </section>

      <MyCalendar bookings={allBookings} currentUid={authUser.uid} onOpenBooking={openBooking} />

    </>
  );

}
