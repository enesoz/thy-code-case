# Enes Airlines Flight Route System - Claude Development Guide

## Project Overview
Full-stack aviation route calculation system combining flights with ground transportation (BUS, SUBWAY, UBER).

**Case Study Source:** Java 2 - Case Study.pdf (Enes Airlines Hizmete Özel)

## Team Structure
- **Senior Java Developer 1**: Backend infrastructure, security, API layer
- **Senior Java Developer 2**: Core business logic, route calculation algorithm, testing
- **Senior React Developer**: Frontend SPA, UI/UX, API integration

## Key Technical Requirements

### Backend Stack
- **Framework**: Spring Boot 3.x
- **Java Version**: 25+
- **ORM**: Hibernate/JPA with Liquibase migrations
- **Database**: PostgreSQL (production), H2 (local development optional)
- **Caching**: Redis for high-load route search endpoint
- **Security**: JWT authentication, role-based access (ADMIN, AGENCY)
- **Documentation**: Springdoc OpenAPI 2.x (Swagger UI)
- **Testing**: JUnit 5, Mockito, Spring Boot Test
- **Build**: Maven

### Frontend Stack
- **Framework**: React 19+ with TypeScript
- **Build Tool**: Vite (recommended)
- **Routing**: react-router-dom v6
- **HTTP Client**: Axios with interceptors
- **State Management**: @tanstack/react-query
- **Forms**: react-hook-form
- **UI Library**: Material-UI or Tailwind CSS
- **Testing**: React Testing Library
- **CSS**: Tailwind Css

### DevOps
- **Containerization**: Docker + docker-compose
- **Services**: Backend, Frontend, PostgreSQL, Redis

## Core Business Rules

### Route Composition Rules
A valid route consists of:
1. **Optional Before-Flight Transfer**: 0-1 non-flight transportation to an airport
2. **Mandatory Flight**: Exactly 1 FLIGHT type transportation
3. **Optional After-Flight Transfer**: 0-1 non-flight transportation from an airport

### Validation Rules
❌ **Invalid Routes:**
- More than 3 segments
- No flight segment
- Multiple flights
- Multiple before-flight transfers
- Multiple after-flight transfers
- Any segment unavailable on selected date
- Disconnected segments (arrival location ≠ next departure location)

✅ **Valid Route Examples:**
- FLIGHT
- UBER → FLIGHT
- FLIGHT → BUS
- SUBWAY → FLIGHT → UBER

### Operating Days Logic
- Days represented as integers: 1=Monday, 2=Tuesday, ..., 7=Sunday
- Transportation available only if selected date's day-of-week is in operatingDays array
- Example: operatingDays=[1,3,7] means Monday, Wednesday, Sunday only

### Multiple Route Combinations
If there are multiple transfer options, return ALL combinations as separate routes.
Example: 2 before-flight options × 3 after-flight options = 6 distinct routes

## Data Model (Following java.md Standards)

### Location Entity
```java
@Entity
@Table(name = "locations", indexes = {
    @Index(name = "idx_location_code", columnList = "location_code"),
    @Index(name = "idx_tenant_deleted", columnList = "tenant_id,deleted")
})
public class Location {
    @Id
    @GeneratedValue
    private UUID id;
    
    private UUID tenantId;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String country;
    
    @Column(nullable = false)
    private String city;
    
    @Column(name = "location_code", unique = true, nullable = false, length = 4)
    private String locationCode; // IATA codes (3 chars) or custom (4 chars)
    
    @Column(nullable = false)
    private Boolean deleted = false;
    
    @Version
    private Long optimisticLockVersion;
    
    private Integer displayOrder;
}
```

### Transportation Entity
```java
@Entity
@Table(name = "transportations", indexes = {
    @Index(name = "idx_origin_dest", columnList = "origin_location_id,destination_location_id"),
    @Index(name = "idx_type_deleted", columnList = "transportation_type,deleted")
})
public class Transportation {
    @Id
    @GeneratedValue
    private UUID id;
    
    private UUID tenantId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "origin_location_id", nullable = false)
    private Location originLocation;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_location_id", nullable = false)
    private Location destinationLocation;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "transportation_type", nullable = false)
    private TransportationType transportationType; // FLIGHT, BUS, SUBWAY, UBER
    
    @Column(name = "operating_days", nullable = false)
    private Integer[] operatingDays; // Array of 1-7 (Mon-Sun)
    
    @Column(nullable = false)
    private Boolean deleted = false;
    
    @Version
    private Long optimisticLockVersion;
}
```

