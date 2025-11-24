# Enes Airlines Flight Route System

Full-stack aviation route calculation system combining flights with ground transportation.

## Overview

Search for travel routes from origin to destination, combining:
- Ground transportation (BUS, SUBWAY, UBER) to/from airports
- Flights between airports
- Smart route calculation with operating days validation

## Quick Start

### Using Docker (Recommended)

```bash
docker-compose up --build
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html

### Local Development

**Backend:**
```bash
cd backend
./mvnw spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Demo Credentials

| Role | Username | Password | Permissions |
|------|----------|----------|-------------|
| Admin | `admin` | `admin123` | Full access |
| Agency | `agency` | `agency123` | Routes search only |

## Tech Stack

**Backend:** Spring Boot 3.4, PostgreSQL, Redis, JWT  
**Frontend:** React 19, TypeScript, Vite, Tailwind CSS  
**DevOps:** Docker, docker-compose

## Project Structure

```
thy-code-case/
├── backend/              # Spring Boot API (see backend/README.md)
├── frontend/             # React SPA (see frontend/README.md)
├── docker-compose.yml    # Full stack orchestration
└── README.md             # This file
```

## Documentation

- **Backend Details**: See [backend/README.md](./backend/README.md)
- **Frontend Details**: See [frontend/README.md](./frontend/README.md)
- **API Documentation**: http://localhost:8080/swagger-ui.html

## Key Features

- JWT authentication with role-based access
- Redis caching for route search
- Smart route algorithm (max 3 segments, exactly 1 flight)
- Operating days validation
- Soft delete for data integrity
- Comprehensive test coverage

## Docker Commands

```bash
# Start all services
docker-compose up

# Stop all services
docker-compose down

# Clean restart (removes volumes)
docker-compose down -v && docker-compose up --build

# View logs
docker-compose logs -f [service-name]
```

## Testing

```bash
# Backend tests
cd backend && ./mvnw test

# Frontend tests
cd frontend && npm test
```

## Support

- Backend documentation: `backend/README.md`
- Frontend documentation: `frontend/README.md`
- API documentation: Swagger UI at http://localhost:8080/swagger-ui.html
