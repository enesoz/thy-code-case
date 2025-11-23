# Enes Airlines Flight Route System - Backend

Enterprise-grade Spring Boot backend service for aviation route calculation system combining flights with ground transportation.

## Features

- **Route Calculation Algorithm**: Find optimal routes combining flights with ground transfers (BUS, SUBWAY, UBER)
- **JWT Authentication**: Secure authentication with role-based access control (ADMIN, AGENCY)
- **Redis Caching**: High-performance route search with 1-hour TTL
- **Database**: PostgreSQL (production) / H2 (local development)
- **API Documentation**: OpenAPI/Swagger UI
- **Database Migrations**: Liquibase
- **Testing**: JUnit 5, Mockito, Spring Boot Test

## Technology Stack

- **Java**: 25
- **Spring Boot**: 3.4.0
- **Spring Security**: JWT-based authentication
- **Spring Data JPA**: Hibernate ORM
- **Liquibase**: Database migration
- **Redis**: Caching
- **PostgreSQL**: Production database
- **H2**: In-memory database for local development
- **MapStruct**: DTO mapping
- **Springdoc OpenAPI**: API documentation
- **JUnit 5 & Mockito**: Testing

## Prerequisites

- Java 25 or later
- Maven 3.9+ (or use included Maven Wrapper)
- PostgreSQL 15+ (for production profile)
- Redis 7+ (for caching)

## Quick Start

### 1. Clone the repository

```bash
cd ehy-flight-routes-backend
```

### 2. Run with local profile (H2 database)

```bash
./mvnw spring-boot:run
```

Or on Windows:

```cmd
mvnw.cmd spring-boot:run
```

The application will start on `http://localhost:8080`

### 3. Access Swagger UI

Open your browser and navigate to:
```
http://localhost:8080/swagger-ui.html
```

### 4. Login Credentials

**Admin User:**
- Username: `admin`
- Password: `admin123`
- Role: ADMIN (full access)

**Agency User:**
- Username: `agency`
- Password: `agency123`
- Role: AGENCY (route search only)

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login (returns JWT token)

### Locations (ADMIN only)
- `GET /api/locations` - List all locations
- `GET /api/locations/{id}` - Get location by ID
- `POST /api/locations` - Create location
- `PUT /api/locations/{id}` - Update location
- `DELETE /api/locations/{id}` - Soft delete location

### Transportations (ADMIN only)
- `GET /api/transportations` - List all transportations
- `GET /api/transportations/{id}` - Get transportation by ID
- `POST /api/transportations` - Create transportation
- `PUT /api/transportations/{id}` - Update transportation
- `DELETE /api/transportations/{id}` - Soft delete transportation

### Routes (ADMIN + AGENCY)
- `GET /api/routes/search?originId={uuid}&destinationId={uuid}&date={yyyy-MM-dd}` - Search routes

## Configuration

### Application Profiles

#### Local Profile (`application-local.yml`)
- H2 in-memory database
- Redis on localhost:6379
- Detailed logging
- H2 console enabled at `/h2-console`

#### Production Profile (`application-production.yml`)
- PostgreSQL database
- Redis with configurable host/port
- Optimized logging
- Connection pooling with HikariCP

### Environment Variables

For production deployment:

```bash
SPRING_PROFILES_ACTIVE=production
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/ehy_flight_routes
SPRING_DATASOURCE_USERNAME=ehy_user
SPRING_DATASOURCE_PASSWORD=ehy_password
SPRING_REDIS_HOST=localhost
SPRING_REDIS_PORT=6379
JWT_SECRET=your-secret-key-here
```

## Database Schema

### Entities

#### Location
- UUID primary key
- Name, country, city
- Unique location code (IATA or custom)
- Soft delete support
- Optimistic locking

#### Transportation
- UUID primary key
- Origin and destination locations (FK)
- Transportation type (FLIGHT, BUS, SUBWAY, UBER)
- Operating days array (1=Mon, ..., 7=Sun)
- Soft delete support
- Optimistic locking

#### User
- UUID primary key
- Username (unique)
- BCrypt encoded password
- Role (ADMIN, AGENCY)
- Soft delete support
- Optimistic locking

## Route Calculation Algorithm

The system finds valid routes following these rules:

### Valid Route Composition
- **Maximum 3 segments** per route
- **Exactly 1 FLIGHT** segment (mandatory)
- **Optional before-flight transfer** (0-1 ground transport to airport)
- **Optional after-flight transfer** (0-1 ground transport from airport)
- All segments must operate on selected date
- Segments must be connected

### Valid Route Examples
- ✅ FLIGHT
- ✅ UBER → FLIGHT
- ✅ FLIGHT → BUS
- ✅ SUBWAY → FLIGHT → UBER

### Invalid Routes
- ❌ More than 3 segments
- ❌ No flight segment
- ❌ Multiple flights
- ❌ Disconnected segments

### Caching
Route search results are cached in Redis with 1-hour TTL for optimal performance.

## Testing

### Run all tests

```bash
./mvnw test
```

### Run specific test class

```bash
./mvnw test -Dtest=RouteServiceTest
```

### Test Coverage

The project includes:
- Unit tests for service layer (Mockito)
- Integration tests for controllers (MockMvc)
- Repository tests (@DataJpaTest)
- Security tests (401, 403 responses)

