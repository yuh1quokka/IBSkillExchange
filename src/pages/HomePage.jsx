import { useMemo, useState } from 'react';
import { CATEGORIES } from '../constants/options';
import { listenSkills } from '../services/skillService';
import { reserveSkill, listenBookings } from '../services/bookingService';
import { useRealtime } from '../hooks/useRealtime';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import SkillCard from '../components/SkillCard';

export default function HomePage({ setPage }) {
  const { profile } = useAuth();
  const showToast = useToast();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');


  const { data: skills = [], error } = useRealtime(
    (ok, fail) => listenSkills(profile.classId, ok, fail),
    [profile.classId]
  );


  const { data: bookings } = useRealtime(
    (ok, fail) => listenBookings(profile.uid, ok, fail),
    [profile.uid]
  );


  const myBookings = bookings?.made || [];


  const filtered = useMemo(
    () =>
      (skills ?? []).filter(
        s =>
          (!category || s.category === category) &&
          (!search ||
            `${s.title} ${s.subject} ${s.description}`
              .toLowerCase()
              .includes(search.toLowerCase())) &&
          (!date ||
            s.availableDate === date)
      ),
    [skills, search, category, date]
  );


  const reserve = async skill => {
    try {
      await reserveSkill(skill, profile);
      showToast('予約を受け付けました。完了時にコインが移動します。');
    } catch (e) {
      showToast(e.message || '予約に失敗しました。', 'error');
    }
  };
  const editSkill = skill => { localStorage.setItem('editingSkill', JSON.stringify(skill)); setPage('create'); };


  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">{profile.classId} CLASS</p>
          <h1>こんにちは、{profile.username}さん</h1>
          <p>みんなの得意から、次の一歩を見つけよう。</p>
        </div>

        <div className="coin-balance">
          ◉ <b>{profile.currentCoins}</b>
          <small>Current Coins</small>
        </div>
      </header>


      <section className="search-panel">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="スキル・教科を検索"
        />

        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          <option value="">すべてのカテゴリー</option>
          {CATEGORIES.map(x => (
            <option key={x}>{x}</option>
          ))}
        </select>

        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </section>


      <section className="section-heading">
        <div>
          <h2>スキルを探す</h2>
          <p>{filtered.length}件のスキル</p>
        </div>

        <button
          className="outline"
          onClick={() => setPage('ranking')}
        >
          ランキングを見る
        </button>
      </section>


      {error && (
        <p className="message error">
          {error}
        </p>
      )}


      <div className="skill-grid">

        {filtered.map(s => (
          <SkillCard
            key={s.id}
            skill={s}
            onReserve={reserve}
            onEdit={s.userId === profile.uid ? editSkill : undefined}
            reserved={
              myBookings.some(
                b => b.skillId === s.id
              )
            }
          />
        ))}


        {!filtered.length && (
          <div className="empty">
            条件に合うスキルはまだありません。最初の出品者になりませんか？
          </div>
        )}

      </div>
    </>
  );
}
