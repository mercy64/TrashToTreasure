# API Usage Examples

## Using the Notification API

### Authentication

First, you need to authenticate. The API uses Django's session authentication by default.

```bash
# Create a user session
curl -X POST http://localhost:8000/admin/login/ \
  -d "username=your_username&password=your_password"
```

### Creating a Notification

```bash
curl -X POST http://localhost:8000/api/notifications/ \
  -H "Content-Type: application/json" \
  -d '{
    "notification_type": "pickup_scheduled",
    "title": "Pickup Scheduled for Tomorrow",
    "message": "Your waste pickup has been scheduled for tomorrow at 9:00 AM",
    "priority": "high"
  }'
```

### Listing All Notifications

```bash
curl -X GET http://localhost:8000/api/notifications/
```

### Getting Unread Notifications Only

```bash
curl -X GET http://localhost:8000/api/notifications/unread/
```

### Getting Unread Count

```bash
curl -X GET http://localhost:8000/api/notifications/unread_count/
```

### Marking a Notification as Read

```bash
curl -X POST http://localhost:8000/api/notifications/1/mark_read/
```

### Marking All Notifications as Read

```bash
curl -X POST http://localhost:8000/api/notifications/mark_all_read/
```

### Deleting a Notification

```bash
curl -X DELETE http://localhost:8000/api/notifications/1/
```

## Python Example

```python
import requests

# Base URL
BASE_URL = "http://localhost:8000/api/notifications/"

# Create a session
session = requests.Session()

# Login (if using session authentication)
# session.post('http://localhost:8000/admin/login/', 
#              data={'username': 'admin', 'password': 'password'})

# Create a notification
notification_data = {
    "notification_type": "pickup_completed",
    "title": "Pickup Completed",
    "message": "Your waste has been successfully collected",
    "priority": "medium"
}

response = session.post(BASE_URL, json=notification_data)
print(f"Created notification: {response.json()}")

# Get all notifications
response = session.get(BASE_URL)
notifications = response.json()
print(f"Total notifications: {len(notifications.get('results', []))}")

# Get unread count
response = session.get(f"{BASE_URL}unread_count/")
print(f"Unread notifications: {response.json()['count']}")

# Mark notification as read
notification_id = 1
response = session.post(f"{BASE_URL}{notification_id}/mark_read/")
print(f"Marked as read: {response.json()}")

# Mark all as read
response = session.post(f"{BASE_URL}mark_all_read/")
print(f"Result: {response.json()['message']}")
```

## JavaScript/React Example

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/notifications/';

// Create axios instance with credentials
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Create a notification
async function createNotification() {
  try {
    const response = await api.post('/', {
      notification_type: 'payment_received',
      title: 'Payment Processed',
      message: 'Your payment of $50 has been successfully processed',
      priority: 'low'
    });
    console.log('Created:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Get all notifications
async function getAllNotifications() {
  try {
    const response = await api.get('/');
    console.log('Notifications:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Get unread notifications
async function getUnreadNotifications() {
  try {
    const response = await api.get('/unread/');
    console.log('Unread:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Mark as read
async function markAsRead(id) {
  try {
    const response = await api.post(`/${id}/mark_read/`);
    console.log('Marked as read:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Mark all as read
async function markAllAsRead() {
  try {
    const response = await api.post('/mark_all_read/');
    console.log('Result:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## Notification Types

- `pickup_scheduled` - Waste pickup has been scheduled
- `pickup_completed` - Waste pickup has been completed
- `pickup_cancelled` - Scheduled pickup has been cancelled
- `payment_received` - Payment has been processed
- `system_alert` - General system notifications

## Priority Levels

- `low` - Low priority notification
- `medium` - Medium priority notification (default)
- `high` - High priority notification

## Response Format

```json
{
  "id": 1,
  "user": 1,
  "notification_type": "pickup_scheduled",
  "title": "Pickup Scheduled",
  "message": "Your waste pickup has been scheduled for tomorrow",
  "priority": "high",
  "is_read": false,
  "created_at": "2024-01-15T10:30:00Z",
  "read_at": null
}
```
