import { useEffect, useState } from 'react';

export function useRealtime(subscribe, dependencies = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError('');

    const unsub = subscribe(
      value => {
        console.log('Realtime data:', value);
        setData(value);
        setLoading(false);
      },
      err => {
        console.error('Realtime error:', err);
        setError(err?.message || 'データの同期に失敗しました。');
        setLoading(false);
      }
    );

    return unsub;
  }, dependencies);

  return { data, error, loading };
}