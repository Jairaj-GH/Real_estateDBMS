from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role', models.CharField(choices=[('office', 'Office Staff'), ('agent', 'Agent'), ('customer', 'Customer'), ('admin', 'Administrator')], default='customer', max_length=20)),
                ('agent_id', models.IntegerField(blank=True, help_text='Links to Agent table if role=agent', null=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='profile', to='auth.user')),
            ],
            options={
                'db_table': 'auth_user_profile',
            },
        ),
    ]
