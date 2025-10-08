# TrashToTreasure 🗂️♻️

A comprehensive waste management platform that connects waste generators with collectors and recyclers, promoting sustainable waste disposal and resource recovery.

## 🌟 Features

- **User Authentication**: Secure registration and login system with JWT
- **Waste Listings**: Create and browse waste disposal/pickup requests
- **Real-time Messaging**: Communication between users with conversations
- **Transaction Tracking**: Monitor waste purchase transactions
- **Dashboard**: Comprehensive overview of user activities
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern UI**: Clean, professional interface with custom blue theme
- **Admin Panel**: Complete Django admin interface for platform management

## 🛠️ Technology Stack

### Frontend
- **React.js 18**: Modern frontend framework
- **Redux Toolkit**: State management
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework with custom blue theme
- **Axios**: HTTP client for API calls

### Backend
- **Django 5.2.7**: Python web framework
- **Django REST Framework**: API development
- **JWT Authentication**: Secure token-based auth
- **SQLite**: Database (development)
- **CORS**: Cross-origin resource sharing

## 🚀 Prerequisites
- **Node.js** (v14 or higher) - For React frontend
- **Python 3.8+** (Download from https://python.org)
- **npm** or **yarn** - For package management
- **Git** - For version control

## 🏃‍♂️ Quick Start

### Frontend Setup (React)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The React app will run on `http://localhost:3001`

### Backend Setup (Django)

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Setup database
python manage.py makemigrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Start development server
python manage.py runserver 127.0.0.1:8001
```

The Django API will run on `http://127.0.0.1:8001`

### Access Points
- **Frontend**: http://localhost:3001
- **Backend API**: http://127.0.0.1:8001
- **Admin Panel**: http://127.0.0.1:8001/admin/

## 📁 Project Structure

```
TrashToTreasure/
├── frontend/                 # React.js frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── auth/        # Authentication components
│   │   │   └── layout/      # Layout components
│   │   ├── pages/          # Page components
│   │   │   ├── auth/        # Login, Register pages
│   │   │   ├── waste/       # Waste listing pages
│   │   │   └── admin/       # Admin pages
│   │   ├── services/       # API services
│   │   ├── store/          # Redux store
│   │   │   └── slices/      # Redux slices
│   │   └── utils/          # Utility functions
│   ├── public/
│   ├── package.json
│   └── tailwind.config.js
├── backend/                 # Django backend
│   ├── accounts/           # User authentication
│   ├── messaging/          # Real-time messaging
│   ├── waste_management/   # Waste listings
│   ├── trashtrotreasure/   # Main Django app
│   ├── requirements.txt
│   └── manage.py
├── docs/                   # Documentation
├── database/              # Database setup
└── README.md
```

## 🎨 Design System

The application uses a custom blue color palette:
- **Primary Light**: `#e4f1fe` - Light backgrounds and hover states
- **Primary**: `#8dc6ff` - Main brand color for buttons and accents
- **Primary Dark**: `#22313f` - Text and dark elements
- **Secondary**: `#34495e` - Secondary text and borders

## 🔗 API Endpoints

## Quick Start

### 1. Install Python
If you don't have Python installed:
- Download from https://python.org/downloads/
- During installation, check "Add Python to PATH"
- Restart your terminal after installation

### 2. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3. Setup Environment Variables
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings (optional for development)
```

### 4. Setup Database
```bash
# Create and apply migrations
python manage.py makemigrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser
```

### 5. Run Development Server
```bash
python manage.py runserver
```

### 6. Access Admin Panel
- Navigate to: http://localhost:8000/admin/
- Login with superuser credentials
- Manage all data through Django Admin

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login user
- `GET /api/auth/profile/` - Get user profile (authenticated)

### Waste Management
- `GET /api/waste/listings/` - Get all waste listings (with filters)
- `POST /api/waste/listings/create/` - Create new listing (authenticated)
- `GET /api/waste/listings/my/` - Get my listings (authenticated)
- `GET /api/waste/transactions/my/` - Get my transactions (authenticated)

### Messaging
- `GET /api/messaging/conversations/` - Get my conversations (authenticated)
- `POST /api/messaging/messages/send/` - Send message (authenticated)
- `GET /api/messaging/conversations/<id>/messages/` - Get conversation messages
- `GET /api/messaging/notifications/` - Get my notifications (authenticated)

## Current Features
- ✅ Custom User model with roles (waste_generator, buyer, delivery, admin)
- ✅ Waste listings with images, location, pricing
- ✅ Transaction tracking system
- ✅ Messaging system with conversations
- ✅ Notification system
- ✅ Django Admin interface for all models
- ✅ REST API with JWT authentication
- ✅ SQLite database (development ready)

## Models Overview

### User Management
- **User**: Custom user with roles and verification
- **UserProfile**: Extended user information (auto-created)

### Waste Management
- **WasteListing**: Waste materials with type, quantity, location, pricing
- **WasteImage**: Images for waste listings
- **Transaction**: Purchase transactions between users

### Messaging
- **Conversation**: Chat conversations between users
- **Message**: Individual messages with read status
- **Notification**: System notifications for users

## 👥 User Roles
- **Waste Generator**: Lists recyclable materials
- **Buyer/Recycler**: Purchases waste materials  
- **Delivery Personnel**: Handles logistics
- **Administrator**: Platform management

## 🛠️ Development Setup

### Environment Variables
Create a `.env` file in the backend directory:
```bash
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3001
```

### Database Migration
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

## 🚀 Deployment

### Frontend (Netlify/Vercel)
```bash
cd frontend
npm run build
# Deploy the build folder
```

### Backend (Railway/Heroku)
```bash
# Add to requirements.txt for production
gunicorn
psycopg2-binary  # For PostgreSQL
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Future Enhancements

- [ ] Google Maps integration for location services
- [ ] M-Pesa payment integration
- [ ] Firebase real-time notifications
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Email notifications
- [ ] Image compression and optimization
- [ ] Advanced search and filtering
- [ ] Rating and review system

## 📧 Contact

Project Link: [https://github.com/YOUR_USERNAME/TrashToTreasure](https://github.com/YOUR_USERNAME/TrashToTreasure)

---

**Built with ❤️ for a sustainable future**"# Trash-to-treasure" 
