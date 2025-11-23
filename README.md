# Enes Airlines Flight Route System

Full-stack aviation route calculation system that combines flights with ground transportation (BUS, SUBWAY, UBER).

## Project Overview

This system allows users to search for travel routes from origin to destination, combining different transportation types:
- **Before-flight transfers**: Ground transportation (BUS, SUBWAY, UBER) to airports
- **Flights**: Air transportation between airports
- **After-flight transfers**: Ground transportation from airports to final destination

### Key Features

- **Smart Route Calculation**: Finds all valid route combinations (max 3 segments, exactly 1 flight required)
- **Operating Days Validation**: Only shows routes available on the selected date
- **Role-Based Access Control**: ADMIN and AGENCY user roles with different permissions
- **Redis Caching**: High-performance route search with 1-hour cache
- **JWT Authentication**: Secure token-based authentication
- **Comprehensive API Documentation**: Swagger UI for testing and documentation

## Tech Stack

### Backend
- **Framework**: Spring Boot 3.4.0
- **Java Version**: 25
- **Database**: PostgreSQL (production), H2 (development)
- **Caching**: Redis
- **Security**: JWT with role-based access
- **Documentation**: OpenAPI 3.0 (Swagger UI)
- **ORM**: Hibernate/JPA with Liquibase migrations
- **Build**: Maven

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Routing**: react-router-dom v6
- **HTTP Client**: Axios with JWT interceptors
- **State Management**: TanStack React Query
- **Forms**: react-hook-form
- **Styling**: Tailwind CSS
- **Testing**: Vitest + React Testing Library

### DevOps
- **Containerization**: Docker + docker-compose
- **Services**: Backend, Frontend, PostgreSQL, Redis

## Project Structure

```
thy-code-case/
├── ehy-flight-routes-backend/     # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/enesairlines/
│   │   │   │   ├── config/        # Security, Redis, OpenAPI
│   │   │   │   ├── controller/    # REST endpoints
│   │   │   │   ├── dto/           # Data Transfer Objects
│   │   │   │   ├── entity/        # JPA entities
│   │   │   │   ├── enums/         # Enumerations
│   │   │   │   ├── exception/     # Exception handling
│   │   │   │   ├── mapper/        # DTO mappers
│   │   │   │   ├── repository/    # Data access layer
│   │   │   │   ├── security/      # JWT authentication
│   │   │   │   └── service/       # Business logic
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       └── db/changelog/  # Liquibase migrations
│   │   └── test/                  # Unit & integration tests
│   ├── Dockerfile
│   └── README.md
├── ehy-flight-routes-frontend/    # React frontend
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── pages/                 # Page components
│   │   ├── services/              # API client
│   │   ├── contexts/              # React contexts
│   │   ├── types/                 # TypeScript types
│   │   └── utils/                 # Utilities
│   ├── Dockerfile
│   ├── nginx.conf
│   └── README.md
├── docker-compose.yml
├── claude.md                      # Development guide
├── java.md                        # Java coding standards
└── README.md                      # This file
```

## Quick Start

### Prerequisites

- **Docker** and **Docker Compose** installed
- OR locally:
  - Java 25+
  - Node.js 22+
  - PostgreSQL 15+ (for production profile)
  - Redis 7+ (for caching)
  - Maven 3.9+ (included as wrapper)

### Option 1: Docker Compose (Recommended)

Start the entire stack with one command:

```bash
docker-compose up --build
```

Services will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

To stop all services:

```bash
docker-compose down
```

To stop and remove volumes (clean database):

```bash
docker-compose down -v
```

### Option 2: Local Development

#### Backend

```bash
cd ehy-flight-routes-backend

# Run with H2 in-memory database (local profile)
./mvnw spring-boot:run

# Or run tests first
./mvnw clean test
./mvnw spring-boot:run
```

Backend will start at http://localhost:8080

**H2 Console**: http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:ehy_flight_routes`
- Username: `sa`
- Password: (empty)

#### Frontend

```bash
cd ehy-flight-routes-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will start at http://localhost:3000

## Demo Credentials

### Admin User
- **Username**: `admin`
- **Password**: `admin123`
- **Permissions**: Full access to all features (locations, transportations, routes)

### Agency User
- **Username**: `agency`
- **Password**: `agency123`
- **Permissions**: Routes search only

## Sample Data

The application comes pre-loaded with sample data:

### Locations
- **Istanbul Airport (IST)** - Turkey
- **Sabiha Gokcen Airport (SAW)** - Turkey
- **London Heathrow Airport (LHR)** - UK
- **Taksim Square (TAKSIM)** - Turkey
- **Wembley Stadium (WEMBLEY)** - UK

### Sample Routes

#### Example 1: Taksim to Wembley (Monday)
Available routes:
1. SUBWAY: Taksim → IST → FLIGHT: IST → LHR → UBER: LHR → Wembley
2. SUBWAY: Taksim → IST → FLIGHT: IST → LHR → BUS: LHR → Wembley
3. BUS: Taksim → IST → FLIGHT: IST → LHR → UBER: LHR → Wembley
4. BUS: Taksim → IST → FLIGHT: IST → LHR → BUS: LHR → Wembley

#### Example 2: Taksim to Wembley (Tuesday)
Different routes due to operating days:
1. BUS: Taksim → SAW → FLIGHT: SAW → LHR → UBER: LHR → Wembley
2. BUS: Taksim → SAW → FLIGHT: SAW → LHR → BUS: LHR → Wembley

## API Documentation

### Swagger UI

Access interactive API documentation at:
- Local: http://localhost:8080/swagger-ui.html
- Docker: http://localhost:8080/swagger-ui.html

