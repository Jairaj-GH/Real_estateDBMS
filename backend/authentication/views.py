from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
import logging

logger = logging.getLogger(__name__)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        """
        Generate JWT token with user role and agent_id claims.
        
        The UserProfile is automatically created by signals, so it should always exist.
        If it doesn't, log a warning and use safe defaults.
        """
        token = super().get_token(user)
        token['email'] = user.email
        token['full_name'] = user.get_full_name() or user.username
        
        try:
            profile = user.profile
            token['role'] = profile.role
            token['agent_id'] = profile.agent_id
        except AttributeError:
            # This should not happen due to auto-profile creation signal,
            # but we handle it gracefully as a safety measure
            logger.warning(f"UserProfile missing for user {user.email}. This indicates a signal handler failure.")
            token['role'] = 'customer'
            token['agent_id'] = None
        except Exception as e:
            # Log unexpected errors but fail gracefully
            logger.error(f"Error accessing UserProfile for user {user.email}: {str(e)}")
            token['role'] = 'customer'
            token['agent_id'] = None
        
        return token

    def validate(self, attrs):
        """
        Validate credentials. Supports login with email instead of username.
        Provides clear error messages for debugging.
        """
        from django.contrib.auth.models import User
        
        email = attrs.get('username', '')
        
        if email:
            try:
                user_obj = User.objects.get(email=email)
                attrs['username'] = user_obj.username
            except User.DoesNotExist:
                # Let parent class raise standard authentication error
                logger.debug(f"Login attempt with non-existent email: {email}")
        
        return super().validate(attrs)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class CurrentUserView(APIView):
    """
    Returns current authenticated user's profile information.
    Includes role and agent_id claims from the UserProfile.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Safety check: verify UserProfile exists
        if not hasattr(user, 'profile'):
            logger.warning(f"UserProfile missing for authenticated user {user.email}. Creating default profile.")
            from authentication.models import UserProfile
            profile, created = UserProfile.objects.get_or_create(
                user=user,
                defaults={'role': 'customer', 'agent_id': None}
            )
        else:
            profile = user.profile
        
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'full_name': user.get_full_name() or user.username,
            'role': profile.role,
            'agent_id': profile.agent_id,
        })
