import { useAuth } from '../contexts/AuthContext';
import { useRealtime } from '../hooks/useRealtime';
import { listenRanking } from '../services/userService';

export default function RankingPage() {
  const { profile } = useAuth();

  const { data, error } = useRealtime(
    (ok, fail) => listenRanking(profile.classId, ok, fail),
    [profile.classId]
  );

  const ranking = data ?? [];

  return (
    <>
      <header className="simple-header">
        <p className="eyebrow">{profile.classId} · THIS MONTH</p>
        <h1>Contribution Ranking</h1>
        <p>今月、教えることで得たコインのランキングです。</p>
      </header>

      {error && <p className="message error">{error}</p>}

      <div className="ranking">
        {ranking.map((user, i) => (
          <div className="rank-row" key={user.uid}>
            <strong className={'rank r' + i}>
              {i + 1}
            </strong>

            <span className="avatar">
              {user.username?.slice(0, 1)}
            </span>

            <b>
              {user.username}
              {user.uid === profile.uid && '（あなた）'}
            </b>

            <span>
              ◉ {user.monthlyContributionCoins || 0}
            </span>
          </div>
        ))}

        {!ranking.length && (
          <div className="empty">
            今月はまだ貢献の記録がありません。
          </div>
        )}
      </div>
    </>
  );
}