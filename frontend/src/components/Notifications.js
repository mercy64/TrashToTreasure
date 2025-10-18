import React, { useEffect, useState, useRef } from 'react';
import { messageAPI } from '../services/api';
import './Notifications.css';

function useNotificationsSocket(onMessage) {
  const wsRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    // Only attempt a websocket connection when an explicit WS host is configured.
    // Falling back to a default host (127.0.0.1:8001) caused the dev server
    // to attempt connections to ws://localhost:<dev-port>/ws which fails and
    // spams the console when no websocket server is available.
    const wsHost = process.env.REACT_APP_API_WS_HOST || window.__API_WS_HOST__ || null;
    if (!wsHost) return;

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const url = `${protocol}://${wsHost}/ws/notifications/?token=${token}`;

    try {
      const ws = new WebSocket(url);
      ws.onopen = () => {
        if (process.env.REACT_APP_DEBUG_WS === 'true') console.log('Notifications socket connected');
      };
      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          onMessage && onMessage(data);
        } catch (e) {
          // ignore
        }
      };
      ws.onclose = () => {
        if (process.env.REACT_APP_DEBUG_WS === 'true') console.log('Notifications socket closed');
      };
      wsRef.current = ws;
      return () => {
        try { ws.close(); } catch (e) {}
      };
    } catch (e) {
      // ignore websocket failures (development fallback)
    }
  }, [onMessage]);
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let mounted = true;
    messageAPI.getNotifications()
      .then((res) => {
        if (mounted) setNotifications(res.data || []);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  useNotificationsSocket((payload) => {
    // Prepend realtime notification
    setNotifications((prev) => [payload, ...prev]);
  });

  if (!notifications.length) {
    return <div>No notifications</div>;
  }

  const markRead = (id) => {
    messageAPI.markNotificationRead(id).then(() => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    }).catch(() => {});
  };

  return (
    <div className="notifications">
      <h3>Notifications</h3>
      <ul>
        {notifications.map((n) => (
          <li key={n.id} className={n.is_read ? 'read' : 'unread'}>
            <div className="notif-header">
              <strong>{n.title}</strong>
              {!n.is_read && (
                <button className="mark-read" onClick={() => markRead(n.id)}>Mark read</button>
              )}
            </div>
            <div className="notif-body">{n.message}</div>
            <small className="notif-date">{new Date(n.created_at).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
