import { useAuth } from '../contexts/AuthContext';
import { useRealtime } from '../hooks/useRealtime';
import { deleteRequest, listenRequests } from '../services/requestService';
import { useToast } from '../contexts/ToastContext';
import { listenClassSkills } from '../services/skillService';

export default function RequestsPage({ setPage }) {

  const { profile } = useAuth();
  const toast = useToast();

  const { data, error } = useRealtime(
    (ok, fail) => listenRequests(profile.classId, ok, fail),
    [profile.classId]
  );
  const { data: skillsData } = useRealtime((ok, fail) => listenClassSkills(profile.classId, ok, fail), [profile.classId]);

  const skills = skillsData ?? [];
  const requests = (data ?? []).filter(request => {
    const answeredSkill = request.skillId ? skills.find(skill => skill.id === request.skillId) : null;
    return !answeredSkill || !(answeredSkill.currentStudents > 0);
  });
  const editRequest = request => { localStorage.setItem('editingRequest', JSON.stringify(request)); setPage('createRequest'); };
  const removeRequest = async request => {
    if (!window.confirm('このリクエストを削除しますか？')) return;
    try { await deleteRequest(request.id, profile); toast('リクエストを削除しました。'); } catch (error) { toast(error.message || '削除に失敗しました。', 'error'); }
  };

  return (
    <>
      <header className="page-header">

        <div>
          <p className="eyebrow">
            REQUEST BOARD
          </p>

          <h1>教えてほしいこと</h1>

          <p>
            困っている人を助けよう！
          </p>
        </div>

        <button
          className="primary"
          onClick={() => setPage('createRequest')}
        >
          ＋ 投稿する
        </button>

      </header>

      {error && (
        <p className="message error">
          {error}
        </p>
      )}

      <div className="skill-grid">

        {requests.map(r => (

          <article
            key={r.id}
            className="skill-card"
          >

            <div className="card-top">

              <span className="tag">
                {r.category}
              </span>

              <span className="coin">
                ◉ {r.reward}
              </span>

            </div>

            <h3>{r.title}</h3>

            <p className="muted">
              {r.subject}
            </p>

            <p>{r.description}</p>

            <div className="available">

              <strong>📅 希望日時</strong>

              <div style={{ marginTop: '4px' }}>
                {r.preferredSchedule}
              </div>

            </div>

            <footer>

              <span>
                by {r.userName}
              </span>

              {r.userId === profile.uid ? (
                <div className="card-actions"><button className="outline" onClick={() => editRequest(r)}>編集</button><button className="outline danger" onClick={() => removeRequest(r)}>削除</button></div>
              ) : r.skillId ? (

                <button disabled>
                  出品済み
                </button>

              ) : (
<button
  onClick={() => {

    console.log('clicked request', r);

    localStorage.setItem(
      'selectedRequest',
      JSON.stringify(r)
    );

    console.log(
      'saved',
      localStorage.getItem('selectedRequest')
    );

    localStorage.setItem(
  'fromRequest',
  'true'
);

    setPage('create');

  }}
>
  このリクエストに出品する
</button>

              )}

            </footer>

          </article>

        ))}

        {!requests.length && (

          <div className="empty">
            まだ投稿がありません。
          </div>

        )}

      </div>

    </>
  );

}