### User Entity
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue
    private UUID id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String password; // BCrypt encoded
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role; // ADMIN, AGENCY
    
    @Column(nullable = false)
    private Boolean deleted = false;
    
    @Version
    private Long optimisticLockVersion;
}
```

## API Endpoints

### Authentication (Public)
- `POST /api/auth/login` → JWT token + user info

### Locations (ADMIN only)
- `GET /api/locations` → List all
- `GET /api/locations/{id}` → Get by ID
- `POST /api/locations` → Create
- `PUT /api/locations/{id}` → Update
- `DELETE /api/locations/{id}` → Soft delete

### Transportations (ADMIN only)
- `GET /api/transportations` → List all
- `GET /api/transportations/{id}` → Get by ID
- `POST /api/transportations` → Create
- `PUT /api/transportations/{id}` → Update
- `DELETE /api/transportations/{id}` → Soft delete

### Routes (ADMIN + AGENCY)
- `GET /api/routes/search?originId={uuid}&destinationId={uuid}&date={yyyy-MM-dd}` → Route results
- **Caching**: 1-hour TTL with Redis

## Route Calculation Algorithm (Core Logic)

### Service Method Signature
```java
@Cacheable(value = "routes", key = "#originId + ':' + #destinationId + ':' + #date")
public List<RouteResponse> findRoutes(UUID originId, UUID destinationId, LocalDate date)
```

### Algorithm Steps
1. **Extract Day of Week**: `int dayOfWeek = date.getDayOfWeek().getValue()` (1-7)

2. **Query Available Flights**:
   ```java
   List<Transportation> flights = transportationRepo.findFlights(
       originId, destinationId, dayOfWeek, TransportationType.FLIGHT
   );
   ```

3. **Query Before-Flight Transfers** (to all airports):
   ```java
   List<Location> airports = locationRepo.findAirportLocations();
   List<Transportation> beforeTransfers = transportationRepo.findNonFlightTransfers(
       originId, airports.stream().map(Location::getId).toList(), dayOfWeek
   );
   ```

4. **Query After-Flight Transfers** (from all airports):
   ```java
   List<Transportation> afterTransfers = transportationRepo.findNonFlightTransfers(
       airports.stream().map(Location::getId).toList(), destinationId, dayOfWeek
   );
   ```

5. **Build Valid Route Combinations**:
   - Type 1: Direct flights only
   - Type 2: Before transfer + Connected flight
   - Type 3: Flight + Connected after transfer
   - Type 4: Before transfer + Flight + After transfer (all connected)

6. **Validate Connectivity**: `beforeTransfer.destination == flight.origin && flight.destination == afterTransfer.origin`

7. **Return All Valid Combinations**

### Query Optimization
```java
@Query("SELECT t FROM Transportation t WHERE " +
       "t.originLocation.id IN :origins AND " +
       "t.destinationLocation.id IN :destinations AND " +
       "t.transportationType = :type AND " +
       ":dayOfWeek MEMBER OF t.operatingDays AND " +
       "t.deleted = false")
List<Transportation> findAvailableTransportations(
    List<UUID> origins, 
    List<UUID> destinations, 
    TransportationType type, 
    Integer dayOfWeek
);
```

## Security Configuration

### JWT Authentication
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/api/locations/**", "/api/transportations/**").hasRole("ADMIN")
                .requestMatchers("/api/routes/**").authenticated()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
```

### Password Encoding
```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```

## Frontend Architecture

### Routing Structure
```typescript
const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { path: 'routes', element: <RoutesPage /> }, // All users
      { path: 'locations', element: <AdminRoute><LocationsPage /></AdminRoute> },
      { path: 'transportations', element: <AdminRoute><TransportationsPage /></AdminRoute> },
      { index: true, element: <Navigate to="/routes" replace /> }
    ]
  }
]);
```

### API Client Setup
```typescript
// services/api.ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### React Query Setup
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1
    }
  }
});
```

## Docker Compose Setup

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ehy_flight_routes
      POSTGRES_USER: ehy_user
      POSTGRES_PASSWORD: ehy_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ../ehy-flight-routes-backend
    environment:
      SPRING_PROFILES_ACTIVE: production
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/ehy_flight_routes
      SPRING_DATASOURCE_USERNAME: ehy_user
      SPRING_DATASOURCE_PASSWORD: ehy_password
      SPRING_REDIS_HOST: redis
      SPRING_REDIS_PORT: 6379
    depends_on:
      - postgres
      - redis
    ports:
      - "8080:8080"

  frontend:
    build: ../ehy-flight-routes-frontend
    depends_on:
      - backend
    ports:
      - "3000:80"

