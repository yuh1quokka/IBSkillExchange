import { useAuth } from '../contexts/AuthContext';
import { useRealtime } from '../hooks/useRealtime';
import { listenHistories } from '../services/userService';
import { formatDate } from '../utils/helpers';

export default function HistoryPage() {
  const { authUser } = useAuth();

  const { data, error } = useRealtime(
    (ok, fail) => listenHistories(authUser.uid, ok, fail),
    [authUser.uid]
  );

  const rows = data ?? [];

  return (
    <>
      <header className="simple-header">
        <p className="eyebrow">PRIVATE</p>
        <h1>コイン履歴</h1>
        <p>あなた自身だけが閲覧できる履歴です。</p>
      </header>

      {error && <p className="message error">{error}</p>}

      <div className="history">
        {rows.map(h => (
          <article key={h.id}>
            <div>
              <b>{h.description}</b>
              <small>{formatDate(h.createdAt)}</small>
            </div>

            <strong className={h.amount > 0 ? 'plus' : 'minus'}>
              {h.amount > 0 ? '+' : ''}
              {h.amount} ◉
            </strong>
          </article>
        ))}

        {!rows.length && (
          <div className="empty">
            コインの履歴はまだありません。
          </div>
        )}
      </div>
    </>
  );
}