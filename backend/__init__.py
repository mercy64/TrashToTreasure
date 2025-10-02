# This file helps IDEs understand the project structure
import sys
import os

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trashtrotreasure.settings')