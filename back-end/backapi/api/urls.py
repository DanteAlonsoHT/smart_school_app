from posixpath import basename
from django.contrib import admin
from django.urls import path
from django.conf.urls import include
from rest_framework import routers
from .views import UserViewSet, StudentViewSet, ClassroomViewSet, AttendanceViewSet, FacesEncodingViewSet
from api import views

router = routers.DefaultRouter()
router.register('users', UserViewSet, basename='user')
router.register('classrooms', ClassroomViewSet)
router.register('attendances', AttendanceViewSet)
router.register('students', StudentViewSet, basename='student')
router.register('faces_encoding', FacesEncodingViewSet, basename='faces_encoding')

urlpatterns = [
    path('', include(router.urls)),
    #path('students/', views.StudentAPIView.as_view(), name='student_api_view'),
]
