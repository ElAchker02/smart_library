from rest_framework.permissions import BasePermission


class IsSuperAdmin(BasePermission):
    """Allows access only to users with role super_admin."""

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and getattr(user, "role", None) == "super_admin"
        )
