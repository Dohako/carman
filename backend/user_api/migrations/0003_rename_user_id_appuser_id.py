# Generated by Django 4.1.5 on 2024-04-01 16:01

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('user_api', '0002_car'),
    ]

    operations = [
        migrations.RenameField(
            model_name='appuser',
            old_name='user_id',
            new_name='id',
        ),
    ]