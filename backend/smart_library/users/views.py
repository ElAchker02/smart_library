from django.contrib.auth import authenticate, get_user_model
from rest_framework import permissions, status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import LoginSerializer, UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    """CRUD complet pour les utilisateurs."""

    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = get_user_model().objects.all().order_by("-created_at")

    def get_permissions(self):
        # Autoriser la création de compte sans authentification préalable.
        if self.action == "create":
            return [permissions.AllowAny()]
        return super().get_permissions()


class LoginView(APIView):
    """Endpoint permettant de récupérer un token d'authentification."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        user = authenticate(request, username=email, password=password)
        if not user:
            return Response(
                {"detail": "Identifiants invalides."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {
                "token": token.key,
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    """Endpoint permettant d'invalider le token courant."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        token = getattr(request.user, "auth_token", None)
        if token:
            token.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
