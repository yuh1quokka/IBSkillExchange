export const monthKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

export const formatDate = value => {

  if (!value) return '日時未設定';

  // 新しい保存形式
  if (typeof value === 'string') {

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? value
      : new Intl.DateTimeFormat('ja-JP', {
          dateStyle: 'medium'
        }).format(date);

  }

  // 古い保存形式
  const date = value.toDate
    ? value.toDate()
    : new Date(value);

  return Number.isNaN(date.getTime())
    ? '日時未設定'
    : new Intl.DateTimeFormat('ja-JP', {
        dateStyle: 'medium'
      }).format(date);

};

export const formatTimeRange = (
  startTime,
  duration = 0
) => {

  if (!startTime) return '時間未設定';

  const [h, m] = startTime.split(':');

  const start = new Date();

  start.setHours(
    Number(h),
    Number(m),
    0,
    0
  );

  const end = new Date(
    start.getTime() + Number(duration) * 60000
  );

  const pad = n =>
    String(n).padStart(2, '0');

  return `${pad(start.getHours())}:${pad(start.getMinutes())}〜${pad(end.getHours())}:${pad(end.getMinutes())}`;

};

export const errorMessage = error => {

  const map = {

    'auth/email-already-in-use':
      'このメールアドレスは既に登録されています。',

    'auth/invalid-credential':
      'メールアドレスまたはパスワードが違います。',

    'auth/weak-password':
      'パスワードは6文字以上にしてください。',

    'permission-denied':
      'この操作を行う権限がありません。'

  };

  return (
    map[error?.code] ||
    '通信に失敗しました。接続とFirebase設定を確認して、もう一度お試しください。'
  );

};

export const formatSkillSchedule = skill => {

  if (!skill.availableDate || !skill.startTime) {
    return '日時未設定';
  }

  const start = new Date(
    `${skill.availableDate}T${skill.startTime}`
  );

  const end = new Date(
    start.getTime() + Number(skill.duration) * 60000
  );


  const pad = n =>
    String(n).padStart(2,'0');


  return (
    `${skill.availableDate} ` +
    `${pad(start.getHours())}:${pad(start.getMinutes())}` +
    `〜` +
    `${pad(end.getHours())}:${pad(end.getMinutes())}`
  );

};