import { useEffect, useRef, useState } from 'react';
import { listenNotifications } from '../services/notificationService';

export function useBrowserNotifications(uid) {
  const [notifications, setNotifications] = useState([]);
  const initialized = useRef(false);
  const knownIds = useRef(new Set());

  useEffect(() => {
    if (!uid) return undefined;
    return listenNotifications(uid, rows => {
      if (initialized.current && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        rows.filter(row => !row.read && !knownIds.current.has(row.id)).forEach(row => new Notification(row.title, { body: row.message }));
      }
      rows.forEach(row => knownIds.current.add(row.id));
      initialized.current = true;
      setNotifications(rows);
    }, () => setNotifications([]));
  }, [uid]);

  return notifications;
}
