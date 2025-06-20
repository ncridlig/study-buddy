
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_yasg.utils import swagger_auto_schema
from accounts import serializers
from accounts.docs import schemas
from accounts.permissions import AnyOnPost_AuthOnGet




class RegisterAPIView(generics.CreateAPIView) :

    serializer_class = serializers.RegisterUserSerializer
    permission_classes = (AnyOnPost_AuthOnGet, )

    @swagger_auto_schema(**schemas['RegisterAPIViewSchema']['POST'])
    def post(self, request) :
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid() :
            user = serializer.save()

            # Activate user while registration for simplicity
            user.is_active = True
            user.save()

            return Response(
                serializer.data,
                status = status.HTTP_201_CREATED
            )
        else :
            return Response(
                serializer.errors,
                status = status.HTTP_400_BAD_REQUEST,
            )

    @swagger_auto_schema(**schemas['RegisterAPIViewSchema']['GET'])
    def get(self, request):
        user = request.user
        serializer = self.serializer_class(user)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
            )


class CustomTokenObtainPairView(TokenObtainPairView):

    @swagger_auto_schema(**schemas['JWTAuth']['LOGIN'])
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class CustomTokenRefreshView(TokenRefreshView):
    
    @swagger_auto_schema(**schemas['JWTAuth']['REFRESH'])
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class PasswordChangeAPIView(generics.GenericAPIView) :

    permission_classes = (IsAuthenticated, )
    serializer_class = serializers.PasswordChangeSerializer

    def patch(self, request) :
        serializer = self.serializer_class(context = {'request':request}, data=request.data)

        if serializer.is_valid() :
            serializer.save()
            
            return Response(
                status = status.HTTP_200_OK
            )
        else :
            return Response(
                serializer.errors,
                status = status.HTTP_400_BAD_REQUEST,
            )
