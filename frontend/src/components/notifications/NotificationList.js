import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NotificationList.css';

const NotificationList = ({ apiUrl = 'http://localhost:8000/api/notifications/' }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [showUnreadOnly]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const endpoint = showUnreadOnly ? `${apiUrl}unread/` : apiUrl;
      const response = await axios.get(endpoint);
      setNotifications(response.data.results || response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(`${apiUrl}unread_count/`);
      setUnreadCount(response.data.count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.post(`${apiUrl}${notificationId}/mark_read/`);
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post(`${apiUrl}mark_all_read/`);
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const getPriorityClass = (priority) => {
    return `priority-${priority}`;
  };

  const getNotificationIcon = (type) => {
    const icons = {
      pickup_scheduled: '📅',
      pickup_completed: '✅',
      pickup_cancelled: '❌',
      payment_received: '💰',
      system_alert: '🔔',
    };
    return icons[type] || '📬';
  };

  if (loading) {
    return <div className="notification-loading">Loading notifications...</div>;
  }

  if (error) {
    return <div className="notification-error">{error}</div>;
  }

  return (
    <div className="notification-container">
      <div className="notification-header">
        <h2>Notifications</h2>
        <div className="notification-actions">
          <span className="unread-badge">{unreadCount} unread</span>
          <button
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className="filter-btn"
          >
            {showUnreadOnly ? 'Show All' : 'Show Unread'}
          </button>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="mark-all-btn">
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      <div className="notification-list">
        {notifications.length === 0 ? (
          <div className="no-notifications">
            {showUnreadOnly ? 'No unread notifications' : 'No notifications'}
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${
                notification.is_read ? 'read' : 'unread'
              } ${getPriorityClass(notification.priority)}`}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.notification_type)}
              </div>
              <div className="notification-content">
                <h3 className="notification-title">{notification.title}</h3>
                <p className="notification-message">{notification.message}</p>
                <span className="notification-time">
                  {new Date(notification.created_at).toLocaleString()}
                </span>
              </div>
              {!notification.is_read && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="mark-read-btn"
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationList;
