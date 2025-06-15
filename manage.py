#!/usr/bin/env python
import os
import sys
from dotenv import load_dotenv  # добавляем импорт

def main():
    """Run administrative tasks."""
    # загружаем .env из backend/
    project_dir = os.path.dirname(__file__)
    env_path = os.path.join(project_dir, 'backend', '.env')
    load_dotenv(env_path, override=True)

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(...) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
