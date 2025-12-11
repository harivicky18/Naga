.PHONY: build up down restart logs shell-django shell-fastapi migrate createsuperuser test clean

# Build all services
build:
	docker-compose build

# Start all services
up:
	docker-compose up -d

# Stop all services
down:
	docker-compose down

# Restart all services
restart:
	docker-compose restart

# View logs
logs:
	docker-compose logs -f

# Django shell
shell-django:
	docker-compose exec django python manage.py shell

# FastAPI shell
shell-fastapi:
	docker-compose exec fastapi sh

# Run Django migrations
migrate:
	docker-compose exec django python manage.py makemigrations
	docker-compose exec django python manage.py migrate

# Create superuser
createsuperuser:
	docker-compose exec django python manage.py createsuperuser

# Run tests
test:
	docker-compose exec django python manage.py test

# Clean everything
clean:
	docker-compose down -v
	docker system prune -f

# Full setup
setup: build up migrate createsuperuser

# Rebuild and restart
rebuild:
	docker-compose up -d --build

# Build and setup everything
make setup

# Start services
make up

# View logs
make logs

# Stop services
make down