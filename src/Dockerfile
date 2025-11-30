FROM python:3.11-slim

WORKDIR /app
ENV PYTHONUNBUFFERED=1

# When building from the repository root we can copy the root requirements.txt
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application source (from the repo's src/ directory)
COPY src/ .
EXPOSE 5000

# Use gunicorn for production-like behavior inside the container
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:5000", "--workers", "2"]
