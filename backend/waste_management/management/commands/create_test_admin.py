from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Create a safe test admin user for development'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, default='devadmin')
        parser.add_argument('--email', type=str, default='devadmin@example.com')
        parser.add_argument('--password', type=str, default='password')
        parser.add_argument('--phone', type=str, default=None)

    def handle(self, *args, **options):
        from django.contrib.auth import get_user_model
        import random
        from django.db import IntegrityError
        User = get_user_model()
        username = options['username']
        email = options['email']
        password = options['password']
        phone = options.get('phone')

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f'User {username} already exists'))
            return

        # Try to create the user; generate a unique phone before creating to avoid
        # UNIQUE constraint failures. We'll construct the User instance directly so
        # phone (if present) is saved on first insert.
        attempts = 0
        while attempts < 10:
            try:
                # Determine a phone to use
                if phone:
                    candidate_phone = phone
                else:
                    candidate_phone = f'+999{random.randint(1000000, 9999999)}'

                # Ensure uniqueness if the field exists
                try:
                    if User.objects.filter(phone=candidate_phone).exists():
                        attempts += 1
                        continue
                except Exception:
                    # If phone field doesn't exist on the model, ignore uniqueness checks
                    pass

                # Create the user by instantiating so extra fields (phone) are present
                try:
                    user = User(username=username, email=email)
                    # set staff/superuser flags
                    try:
                        setattr(user, 'is_staff', True)
                        setattr(user, 'is_superuser', True)
                    except Exception:
                        # Some custom user models may not expose these attrs directly
                        pass
                    # set phone if the model supports it
                    try:
                        setattr(user, 'phone', candidate_phone)
                    except Exception:
                        pass
                    user.set_password(password)
                    user.save()
                except IntegrityError:
                    attempts += 1
                    # keep message short to avoid long lines
                    self.stdout.write(self.style.WARNING(f'Integrity error creating user (attempt {attempts}).'))
                    phone = None
                    continue

                # Try to set role if the attribute exists
                try:
                    setattr(user, 'role', 'admin')
                    user.save()
                except Exception:
                    # Role field may not exist on the user model; that's fine for dev-only helper
                    pass

                self.stdout.write(self.style.SUCCESS(f'Created admin user {username} (phone: {candidate_phone})'))
                return
            except Exception as exc:
                attempts += 1
                self.stdout.write(self.style.WARNING(f'Unexpected error (attempt {attempts}): {exc}'))

        self.stdout.write(self.style.ERROR('Failed to create admin user after multiple attempts'))
