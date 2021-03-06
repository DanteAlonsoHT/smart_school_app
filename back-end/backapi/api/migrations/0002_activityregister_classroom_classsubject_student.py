# Generated by Django 3.2.5 on 2022-02-05 04:54

import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ActivityRegister',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('start_hour', models.DateTimeField()),
                ('finish_hour', models.DateTimeField()),
                ('attendance', models.IntegerField(max_length=2)),
            ],
        ),
        migrations.CreateModel(
            name='Classroom',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=20)),
                ('grade', models.IntegerField(max_length=2)),
                ('shift', models.IntegerField(choices=[(0, 'Morning Shift'), (1, 'Afternoon Shift'), (2, 'Double Shift')])),
                ('generation', models.CharField(max_length=20)),
            ],
        ),
        migrations.CreateModel(
            name='ClassSubject',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50)),
                ('description', models.CharField(max_length=1000)),
                ('academic_field', models.IntegerField(choices=[(0, 'Humanities and Social Science'), (1, 'Natural Sciences'), (2, 'Formal Sciences'), (3, 'Professions and Applied Sciences')])),
            ],
        ),
        migrations.CreateModel(
            name='Student',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50)),
                ('image_profile', models.ImageField(upload_to='face_photos/$<django.db.models.fields.related.ForeignKey>/$<django.db.models.fields.CharField>/')),
                ('list_num', models.PositiveIntegerField(validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(100)])),
                ('student_id', models.CharField(max_length=8)),
                ('classroom', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.classroom')),
            ],
            options={
                'ordering': ['list_num'],
            },
        ),
    ]
