from django.apps import AppConfig


class AuthenticationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'authentication'

    def ready(self):
        """
        Signal handlers are registered when the app is ready.
        This ensures automatic UserProfile creation when a User is created.
        """
        import authentication.signals  # noqa
