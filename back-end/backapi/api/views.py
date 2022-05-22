from rest_framework import viewsets, exceptions, status
# from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.authtoken.models import Token
from .models import Attendance, User, Student, Classroom, FacesEncoding
from .serializers import UserSerializer, StudentSerializer, ClassroomSerializer, AttendanceSerializer, FacesEncodingSerializer
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.hashers import make_password
from django.http import Http404
from rest_framework.response import Response
from rest_framework.request import clone_request
import json


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def update(self, request, pk=None, *args, **kwargs):
        try:
            copy = request.data.copy()
            copy['password'] = User.objects.filter(id=pk)[0].password
            partial = kwargs.pop('partial', False)
            instance = self.get_object_or_none()
            serializer = UserSerializer(instance, data=copy, partial=partial)
            serializer.is_valid(raise_exception=True)

            if instance is None:
                lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
                lookup_value = self.kwargs[lookup_url_kwarg]
                extra_kwargs = {self.lookup_field: lookup_value}
                serializer.save(**extra_kwargs)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            serializer.save()
            return Response(serializer.data)
        except:
            data_response = { 'error': 'Error in data sent or Server error was found.' }
            return Response(data_response, status=status.HTTP_400_BAD_REQUEST)
        
    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def get_object_or_none(self):
        try:
            return self.get_object()
        except Http404:
            if self.request.method == 'PUT':
                # For PUT-as-create operation, we need to ensure that we have
                # relevant permissions, as if this was a POST request.  This
                # will either raise a PermissionDenied exception, or simply
                # return None.
                self.check_permissions(clone_request(self.request, 'POST'))
            else:
                # PATCH requests where the object does not exist should still
                # return a 404 response.
                raise

    @action(detail=False, methods=['post'])
    def get_user_data_from_token(self, request, pk=None):
        try:
            current_user_id = Token.objects.filter(key=request.data['token'])[0].user_id
            queryset = User.objects.filter(id=current_user_id)
            serializer = UserSerializer(queryset, many=True)
            return Response(serializer.data)
        except:
            data_response = { 'error': 'User was not selected yet or Server error was found.' }
            return Response(data_response, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['put'])
    def update_password(self, request, pk=None):
        try:
            current_user_id = Token.objects.filter(key=request.headers['Authorization'].replace('Token ', ''))[0].user_id
            queryset = User.objects.filter(id=current_user_id)
            queryset.password = make_password(request.data['password'])
            serializer = UserSerializer(queryset, many=True)
            return Response(serializer.data)
        except:
            data_response = { 'error': 'User was not selected yet or Server error was found.' }
            return Response(data_response, status=status.HTTP_400_BAD_REQUEST)

class ClassroomViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication, ]
    permission_classes = [IsAuthenticated, ]
    queryset = Classroom.objects.all()
    serializer_class = ClassroomSerializer

class StudentViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication, ]
    permission_classes = [IsAuthenticated, ]
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

    @action(detail=False, methods=['post'])
    def get_students_from_classroom(self, request, pk=None):
        try:
            current_classroom = Classroom.objects.filter(name=request.data['classroom'])[0].id
            queryset = Student.objects.filter(classroom=current_classroom)
            serializer = StudentSerializer(queryset, many=True)
            return Response(serializer.data)
        except:
            data_response = { 'error': 'Classroom was not selected yet or Server error was found.' }
            return Response(data_response, status=status.HTTP_400_BAD_REQUEST)
        
class AttendanceViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication, ]
    permission_classes = [IsAuthenticated, ]
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer

class FacesEncodingViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication, ]
    permission_classes = [IsAuthenticated, ]
    queryset = FacesEncoding.objects.all()
    serializer_class = FacesEncodingSerializer

    def create(self, request, pk=None):
        try:
            instance = FacesEncoding.objects.filter(classroom_id=int(request.data['classroom_id'])).first()
            if (instance):
                instance.delete()
            serializer = FacesEncodingSerializer(data=request.data, many=False)
            if serializer.is_valid():
                instance = FacesEncoding()
                instance.faces_encoding = request.data['faces_encoding']
                instance.last_training_date = request.data['last_training_date']
                instance.classroom_id = request.data['classroom_id']
                instance.save()
            return Response(serializer.data)
        except:
            data_response = { 'error': 'Data was not right, please fill the right data.' }
            return Response(data_response, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def get_face_encoding_from_classroom(self, request, pk=None):
        try:
            queryset = FacesEncoding.objects.filter(classroom_id=int(request.data['classroom_id'])).first()
            print(queryset)
            return Response({
                'faces_encoding': queryset.faces_encoding
             })
        except:
            data_response = { 'error': 'Classroom was not selected yet or Server error was found.' }
            return Response(data_response, status=status.HTTP_400_BAD_REQUEST)
