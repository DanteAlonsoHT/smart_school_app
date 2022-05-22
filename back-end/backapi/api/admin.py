from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(Classroom)
admin.site.register(Student)
admin.site.register(ActivityRegister)
admin.site.register(ClassSubject)
admin.site.register(Attendance)