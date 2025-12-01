# Usage


Development (without Docker):

1. Create a Python virtual environment in `.venv` and install requirements from the repository root:

```
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Run the Flask app (development server):

```
python src/app.py
```

Docker (recommended for consistent run):

```
docker build -t web-wallpapers-api ./src
docker run -p 5000:5000 web-wallpapers-api
```

Or use docker-compose from the repository root:

```
docker compose up --build
```

The API will be available at `http://localhost:5000/api/*`.
