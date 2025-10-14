from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0002_deliveryprofile_generatorprofile_recyclerprofile"),
    ]

    operations = [
        migrations.CreateModel(
            name="RegistrationAttempt",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("ip_address", models.CharField(blank=True, max_length=45, null=True)),
                ("email", models.EmailField(blank=True, max_length=254, null=True)),
                ("phone", models.CharField(blank=True, max_length=32, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name="ProfileFlag",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("reason", models.TextField()),
                ("auto_flag", models.BooleanField(default=False)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("pending", "Pending"),
                            ("reviewed", "Reviewed"),
                            ("rejected", "Rejected"),
                        ],
                        default="pending",
                        max_length=20,
                    ),
                ),
                ("notes", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("reviewed_at", models.DateTimeField(blank=True, null=True)),
                (
                    "reported_user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="flags",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "reporter",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="reports",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "reviewed_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="reviewed_flags",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="FraudScore",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("score", models.FloatField(default=0.0)),
                ("reasons", models.JSONField(blank=True, default=list)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "user",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="fraud_score",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
        migrations.AddIndex(
            model_name="registrationattempt",
            index=models.Index(
                fields=["ip_address", "created_at"], name="accounts_reg_ip_c5b9c6_idx"
            ),
        ),
    ]