### Authentication

1. **Login**: `POST /api/auth/login`
   ```json
   {
     "username": "admin",
     "password": "admin123"
   }
   ```

2. **Use JWT Token**: Add to Authorization header
   ```
   Authorization: Bearer {your-jwt-token}
   ```

### Main Endpoints

#### Public
- `POST /api/auth/login` - User authentication

#### ADMIN Only
- `GET /api/locations` - List all locations
- `POST /api/locations` - Create location
- `PUT /api/locations/{id}` - Update location
- `DELETE /api/locations/{id}` - Delete location (soft delete)
- `GET /api/transportations` - List all transportations
- `POST /api/transportations` - Create transportation
- `PUT /api/transportations/{id}` - Update transportation
- `DELETE /api/transportations/{id}` - Delete transportation (soft delete)

#### ADMIN + AGENCY
- `GET /api/routes/search?originId={uuid}&destinationId={uuid}&date={yyyy-MM-dd}` - Search routes (cached)

## Business Rules

### Valid Route Composition

A valid route must have:
1. **Optional Before-Flight Transfer**: 0-1 ground transportation to an airport
2. **Mandatory Flight**: Exactly 1 FLIGHT type transportation
3. **Optional After-Flight Transfer**: 0-1 ground transportation from an airport

**Maximum segments**: 3
**Minimum segments**: 1 (flight only)

### Invalid Routes

- More than 3 segments
- No flight segment
- Multiple flights
- Multiple before-flight transfers
- Multiple after-flight transfers
- Disconnected segments
- Transportation unavailable on selected date

### Operating Days

- Days represented as integers: 1=Monday, 2=Tuesday, ..., 7=Sunday
- Transportation available only if selected date's day-of-week matches operatingDays array
- Example: `operatingDays=[1,3,5,7]` means Monday, Wednesday, Friday, Sunday only

## Testing

### Backend Tests

```bash
cd ehy-flight-routes-backend

# Run all tests
./mvnw test

# Run with coverage
./mvnw test jacoco:report

# View coverage report
open target/site/jacoco/index.html
```

**Test Coverage**: 80%+ on service layer

### Frontend Tests

```bash
cd ehy-flight-routes-frontend

# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test -- --coverage
```

## Development

### Backend Development

```bash
cd ehy-flight-routes-backend

# Run with hot reload
./mvnw spring-boot:run

# Format code
./mvnw spotless:apply

# Build without tests
./mvnw clean package -DskipTests
```

### Frontend Development

```bash
cd ehy-flight-routes-frontend

# Development mode with hot reload
npm run dev

# Type check
npm run type-check

# Lint
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## Docker Commands

### Build Images

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Execute Commands

```bash
# Backend shell
docker-compose exec backend sh

# Frontend shell
docker-compose exec frontend sh

# PostgreSQL CLI
docker-compose exec postgres psql -U ehy_user -d ehy_flight_routes

# Redis CLI
docker-compose exec redis redis-cli
```

## Troubleshooting

### Port Already in Use

If ports are already in use, modify `docker-compose.yml`:

```yaml
services:
  backend:
    ports:
      - "8081:8080"  # Change 8080 to 8081
  frontend:
    ports:
      - "3001:80"    # Change 3000 to 3001
```

### Database Connection Issues

Check if PostgreSQL is running:

```bash
docker-compose ps postgres
docker-compose logs postgres
```

### Redis Connection Issues

Check if Redis is running:

```bash
docker-compose ps redis
docker-compose logs redis
```

### Backend Not Starting

1. Check Java version: `java -version` (should be 25+)
2. Check logs: `docker-compose logs backend`
3. Verify PostgreSQL is healthy: `docker-compose ps`

### Frontend Not Loading

1. Check nginx logs: `docker-compose logs frontend`
2. Verify backend is healthy: `curl http://localhost:8080/actuator/health`
3. Check browser console for errors

## Performance

### Route Search Optimization

- **Redis Caching**: 1-hour TTL on route search results
- **Database Indexes**: Optimized queries for location and transportation searches
- **Lazy Loading**: JPA relationships loaded on demand
- **Connection Pooling**: HikariCP for database connections

### Expected Performance

- Route search (cached): < 100ms
- Route search (uncached): < 500ms
- CRUD operations: < 200ms
- Login: < 300ms

## Security

### Authentication

- JWT token-based authentication
- Token expiration: 24 hours
- BCrypt password encoding
- Stateless session management

### Authorization

- Role-based access control (RBAC)
- ADMIN: Full access to all endpoints
- AGENCY: Read-only access to routes search

### Security Headers

- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block

## Monitoring

### Health Checks

- **Backend**: http://localhost:8080/actuator/health
- **Frontend**: http://localhost:3000/health

### Docker Health Status

```bash
docker-compose ps
```

All services should show "healthy" status.

## Contributing

### Code Style

#### Backend (Java)
- Follow `java.md` guidelines
- Use constructor injection
- UUID for all primary keys
- Soft delete with `deleted` boolean
- Optimistic locking with `@Version`
- SLF4J for logging

#### Frontend (React)
- TypeScript strict mode
- Functional components with hooks
- React Query for server state
- Tailwind CSS for styling
- Comprehensive prop types

### Git Workflow

1. Create feature branch: `feature/your-feature`
2. Make changes
3. Run tests
4. Create pull request to `develop`
5. Merge to `main` for production

## License

This project is part of the Enes Airlines case study.

## Support

For issues and questions:
- Review documentation in `claude.md`
- Check `java.md` for coding standards
- Review individual README files in backend/frontend directories

---

**Built with** Spring Boot 3, React 19, PostgreSQL, Redis, Docker
