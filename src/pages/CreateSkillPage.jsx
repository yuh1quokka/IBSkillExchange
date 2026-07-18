import { useMemo, useState } from 'react';
import { CATEGORIES } from '../constants/options';
import { createSkill, updateSkill } from '../services/skillService';
import { answerRequest } from '../services/requestService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { formatTimeRange } from '../utils/helpers';

const emptyForm = { title: '', subject: '', category: 'Biology', description: '', price: '', duration: '', maxStudents: 1, availableDate: '', startTime: '' };

function getRequestDraft() {
  if (localStorage.getItem('fromRequest') !== 'true') return null;
  try { return JSON.parse(localStorage.getItem('selectedRequest') || 'null'); } catch { return null; }
}
function getEditingSkill() { try { return JSON.parse(localStorage.getItem('editingSkill') || 'null'); } catch { return null; } }

export default function CreateSkillPage({ setPage }) {
  // This is evaluated only when the page is opened. Navigation's normal "＋ 出品"
  // clears both flags, therefore only the request action can populate this draft.
  const [request] = useState(getRequestDraft);
  const [editingSkill] = useState(getEditingSkill);
  const [form, setForm] = useState(() => editingSkill ? { ...emptyForm, ...editingSkill, price: editingSkill.price ?? '', duration: editingSkill.duration ?? '', maxStudents: editingSkill.maxStudents ?? 1 } : request ? { ...emptyForm, title: request.title || '', subject: request.subject || '', category: request.category || 'Biology', description: request.description || '', price: request.reward ?? '' } : emptyForm);
  const [busy, setBusy] = useState(false);
  const { profile } = useAuth();
  const toast = useToast();
  const endTime = useMemo(() => form.startTime && Number(form.duration) >= 15 ? formatTimeRange(form.startTime, form.duration).split('〜')[1] : '—', [form.startTime, form.duration]);
  const update = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  const clearRequestDraft = () => { localStorage.removeItem('selectedRequest'); localStorage.removeItem('fromRequest'); };

  const submit = async event => {
    event.preventDefault();
    setBusy(true);
    try {
      if (editingSkill) await updateSkill(editingSkill.id, form, profile);
      else { const skillRef = await createSkill(form, profile); if (request) await answerRequest(request, skillRef.id, profile.username); }
      clearRequestDraft();
      localStorage.removeItem('editingSkill');
      toast(editingSkill ? 'スキルを更新しました！' : request ? 'リクエストに回答してスキルを出品しました！' : 'スキルを出品しました！');
      setPage('home');
    } catch (error) {
      toast(error.message || '出品に失敗しました。', 'error');
    } finally { setBusy(false); }
  };

  return <section className="form-page">
    <p className="eyebrow">{editingSkill ? 'EDIT SKILL' : request ? 'ANSWER A REQUEST' : 'SHARE YOUR STRENGTH'}</p>
    <h1>{editingSkill ? 'スキルを編集する' : request ? 'リクエストに出品する' : 'スキルを出品する'}</h1>
    <p>{request ? 'リクエスト内容をもとに、学び合いの予定を登録します。' : 'あなたの得意を、クラスメイトの次の一歩につなげよう。'}</p>
    <form className="form-card" onSubmit={submit}>
      <label>タイトル<input required name="title" value={form.title} onChange={update} placeholder="例：HL Biologyの遺伝問題を一緒に解こう" /></label>
      <div className="two-col"><label>教科<input required name="subject" value={form.subject} onChange={update} placeholder="例：Biology HL" /></label><label>カテゴリー<select name="category" value={form.category} onChange={update}>{CATEGORIES.map(category => <option key={category}>{category}</option>)}</select></label></div>
      <label>説明<textarea required name="description" value={form.description} onChange={update} placeholder="一緒に取り組む内容や、事前に準備してほしいこと" rows="4" /></label>
      <div className="two-col"><label>必要コイン<input required min="1" step="1" type="number" inputMode="numeric" name="price" value={form.price} onChange={update} /></label><label>募集人数<input required min="1" step="1" type="number" inputMode="numeric" name="maxStudents" value={form.maxStudents} onChange={update} /></label></div>
      <div className="two-col"><label>日付<input required type="date" name="availableDate" value={form.availableDate} onChange={update} /></label><label>開始時間<input required type="time" name="startTime" value={form.startTime} onChange={update} /></label></div>
      <div className="two-col"><label>所要時間（分）<input required min="15" step="1" type="number" inputMode="numeric" name="duration" value={form.duration} onChange={update} placeholder="例：45" /></label><label>終了時間<input className="computed-input" value={endTime} readOnly aria-label="自動計算された終了時間" /></label></div>
      <button className="primary wide" disabled={busy}>{busy ? '保存中…' : editingSkill ? '変更を保存' : '出品する'}</button>
    </form>
  </section>;
}
