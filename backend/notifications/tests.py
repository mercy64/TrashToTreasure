from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from .models import Notification


class NotificationModelTest(TestCase):
    """Test cases for the Notification model."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.notification = Notification.objects.create(
            user=self.user,
            notification_type='pickup_scheduled',
            title='Test Notification',
            message='This is a test notification',
            priority='high'
        )
    
    def test_notification_creation(self):
        """Test that a notification is created correctly."""
        self.assertEqual(self.notification.user, self.user)
        self.assertEqual(self.notification.notification_type, 'pickup_scheduled')
        self.assertEqual(self.notification.title, 'Test Notification')
        self.assertEqual(self.notification.message, 'This is a test notification')
        self.assertEqual(self.notification.priority, 'high')
        self.assertFalse(self.notification.is_read)
        self.assertIsNone(self.notification.read_at)
    
    def test_notification_str(self):
        """Test the string representation of a notification."""
        expected_str = f"{self.user.username} - {self.notification.title}"
        self.assertEqual(str(self.notification), expected_str)
    
    def test_mark_as_read(self):
        """Test marking a notification as read."""
        self.assertFalse(self.notification.is_read)
        self.assertIsNone(self.notification.read_at)
        
        self.notification.mark_as_read()
        
        self.assertTrue(self.notification.is_read)
        self.assertIsNotNone(self.notification.read_at)
    
    def test_mark_as_read_idempotent(self):
        """Test that marking as read multiple times doesn't change read_at."""
        self.notification.mark_as_read()
        first_read_at = self.notification.read_at
        
        # Mark as read again
        self.notification.mark_as_read()
        
        # read_at should remain the same
        self.assertEqual(self.notification.read_at, first_read_at)
    
    def test_notification_ordering(self):
        """Test that notifications are ordered by created_at descending."""
        # Create another notification
        newer_notification = Notification.objects.create(
            user=self.user,
            notification_type='pickup_completed',
            title='Newer Notification',
            message='This is newer',
            priority='medium'
        )
        
        notifications = Notification.objects.all()
        self.assertEqual(notifications[0], newer_notification)
        self.assertEqual(notifications[1], self.notification)
