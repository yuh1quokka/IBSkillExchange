import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { createRequest, updateRequest } from '../services/requestService';
import { CATEGORIES } from '../constants/options';

const initial = {
  title: '',
  subject: '',
  category: 'Biology',
  description: '',
  reward: 10,
  preferredSchedule: ''
};

export default function CreateRequestPage({ setPage }) {
  const [editingRequest] = useState(() => { try { return JSON.parse(localStorage.getItem('editingRequest') || 'null'); } catch { return null; } });
  const [form, setForm] = useState(() => editingRequest ? { ...initial, ...editingRequest } : initial);
  const [busy, setBusy] = useState(false);

  const { profile } = useAuth();
  const toast = useToast();

  const update = e =>
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  const submit = async e => {

    e.preventDefault();

    setBusy(true);

    try {

      if (editingRequest) await updateRequest(editingRequest.id, form, profile);
      else await createRequest(form, profile);

      localStorage.removeItem('editingRequest');

      toast(editingRequest ? 'リクエストを更新しました！' : 'リクエストを投稿しました！');

      setPage('requests');

    } catch {

      toast(
        '投稿に失敗しました。',
        'error'
      );

    } finally {

      setBusy(false);

    }

  };

  return (

    <section className="form-page">

      <p className="eyebrow">{editingRequest ? 'EDIT REQUEST' : 'REQUEST HELP'}</p>

      <h1>{editingRequest ? 'リクエストを編集する' : '教えてほしいことを投稿'}</h1>

      <p>
        困っていることを書いてみよう。
      </p>

      <form
        className="form-card"
        onSubmit={submit}
      >

        <label>

          タイトル

          <input
            required
            name="title"
            value={form.title}
            onChange={update}
            placeholder="例：HL Chemistry"
          />

        </label>

        <div className="two-col">

          <label>

            教科

            <input
              required
              name="subject"
              value={form.subject}
              onChange={update}
            />

          </label>

          <label>

            カテゴリー

            <select
              name="category"
              value={form.category}
              onChange={update}
            >

              {CATEGORIES.map(c => (
                <option key={c}>
                  {c}
                </option>
              ))}

            </select>

          </label>

        </div>

        <label>

          内容

          <textarea
            required
            rows="4"
            name="description"
            value={form.description}
            onChange={update}
          />

        </label>

        <div className="two-col">

          <label>

            お礼コイン

            <input
              required
              min="1"
              type="number"
              name="reward"
              value={form.reward}
              onChange={update}
            />

          </label>

          <label>

            希望日時・時間帯

            <textarea
              required
              rows="3"
              name="preferredSchedule"
              value={form.preferredSchedule}
              onChange={update}
              placeholder={`例：
7/22 16:30〜17:30
放課後ならいつでも
昼休み希望`}
            />

          </label>

        </div>

        <button
          className="primary wide"
          disabled={busy}
        >

          {busy ? '保存中...' : editingRequest ? '変更を保存' : '投稿する'}

        </button>

      </form>

    </section>

  );

}
