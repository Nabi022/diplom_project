FROM python:3.11
WORKDIR /app

COPY backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ /app/backend/
COPY manage.py /app/manage.py

ENV PYTHONPATH=/app

CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000"]
