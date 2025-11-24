# Backend - Spring Boot API

Enterprise-grade Spring Boot service for aviation route calculation.

## Quick Start

```bash
# Run with Maven
./mvnw spring-boot:run

# Run tests
./mvnw test

# Build JAR
./mvnw clean package
```

**Access:** http://localhost:8080  
**Swagger UI:** http://localhost:8080/swagger-ui.html

## Tech Stack

- Java 25, Spring Boot 3.4.0
- PostgreSQL (production), Testcontainers (tests)
- Redis caching
- JWT authentication
- Liquibase migrations
- MapStruct, Lombok

## Configuration

### Profiles

- **local**: PostgreSQL with Liquibase migrations
- **production**: Production-ready configuration

### Environment Variables

```bash
SPRING_PROFILES_ACTIVE=production
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/ehy_flight_routes
SPRING_DATASOURCE_USERNAME=ehy_user
SPRING_DATASOURCE_PASSWORD=ehy_password
SPRING_REDIS_HOST=localhost
SPRING_REDIS_PORT=6379
JWT_SECRET=your-secret-key-here
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login (returns JWT)

### Locations (ADMIN only)
- `GET /api/locations` - List all
- `POST /api/locations` - Create
- `PUT /api/locations/{id}` - Update
- `DELETE /api/locations/{id}` - Soft delete

### Transportations (ADMIN only)
- `GET /api/transportations` - List all
- `POST /api/transportations` - Create
- `PUT /api/transportations/{id}` - Update
- `DELETE /api/transportations/{id}` - Soft delete

### Routes (ADMIN + AGENCY)
- `GET /api/routes/search?originId={uuid}&destinationId={uuid}&date={yyyy-MM-dd}` - Search routes (cached)

## Route Algorithm

**Valid routes:**
- Max 3 segments
- Exactly 1 FLIGHT (mandatory)
- Optional before-flight transfer (ground → airport)
- Optional after-flight transfer (airport → ground)
- All segments must operate on selected date

**Examples:**
- ✅ FLIGHT
- ✅ BUS → FLIGHT → UBER
- ❌ BUS → FLIGHT → FLIGHT (multiple flights)
- ❌ BUS → SUBWAY → FLIGHT → UBER (4 segments)

## Testing

```bash
# All tests (requires Docker for Testcontainers)
./mvnw test

# Unit tests only (no Docker needed)
./mvnw test -Dtest=*ServiceTest
```

**Test Coverage:** 34+ unit tests passing

## Database

### Entities
- **Location**: UUID, name, country, city, location_code
- **Transportation**: UUID, origin, destination, type, operating_days
- **User**: UUID, username, password (BCrypt), role

### Migrations
Liquibase changesets in `src/main/resources/db/changelog/`

## Docker

```bash
# Build image
docker build -t backend .

# Run with docker-compose
docker-compose up backend
```

## Project Structure

```
backend/
├── src/main/java/com/ehy/
│   ├── config/          # Security, Redis, OpenAPI
│   ├── controller/      # REST endpoints
│   ├── dto/             # Data Transfer Objects
│   ├── entity/          # JPA entities
│   ├── repository/      # Data access
│   ├── service/         # Business logic
│   └── security/        # JWT handling
└── src/test/java/       # Tests
```

## Monitoring

- Health: http://localhost:8080/actuator/health
- Metrics: http://localhost:8080/actuator/metrics

## Troubleshooting

**Tests failing:**
- Ensure Docker is running (for Testcontainers)
- Run unit tests only: `./mvnw test -Dtest=*ServiceTest`

**Port in use:**
- Change port in `application.yml`: `server.port: 8081`

**Database connection:**
- Verify PostgreSQL is running
- Check connection string in environment variables
