from rest_framework.permissions import BasePermission


class IsSuperAdmin(BasePermission):
    """Allows access only to users with role super_admin."""

    def has_permission(self, request, view):
        user = request.user
        role = getattr(user, "role", "") if user and user.is_authenticated else ""
        normalized = str(role).lower().replace("-", "").replace("_", "").replace(" ", "")
        return bool(
            user
            and user.is_authenticated
            and normalized == "superadmin"
        )