volumes:
  postgres_data:
```

## Seed Data (Liquibase)

### Users
- **Admin**: username=`admin`, password=`admin123`, role=ADMIN
- **Agency**: username=`agency`, password=`agency123`, role=AGENCY

### Sample Locations
- Istanbul Airport (IST)
- Sabiha Gökçen Airport (SAW)
- London Heathrow Airport (LHR)
- Taksim Square (TAKSIM)
- Wembley Stadium (WEMBLEY)

### Sample Transportations
- BUS: Taksim → IST (operating days: [1,2,3,4,5,6,7])
- SUBWAY: Taksim → IST (operating days: [1,2,3,4,5,6,7])
- BUS: Taksim → SAW (operating days: [1,2,3,4,5,6,7])
- FLIGHT: IST → LHR (operating days: [1,3,5,7])
- FLIGHT: SAW → LHR (operating days: [2,4,6])
- UBER: LHR → WEMBLEY (operating days: [1,2,3,4,5,6,7])
- BUS: LHR → WEMBLEY (operating days: [1,2,3,4,5,6,7])

## Testing Requirements

### Backend Tests (80%+ Coverage)
- **Unit Tests**: All service classes with Mockito
- **Integration Tests**: All controller endpoints with MockMvc
- **Repository Tests**: @DataJpaTest for custom queries
- **Security Tests**: Verify 401, 403 responses

### Frontend Tests
- **Component Tests**: React Testing Library for all major components
- **Integration Tests**: API client service interactions
- **E2E Tests (Optional)**: Cypress for critical user flows

## Quality Gates

### Java Code Quality (java.md Compliance)
✅ UUID primary keys on all entities
✅ Soft delete with `deleted` boolean
✅ Optimistic locking with `@Version`
✅ Constructor injection (no field injection)
✅ Global exception handling with @ControllerAdvice
✅ Spring profiles (local, production)
✅ SLF4J logging
✅ OpenAPI/Swagger documentation
✅ Liquibase database migrations
✅ Redis caching on route search
✅ Bean Validation on DTOs

### React Code Quality
✅ TypeScript strict mode
✅ Functional components with hooks
✅ React Query for server state
✅ Error boundaries
✅ Loading states
✅ Responsive design
✅ Accessibility (ARIA labels)

## Development Workflow

### Phase Sequence
1. **Phase 1-2**: Backend core infrastructure + business logic (Java Developers)
2. **Phase 3**: Security & API layer (Java Developer 1)
3. **Phase 4**: Backend testing (Java Developer 2)
4. **Phase 5**: Frontend implementation (React Developer)
5. **Phase 6**: Docker setup + integration (All team)
6. **Phase 7**: Nice-to-have features (Optional)

### Git Workflow
- `main` branch: Production-ready code
- `develop` branch: Integration branch
- Feature branches: `feature/route-calculation`, `feature/location-crud`, etc.
- Pull requests required for merging to develop/main

## Nice-to-Have Features (Phase 7)

### Backend
- Custom validation annotations (@ValidLocationCode, @ValidOperatingDays)
- Request/Response correlation IDs
- API rate limiting with Bucket4j
- Spring Boot Actuator health checks

### Frontend
- Route visualization on map (Leaflet/Google Maps)
- Export routes to PDF
- Advanced filtering/sorting on admin tables
- Bulk delete operations

## Success Criteria

1. ✅ All CRUD operations working with proper authorization
2. ✅ Route search returns all valid combinations
3. ✅ Operating day validation correct
4. ✅ JWT authentication + role-based access working
5. ✅ Swagger UI accessible at /swagger-ui/index.html
6. ✅ Frontend responsive and intuitive
7. ✅ `docker-compose up` starts entire stack successfully
8. ✅ 80%+ test coverage on backend services
9. ✅ No security vulnerabilities (OWASP compliance)
10. ✅ Performance: Route search responds in <500ms (cached)

## References
- **Case Study PDF**: Java 2 - Case Study.pdf
- **Java Guidelines**: java.md
- **Implementation Plan**: See plan document in Warp

---

**Project Timeline**: 10-11 days
**Estimated Completion**: Based on 3-developer team working in parallel

- move Claude related md files to tmp folder