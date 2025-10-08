#!/usr/bin/env python
# flake8: noqa
# pylint: disable=import-outside-toplevel,broad-exception-caught,no-member
import os
import sys
import django


def main():
    # Setup Django
    sys.path.insert(0, ".")
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "trashtrotreasure.settings")
    try:
        django.setup()
    except Exception as exc:  # pragma: no cover - dev helper script
        print("Error setting up Django. Make sure you're running this from the backend folder and your virtualenv is active.")
        print(str(exc))
        sys.exit(1)

    # The imports below must occur after Django setup. Mark with noqa to avoid
    # flake8 E402 complaints for this helper script.
    from accounts.models import User  # noqa: E402
    from waste_management.models import WasteListing, Transaction  # noqa: E402
    from messaging.models import Conversation, Message, Notification  # noqa: E402

    print("=== TRASHTROTREASURE BACKEND OVERVIEW ===")
    print()

    print("📱 ACCOUNTS APPLICATION:")
    try:
        total_users = User.objects.count()
        print(f"   Total Users: {total_users}")
        for user in User.objects.all()[:20]:
            role = getattr(user, "get_role_display", lambda: "")()
            print(f"   • {user.username} ({role}) - {user.email}")
            phone = getattr(user, "phone", "N/A")
            location = getattr(user, "location", "N/A")
            print(f"     Phone: {phone} | Location: {location}")
        if total_users > 20:
            print(f"   ...and {total_users - 20} more users")
    except Exception as exc:
        print("   Could not fetch users:", exc)
    print()

    print("♻️  WASTE MANAGEMENT APPLICATION:")
    try:
        total_listings = WasteListing.objects.count()
        print(f"   Total Waste Listings: {total_listings}")
        qs = WasteListing.objects.select_related("user")[:20]
        for listing in qs:
            type_display = getattr(listing, "get_type_display", lambda: "")()
            print(f"   • {listing.title} ({type_display})")
            price = getattr(listing, "price_per_unit", "N/A")
            unit = getattr(listing, "unit", "")
            qty = getattr(listing, "quantity", "N/A")
            print(f"     Price: ${price}/{unit} | Qty: {qty} {unit}")
            status = getattr(listing, "get_status_display", lambda: "")()
            posted_by = listing.user.username if getattr(listing, "user", None) else "N/A"
            print(f"     Status: {status} | Posted by: {posted_by}")
            print(f"     Location: {getattr(listing, 'location', 'N/A')}")
        if total_listings > 20:
            print(f"   ...and {total_listings - 20} more listings")
    except Exception as exc:
        print("   Could not fetch listings:", exc)
    print()

    try:
        total_tx = Transaction.objects.count()
        print(f"   Total Transactions: {total_tx}")
        tx_qs = Transaction.objects.select_related("listing", "buyer", "seller")[:20]
        for transaction in tx_qs:
            listing_title = transaction.listing.title if transaction.listing else "N/A"
            print(f"   • {listing_title} - ${getattr(transaction, 'total_amount', 'N/A')}")
            buyer = transaction.buyer.username if getattr(transaction, 'buyer', None) else 'N/A'
            seller = transaction.seller.username if getattr(transaction, 'seller', None) else 'N/A'
            print(f"     Buyer: {buyer} | Seller: {seller}")
            print(f"     Status: {getattr(transaction, 'get_status_display', lambda: '')()}")
        if total_tx > 20:
            print(f"   ...and {total_tx - 20} more transactions")
    except Exception as exc:
        print("   Could not fetch transactions:", exc)
    print()

    print("💬 MESSAGING APPLICATION:")
    try:
        total_convos = Conversation.objects.count()
        print(f"   Total Conversations: {total_convos}")
        convo_qs = Conversation.objects.prefetch_related("participants")[:20]
        for convo in convo_qs:
            participants = [p.username for p in convo.participants.all()]
            if len(participants) >= 2:
                print(f"   • Conversation between: {participants[0]} and {participants[1]}")
            else:
                print(f"   • Conversation: {participants[0] if participants else 'Empty'}")

        print(f"   Total Messages: {Message.objects.count()}")
        for msg in Message.objects.select_related("sender")[:3]:
            sender = msg.sender.username if getattr(msg, 'sender', None) else 'N/A'
            print(f"   • From {sender}: {getattr(msg, 'content', '')[:50]}...")

        print(f"   Total Notifications: {Notification.objects.count()}")
        for notif in Notification.objects.select_related("user")[:3]:
            user_name = notif.user.username if getattr(notif, 'user', None) else 'N/A'
            print(f"   • To {user_name}: {getattr(notif, 'title', '')}")
    except Exception as exc:
        print("   Could not fetch messaging data:", exc)


if __name__ == "__main__":
    main()
