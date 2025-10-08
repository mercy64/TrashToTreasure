# Quick Start Guide

## TrashToTreasure User Notification Service

This guide will help you quickly set up and run the notification service.

### Backend Setup (5 minutes)

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and update the SECRET_KEY if needed.

5. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

6. **Create a superuser (to access admin panel):**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start the server:**
   ```bash
   python manage.py runserver
   ```

The backend will be running at `http://localhost:8000`

### Frontend Setup (3 minutes)

1. **Open a new terminal and navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

The frontend will be running at `http://localhost:3000`

### Testing the Notification Service

1. **Access the Django Admin Panel:**
   - Navigate to `http://localhost:8000/admin`
   - Log in with the superuser credentials you created
   - Go to "Notifications" section

2. **Create a test notification:**
   - Click "Add Notification"
   - Select your user
   - Choose a notification type (e.g., "pickup_scheduled")
   - Enter a title and message
   - Select priority
   - Click "Save"

3. **View notifications in the frontend:**
   - The notification should appear automatically in the React app at `http://localhost:3000`
   - You can mark it as read, filter by unread, or mark all as read

### API Endpoints

All endpoints require authentication. Base URL: `http://localhost:8000/api/notifications/`

- `GET /` - List all notifications
- `POST /` - Create a notification
- `GET /{id}/` - Get specific notification
- `PUT /{id}/` - Update notification
- `DELETE /{id}/` - Delete notification
- `POST /{id}/mark_read/` - Mark as read
- `GET /unread/` - Get unread notifications
- `GET /unread_count/` - Get unread count
- `POST /mark_all_read/` - Mark all as read

### Running Tests

**Backend tests:**
```bash
cd backend
source venv/bin/activate
python manage.py test notifications
```

### Troubleshooting

**Port already in use:**
- Backend: `python manage.py runserver 8080`
- Frontend: Set PORT environment variable: `PORT=3001 npm start`

**CORS errors:**
- Make sure both servers are running
- Check `CORS_ALLOWED_ORIGINS` in `backend/config/settings.py`

**Database errors:**
- Delete `db.sqlite3` and run migrations again
- Make sure you're in the virtual environment

### Next Steps

- Customize notification types in `backend/notifications/models.py`
- Add authentication to the frontend
- Implement real-time notifications with WebSockets
- Add email notifications
- Integrate with waste pickup scheduling system
