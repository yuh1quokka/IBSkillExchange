import { NAV_ITEMS } from '../constants/options';
import { useBrowserNotifications } from '../hooks/useBrowserNotifications';
import { User } from 'lucide-react';

export default function Layout({
  page,
  setPage,
  children,
  profile,
  authUser
}) {

  const notifications = useBrowserNotifications(authUser?.uid);
  const unreadCount = notifications.filter(item => !item.read).length;

  const nav = (item) => (

    <button
      key={item[0]}
      className={
        page === item[0]
          ? 'active'
          : ''
      }
      onClick={() => {

        // ＋出品を押した時は
        // リクエストの自動入力情報を消す
        if (item[0] === 'create') {

          localStorage.removeItem(
            'selectedRequest'
          );

          localStorage.removeItem(
            'fromRequest'
          );

        }

        setPage(item[0]);

      }}
    >

     <span className={item[0] === 'requests' ? 'request-nav-icon' : ''}>
  {item[0] === 'profile'
    ? <User size={20} />
    : item[1]}
</span>

      {item[2]}{item[0] === 'profile' && unreadCount > 0 && <b className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</b>}

    </button>

  );


  return (

    <div className="app-shell">

      <aside>

        <div className="brand">
          IB <em>Skill</em>
          <br />
          Exchange
        </div>


        <nav>
          {NAV_ITEMS.map(nav)}
        </nav>


        <div className="sidebar-user">

          {profile?.username}

          <small>
            {profile?.classId}
            {' · '}
            {profile?.currentCoins ?? 0}
            {' coins'}
          </small>

        </div>

      </aside>


      <main>
        {children}
      </main>


      <nav className="bottom-nav">

        {NAV_ITEMS.map(nav)}

      </nav>


    </div>

  );

}
