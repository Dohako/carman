from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from user_api.models import Car

UserModel = get_user_model()

class UserRegisterSerializer(serializers.ModelSerializer):
	class Meta:
		model = UserModel
		fields = '__all__'
	def create(self, clean_data):
		user_obj = UserModel.objects.create_user(email=clean_data['email'], password=clean_data['password'])
		user_obj.username = clean_data['username']
		user_obj.save()
		return user_obj

class UserLoginSerializer(serializers.Serializer):
	id = serializers.IntegerField(read_only=True)
	email = serializers.EmailField()
	password = serializers.CharField()
	##
	def check_user(self, clean_data):
		user = authenticate(username=clean_data['email'], password=clean_data['password'])
		if not user:
			raise KeyError('user not found')
		return user

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = UserModel
		fields = ('id', 'email', 'username')

class CarSerializer(serializers.ModelSerializer):
	make = serializers.CharField(max_length=50)
	model = serializers.CharField(max_length=50)
	year = serializers.IntegerField()
	color = serializers.CharField(max_length=50)
	license_plate = serializers.CharField(max_length=50)
	vin = serializers.CharField(max_length=50)
	user = serializers.PrimaryKeyRelatedField(read_only=True)
	
	class Meta:
		model = Car
		fields = ['make', 'model', 'year', 'color', 'license_plate', 'vin', 'user']
