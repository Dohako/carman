from django.contrib.auth import get_user_model, login, logout
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from user_api.models import AppUser, Car
from backend import settings
from .serializers import CarSerializer, UserRegisterSerializer, UserLoginSerializer, UserSerializer
from rest_framework import permissions, status
from .validations import custom_validation, validate_email, validate_password
import logging
from django.forms.models import model_to_dict

logger = logging.getLogger(__name__)

class UserRegister(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        clean_data = custom_validation(request.data)
        serializer = UserRegisterSerializer(data=clean_data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.create(clean_data)
            if user:
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(status=status.HTTP_400_BAD_REQUEST)


class UserLogin(TokenObtainPairView):
    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated]

    ##
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        logger.error(response.data)
        token = response.data
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            data = serializer.data
            user = serializer.check_user(data)
            data["id"] = user.id
            data = {**data, **token}
            del data["password"]  # make it more correct
            response = Response(data, status=status.HTTP_200_OK)
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLogout(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_200_OK)


class UserView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    ##
    def get(self, request):
        # serializer = UserSerializer(request.user)
        # logger.error(serializer.data)
        # logger.error(f"User view {request.user}")
        # user = get_object_or_404(AppUser, pk=serializer.data["id"])
        cars = Car.objects.filter(user=request.user)
        return Response({"user": request.data, "cars": [model_to_dict(car) for car in cars]}, status=status.HTTP_200_OK)


class AddCarView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logger.error(request.data)
        logger.error(request.user)
        serializer = CarSerializer(data=request.data)
        logger.error(serializer)
        if serializer.is_valid():
            logger.error(serializer)
            serializer.save(user=request.user)
            all_cars = Car.objects.filter(user=request.user)
            all_cars_serializer = CarSerializer(all_cars, many=True)
            logger.error(f"Sending back: {serializer.data}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserCarsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id):
        # user = get_object_or_404(AppUser, pk=user_id)
        cars = Car.objects.filter(user=request.user)
        return Response([model_to_dict(car) for car in cars])
