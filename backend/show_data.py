#!/usr/bin/env python
import os
import sys
import django

# Setup Django
sys.path.insert(0, ".")
os.environ["DJANGO_SETTINGS_MODULE"] = "trashtrotreasure.settings"
django.setup()

# The imports below must occur after Django setup. Mark with noqa to avoid
# flake8 E402 complaints for this helper script.
from accounts.models import User  # noqa: E402
from waste_management.models import WasteListing, Transaction  # noqa: E402
from messaging.models import Conversation, Message, Notification  # noqa: E402

print("=== TRASHTROTREASURE BACKEND OVERVIEW ===")
print()

print("📱 ACCOUNTS APPLICATION:")
print(f"   Total Users: {User.objects.count()}")
for user in User.objects.all():
    print(f"   • {user.username} ({user.get_role_display()}) - {user.email}")
    print(f"     Phone: {user.phone} | Location: {user.location}")
print()

print("♻️  WASTE MANAGEMENT APPLICATION:")
print(f"   Total Waste Listings: {WasteListing.objects.count()}")
for listing in WasteListing.objects.all():
    print(f"   • {listing.title} ({listing.get_type_display()})")
    print(f"     Price: ${listing.price_per_unit}/{listing.unit} | Qty: {listing.quantity} {listing.unit}")
    print(f"     Status: {listing.get_status_display()} | Posted by: {listing.user.username}")
    print(f"     Location: {listing.location}")
print()

print(f"   Total Transactions: {Transaction.objects.count()}")
for transaction in Transaction.objects.all():
    print(f"   • {transaction.listing.title} - ${transaction.total_amount}")
    print(f"     Buyer: {transaction.buyer.username} | Seller: {transaction.seller.username}")
    print(f"     Status: {transaction.get_status_display()}")
print()

print("💬 MESSAGING APPLICATION:")
print(f"   Total Conversations: {Conversation.objects.count()}")
for convo in Conversation.objects.all():
    participants = [p.username for p in convo.participants.all()]
    if len(participants) >= 2:
        print(f"   • Conversation between: {participants[0]} and {participants[1]}")
    else:
        print(f'   • Conversation: {participants[0] if participants else "Empty"}')

print(f"   Total Messages: {Message.objects.count()}")
for msg in Message.objects.all()[:3]:
    print(f"   • From {msg.sender.username}: {msg.content[:50]}...")

print(f"   Total Notifications: {Notification.objects.count()}")
for notif in Notification.objects.all()[:3]:
    print(f"   • To {notif.user.username}: {notif.title}")
