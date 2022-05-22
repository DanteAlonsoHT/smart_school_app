from unicodedata import name
from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator 
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager

class UserProfileManager(BaseUserManager):
  def create_user(self, 
                  first_name,
                  last_name,
                  email = None,
                  password = None,
                  born_date = None,
                  country = None,
                  state = None,
                  city = None,
                  phone_number = None,
                  ):
    if not first_name:
      raise ValueError("Es requerido agregar tu Primer Nombre")

    if not last_name:
      raise ValueError("Es requerido agregar tus Apellidos")

    if not born_date:
      raise ValueError("Es requerido agregar tu Fecha de Nacimiento")
    
    if not country:
      raise ValueError("Es requerido agregar tu País de residencia")
    
    if not state:
      raise ValueError("Es requerido agregar tu Estado de residencia")

    if not city:
      raise ValueError("Es requerido agregar tu Ciudad de residencia")
    
    if not phone_number:
      raise ValueError("Es requerido agregar tu Número Telefóninco")

    if email:
      email = self.normalize_email(email)
    
    user = self.model(first_name = first_name,
                      last_name = last_name,
                      email = email, 
                      born_date = born_date,
                      country = country,
                      state = state,
                      city = city,
                      phone_number = phone_number,
                      )
    user.set_password(password)
    user.save(using=self._db)

    return user

  def create_superuser(self, 
                      first_name,
                      last_name,
                      email,
                      born_date,
                      country,
                      state,
                      city,
                      phone_number,
                      password,
                      ):
    user = self.create_user(first_name,
                    last_name,
                    email,
                    password,
                    born_date,
                    country,
                    state,
                    city,
                    phone_number,
                    )
    user.is_superuser = True
    user.is_staff = True
    
    user.save(using=self._db)

    return user

class User(AbstractBaseUser, PermissionsMixin):
  first_name = models.CharField(max_length=150, blank=False)
  last_name = models.CharField(max_length=150, blank=False)
  email = models.EmailField(max_length=255, blank=False, unique=True)
  #face_encoding = models.CharField(max_length=5000)
  born_date = models.DateField(default='1999-12-31')
  country = models.CharField(max_length=80, default='México')
  state = models.CharField(max_length=80, default='Guanajuato')
  city = models.CharField(max_length=80, default='León')
  #profile_image = models.ImageField()
  phone_number = models.CharField(max_length=12, default='4777777777')
  is_active = models.BooleanField(default=True)
  is_staff = models.BooleanField(default=False)

  objects = UserProfileManager()

  USERNAME_FIELD = 'email'
  REQUIRED_FIELDS = ['first_name', 'last_name', 'born_date', 'country', 'state', 'city', 'phone_number']

  def get_full_name(self):
    return '{first_name} {last_name}'

  def get_short_name(self):
    return '{first_name}'

  def __str__(self):
    return self.email

class ClassSubject(models.Model):
  HUMANITIES_AND_SOCIAL_SCIENCE = 0
  NATURAL_SCIENCES = 1
  FORMAL_SCIENCES = 2
  PROFESSIONS_AND_APPLIED_SCIENCES = 3

  ACADEMIC_FIELD_CHOICES = [
    (HUMANITIES_AND_SOCIAL_SCIENCE, 'Humanities and Social Science'),
    (NATURAL_SCIENCES, 'Natural Sciences'),
    (FORMAL_SCIENCES, 'Formal Sciences'),
    (PROFESSIONS_AND_APPLIED_SCIENCES, 'Professions and Applied Sciences')
  ]

  name = models.CharField(max_length=50,blank=False)
  description = models.CharField(max_length=1000, blank=False)
  academic_field = models.IntegerField(choices=ACADEMIC_FIELD_CHOICES, blank=False)

  def __str__(self):
    return f'{self.name} - {self.academic_field}'

  def get_url_about_education_areas(self):
    return 'https://en.wikipedia.org/wiki/List_of_academic_fields'

class Classroom(models.Model):
  MORNING = 0
  AFTERNOON = 1
  DOUBLE = 2

  SHIFTS = [
    (MORNING, 'Morning Shift'),
    (AFTERNOON, 'Afternoon Shift'),
    (DOUBLE, 'Double Shift')
  ]

  name = models.CharField(max_length=20,blank=False)
  grade = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(12)], blank=False)
  shift = models.IntegerField(choices=SHIFTS, blank=False)
  generation = models.CharField(max_length=20,blank=False)

  def __str__(self):
    return f'{self.name}'

def user_directory_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT /classroom_name/student_name/<filename>
    return '{0}/{1}/{2}'.format(instance.classroom.name, instance.name, filename)

class Student(models.Model):
  name = models.CharField(max_length=50,blank=False)
  classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, blank=False)
  image_profile = models.ImageField(upload_to=user_directory_path , blank=False)
  list_num = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(100)], blank=False)
  student_id = models.CharField(max_length=8,blank=False)

  def __str__(self):
    return f'{self.name} - {self.classroom.name}'
  
  class Meta:
        ordering = ['list_num']

class Attendance(models.Model):
  date = models.DateField(blank=False)
  attendance_list = models.TextField(max_length=2000, blank=False)
  attendance_number = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(100)], blank=False)
  teacher = models.ForeignKey(User, on_delete=models.CASCADE, blank=False)
  classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, blank=False)
  emotions_list = models.TextField(max_length=2000, blank=False)
  gender_proportion = models.TextField(max_length=100, blank=False)

class ActivityRegister(models.Model):
  date = models.DateField(blank=False)
  start_hour = models.DateTimeField(blank=False)
  finish_hour = models.DateTimeField(blank=False)
  attendance = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(100)], blank=False)

class FacesEncoding(models.Model):
  classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, blank=False)
  faces_encoding = models.JSONField(blank=False)
  last_training_date = models.DateField(blank=False)
