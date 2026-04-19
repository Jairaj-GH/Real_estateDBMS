from rest_framework.permissions import BasePermission
import logging

logger = logging.getLogger(__name__)


def get_user_role(user):
    """
    Safely retrieve user role from UserProfile.
    
    With auto-profile creation via signals, UserProfile should always exist
    for authenticated users. This function provides a safe fallback.
    
    Args:
        user: Django User object
        
    Returns:
        str: The user's role ('office', 'agent', 'customer', 'admin') or None if profile missing
    """
    if not user or not user.is_authenticated:
        return None
    
    try:
        profile = user.profile
        if profile and hasattr(profile, 'role'):
            return profile.role
        else:
            logger.warning(f"UserProfile exists but role is missing for user {user.email}")
            return None
    except AttributeError:
        # UserProfile doesn't exist - this should not happen with signal handler,
        # but handle gracefully as fallback
        logger.warning(f"UserProfile missing for user {user.email}. Creating default profile.")
        from authentication.models import UserProfile
        try:
            profile, created = UserProfile.objects.get_or_create(
                user=user,
                defaults={'role': 'customer', 'agent_id': None}
            )
            return profile.role
        except Exception as e:
            logger.error(f"Failed to create/retrieve UserProfile for user {user.email}: {str(e)}")
            return None
    except Exception as e:
        logger.error(f"Unexpected error retrieving user role for {user.email}: {str(e)}")
        return None


class IsOfficeOrAdmin(BasePermission):
    """Office staff and admin can access."""
    def has_permission(self, request, view):
        role = get_user_role(request.user)
        return role in ('office', 'admin')


class IsAgentOrAdmin(BasePermission):
    """Agent and admin can access."""
    def has_permission(self, request, view):
        role = get_user_role(request.user)
        return role in ('agent', 'admin')


class IsAdminRole(BasePermission):
    """Only admin can access."""
    def has_permission(self, request, view):
        role = get_user_role(request.user)
        return role == 'admin'


class IsAnyAuthenticatedRole(BasePermission):
    """Any authenticated user with a valid role."""
    def has_permission(self, request, view):
        role = get_user_role(request.user)
        return role in ('office', 'agent', 'customer', 'admin')
