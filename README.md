# TrashToTreasure
"Waste Management Platform - React Frontend &amp; Django Backend"

## Features

- **User Notification Service**: Real-time notification system for waste management operations
  - Pickup scheduling notifications
  - Pickup completion alerts
  - Payment confirmations
  - System alerts
  - Priority-based notifications (Low, Medium, High)
  - Mark as read functionality
  - Unread notification counter

## Project Structure

```
TrashToTreasure/
├── backend/                    # Django REST API
│   ├── config/                # Django project settings
│   ├── notifications/         # Notification app
│   │   ├── models.py         # Notification model
│   │   ├── views.py          # API endpoints
│   │   ├── serializers.py    # DRF serializers
│   │   ├── urls.py           # URL routing
│   │   └── admin.py          # Admin interface
│   ├── manage.py             # Django management script
│   └── requirements.txt      # Python dependencies
└── frontend/                  # React application
    ├── src/
    │   ├── components/
    │   │   └── notifications/ # Notification components
    │   ├── App.js            # Main App component
    │   └── index.js          # Entry point
    ├── public/
    └── package.json          # Node dependencies
```

## Backend Setup

### Prerequisites
- Python 3.8+
- pip

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

6. Create a superuser (optional):
```bash
python manage.py createsuperuser
```

7. Start the development server:
```bash
python manage.py runserver
```

The backend API will be available at `http://localhost:8000`

### API Endpoints

- `GET /api/notifications/` - List all notifications for the authenticated user
- `POST /api/notifications/` - Create a new notification
- `GET /api/notifications/{id}/` - Get a specific notification
- `PUT /api/notifications/{id}/` - Update a notification
- `DELETE /api/notifications/{id}/` - Delete a notification
- `POST /api/notifications/{id}/mark_read/` - Mark a notification as read
- `GET /api/notifications/unread/` - Get all unread notifications
- `GET /api/notifications/unread_count/` - Get count of unread notifications
- `POST /api/notifications/mark_all_read/` - Mark all notifications as read

## Frontend Setup

### Prerequisites
- Node.js 14+
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

### Build for production:
```bash
npm run build
```

## Usage

### Creating Notifications (Backend)

You can create notifications through the Django admin interface or programmatically:

```python
from notifications.models import Notification
from django.contrib.auth.models import User

user = User.objects.get(username='john')
notification = Notification.objects.create(
    user=user,
    notification_type='pickup_scheduled',
    title='Pickup Scheduled',
    message='Your waste pickup has been scheduled for tomorrow at 9 AM',
    priority='high'
)
```

### Displaying Notifications (Frontend)

The `NotificationList` component automatically fetches and displays notifications:

```jsx
import NotificationList from './components/notifications/NotificationList';

function App() {
  return (
    <div>
      <NotificationList apiUrl="http://localhost:8000/api/notifications/" />
    </div>
  );
}
```

## Notification Types

- **pickup_scheduled**: Waste pickup has been scheduled
- **pickup_completed**: Waste pickup has been completed
- **pickup_cancelled**: Scheduled pickup has been cancelled
- **payment_received**: Payment has been processed
- **system_alert**: General system notifications

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
