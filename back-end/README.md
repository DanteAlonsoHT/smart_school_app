# Smart School Project.

## Databases

- Users (authentication and permissions)
- Classrooms
- Students
- Attendance

## Artificial Intelligence

- Authentication with Face Recognition.

## Virtual Env commands

To create a new virtual environment use:

`virtualenv smart-school -p python3`

To activate "smart-school" virtual environment use:

`source smart-school/Scripts/activate`

If you want to desactivate it, just use:

`deactivate`

To install all of dependencies use:

`pip install -r requirements.txt`

## Django commands

To see the whole list of packages installed use:

`pip freeze`

To clean cache (if you want to update static files):

`CTRL` + `SHIFT` + `R`

To open a console to manage and proof database:

`python manage.py shell`
from api.models import *
from django.contrib.auth.models import *