Target: 80%+ code coverage

## Build

### Build JAR

```bash
./mvnw clean package
```

The JAR will be created in `target/flight-routes-backend-1.0.0.jar`

### Run JAR

```bash
java -jar target/flight-routes-backend-1.0.0.jar --spring.profiles.active=local
```

## Docker Support

### Build Docker image

```bash
docker build -t ehy-flight-routes-backend:1.0.0 .
```

### Run with Docker Compose

See `docker-compose.yml` in the root directory.

```bash
docker-compose up
```

## Project Structure

```
ehy-flight-routes-backend/
├── src/main/java/com/ehy/
│   ├── config/              # Spring configurations
│   │   ├── OpenApiConfig.java
│   │   ├── RedisConfig.java
│   │   └── SecurityConfig.java
│   ├── controller/          # REST controllers
│   │   ├── AuthController.java
│   │   ├── LocationController.java
│   │   ├── RouteController.java
│   │   └── TransportationController.java
│   ├── dto/                 # Data Transfer Objects
│   ├── entity/              # JPA entities
│   │   ├── Location.java
│   │   ├── Transportation.java
│   │   └── User.java
│   ├── enums/               # Enumerations
│   │   ├── TransportationType.java
│   │   └── UserRole.java
│   ├── exception/           # Custom exceptions
│   │   ├── AuthenticationFailedException.java
│   │   ├── DuplicateResourceException.java
│   │   ├── GlobalExceptionHandler.java
│   │   └── ResourceNotFoundException.java
│   ├── mapper/              # MapStruct mappers
│   │   ├── LocationMapper.java
│   │   └── TransportationMapper.java
│   ├── repository/          # Spring Data repositories
│   │   ├── LocationRepository.java
│   │   ├── TransportationRepository.java
│   │   └── UserRepository.java
│   ├── security/            # Security components
│   │   ├── JwtAuthenticationFilter.java
│   │   └── JwtService.java
│   ├── service/             # Business logic
│   │   ├── AuthService.java
│   │   ├── LocationService.java
│   │   ├── RouteService.java
│   │   ├── TransportationService.java
│   │   └── UserDetailsServiceImpl.java
│   └── FlightRoutesApplication.java
├── src/main/resources/
│   ├── application.yml
│   ├── application-local.yml
│   ├── application-production.yml
│   └── db/changelog/        # Liquibase migrations
│       ├── db.changelog-master.xml
│       └── changes/
│           ├── v1.0.0-create-schema.xml
│           └── v1.0.0-seed-data.xml
└── src/test/java/           # Tests
    └── com/ehy/
        ├── controller/
        └── service/
```

## Seed Data

The application comes with pre-populated data for testing:

### Locations
- Istanbul Airport (IST)
- Sabiha Gokcen Airport (SAW)
- London Heathrow Airport (LHR)
- Taksim Square (TAKSIM)
- Wembley Stadium (WEMBLEY)

### Sample Transportations
- BUS/SUBWAY: Taksim → IST (daily)
- BUS: Taksim → SAW (daily)
- FLIGHT: IST → LHR (Mon, Wed, Fri, Sun)
- FLIGHT: SAW → LHR (Tue, Thu, Sat)
- UBER/BUS: LHR → WEMBLEY (daily)

### Example Route Search

Search for routes from Taksim to Wembley on Monday:

```http
GET /api/routes/search?originId={taksim-id}&destinationId={wembley-id}&date=2025-11-24
Authorization: Bearer {your-jwt-token}
```

Expected routes:
1. SUBWAY → IST → LHR FLIGHT → UBER
2. SUBWAY → IST → LHR FLIGHT → BUS
3. BUS → IST → LHR FLIGHT → UBER
4. BUS → IST → LHR FLIGHT → BUS

## Monitoring & Health Checks

Spring Boot Actuator endpoints (if enabled):

```
/actuator/health
/actuator/info
/actuator/metrics
```

## Security Best Practices

- Passwords stored with BCrypt
- JWT tokens with configurable expiration
- Role-based access control
- CSRF protection disabled (stateless API)
- SQL injection protection (JPA/Hibernate)
- Optimistic locking for concurrent updates
- Soft delete for data integrity

## Performance Optimizations

- Redis caching for route search (1-hour TTL)
- Database indexes on frequently queried columns
- Connection pooling with HikariCP
- Lazy loading for JPA relationships
- @Transactional read-only for queries

## Troubleshooting

### H2 Console not accessible
Make sure profile is set to `local` and navigate to `/h2-console`
- JDBC URL: `jdbc:h2:mem:ehy_flight_routes`
- Username: `sa`
- Password: (empty)

### Redis connection failed
Ensure Redis is running:
```bash
redis-cli ping
```

### Liquibase errors
Check database connection and ensure migrations haven't been manually modified.

**Important:** To run migrations manually, use the `update` command:
```bash
./mvnw liquibase:update
```
Do NOT use `liquibase:flow` as it requires a paid license.

### JWT token expired
Login again to get a new token. Default expiration is 24 hours.

## Contributing

This is a private project for Enes Airlines. Contact the development team for contribution guidelines.

## License

Private - All rights reserved by Enes Airlines.

## Support

For issues or questions, refer to the project documentation.
