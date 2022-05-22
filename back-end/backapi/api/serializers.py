from rest_framework import serializers
from .models import User, Student, Classroom, Attendance, FacesEncoding
from rest_framework.authtoken.models import Token
from drf_extra_fields.fields import Base64ImageField

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id',
                  'first_name',
                  'last_name',
                  'email',
                  'born_date',
                  'country' ,
                  'state',
                  'city',
                  'phone_number',
                  'password',
                  )

        extra_kwargs = {'password': {'write_only': True, 'required': True }}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        Token.objects.create(user=user)
        return user

class StudentSerializer(serializers.ModelSerializer):
    image_profile = Base64ImageField(required=True)
    class Meta:
        model = Student
        fields = ['id', 'name','classroom', 'image_profile', 'list_num' ,'student_id']

class ClassroomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classroom
        fields = ['id','name','grade', 'shift', 'generation']

class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = ['date','attendance_list', 'attendance_number', 'teacher', 'classroom', 'emotions_list', 'gender_proportion']

class FacesEncodingSerializer(serializers.ModelSerializer):
    class Meta:
        model = FacesEncoding
        fields = ['faces_encoding', 'last_training_date', 'classroom_id']
