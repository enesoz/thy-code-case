# Enes Airlines Flight Route System - Frontend

Production-ready React SPA for managing and searching flight routes with ground transportation. Built with modern best practices, comprehensive security features, and 70%+ test coverage.

## Tech Stack

- **React 19** with TypeScript 5.9 (strict mode)
- **Vite** for blazing-fast builds and HMR
- **React Router v7** for client-side routing
- **Axios** with JWT interceptors and token validation
- **TanStack React Query v5** for server state management
- **React Hook Form** for form handling and validation
- **React Hot Toast** for toast notifications
- **Tailwind CSS** for styling
- **Vitest** + **React Testing Library** for testing
- **jwt-decode** for token management

## Features

### Security & Authentication
- JWT-based authentication with comprehensive token management
- **Token expiration handling**:
  - Automatic validation on every API request
  - Periodic background checks (every 30 seconds)
  - 30-second expiration buffer to prevent edge cases
  - Graceful session timeout with user notification
- Protected routes for authenticated users
- Admin-only routes with role-based access control
- No `window.location.href` usage - maintains SPA state
- Callback pattern to avoid circular dependencies

### Performance & Optimization
- **Route-based code splitting**: All pages lazy-loaded
- **React Query optimization**:
  - Memoized QueryClient
  - Exponential backoff retry strategy
  - 5-minute stale time
  - Automatic cache invalidation
- **React Query DevTools** in development mode
- **Toast notifications** for user feedback
- Optimized bundle size with code splitting

### User Roles
- **ADMIN**: Full access to all features
- **AGENCY**: Access to route search only

### Pages

#### 1. Login Page (`/login`)
- Username/password authentication
- Form validation with react-hook-form
- Demo credentials display
- Automatic redirect after successful login

#### 2. Routes Search Page (`/routes`) - All Users
- Search routes by origin, destination, and date
- Dynamic location dropdowns
- Date picker with validation
- Display all possible route combinations
- Support for multi-segment routes (flight + ground transportation)
- Responsive results display with transportation type badges

#### 3. Locations Management (`/locations`) - Admin Only
- List all locations with pagination
- Create new locations with validation
- Edit existing locations
- Soft delete locations
- IATA code validation (3-4 uppercase characters)

#### 4. Transportations Management (`/transportations`) - Admin Only
- List all transportation routes
- Create new transportation with origin/destination
- Edit existing transportations
- Soft delete transportations
- Transportation type selection (FLIGHT, BUS, SUBWAY, UBER)
- Operating days multi-select (Monday-Sunday)

## Project Structure

```
ehy-flight-routes-frontend/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable components
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorMessage.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── layout/          # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── AppLayout.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── AdminRoute.tsx
│   │   ├── locations/       # Location-specific components
│   │   │   └── LocationForm.tsx
│   │   └── transportations/ # Transportation-specific components
│   │       └── TransportationForm.tsx
│   ├── pages/               # Page components
│   │   ├── LoginPage.tsx
│   │   ├── RoutesPage.tsx
│   │   ├── LocationsPage.tsx
│   │   └── TransportationsPage.tsx
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx
│   ├── services/            # API services
│   │   └── api.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   └── index.ts
│   ├── test/                # Test setup
│   │   └── setup.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env                     # Environment variables
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:8080`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:

Create `.env` file in project root:
```env
VITE_API_URL=http://localhost:8080/api
```

**Important**:
- In production, `VITE_API_URL` must be explicitly set
- App will throw error at startup if not configured in production
- Development fallback is `http://localhost:8080/api`

3. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Demo Credentials

**Admin User:**
- Username: `admin`
- Password: `admin123`

**Agency User:**
- Username: `agency`
- Password: `agency123`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage report

## API Integration

### Base URL
```
http://localhost:8080/api
```

### Endpoints

**Authentication:**
- `POST /auth/login` - Login with username/password

**Locations (Admin only):**
- `GET /locations` - List all locations
- `GET /locations/{id}` - Get location by ID
- `POST /locations` - Create location
- `PUT /locations/{id}` - Update location
- `DELETE /locations/{id}` - Soft delete location

**Transportations (Admin only):**
- `GET /transportations` - List all transportations
- `GET /transportations/{id}` - Get transportation by ID
- `POST /transportations` - Create transportation
- `PUT /transportations/{id}` - Update transportation
- `DELETE /transportations/{id}` - Soft delete transportation

**Routes (All authenticated users):**
- `GET /routes/search?originId={uuid}&destinationId={uuid}&date={yyyy-MM-dd}` - Search routes

### JWT Token Handling

All authenticated requests automatically include the JWT token in the Authorization header:
```
Authorization: Bearer {token}
```

On 401 response, the application automatically:
1. Clears stored authentication data
2. Redirects user to login page

## Key Features

### Type Safety
- Strict TypeScript configuration
- Comprehensive type definitions for all entities
- Type-safe API client
- Form data validation with TypeScript

### Error Handling
- Global error boundary for uncaught errors
- API error interceptor with user-friendly messages
- Form validation with inline error messages
- Loading states for all async operations

### State Management
- React Query for server state (caching, refetching, mutations)
- React Context for authentication state
- Local component state with useState
- Form state with react-hook-form

### Performance
- React Query caching (5-minute stale time)
- Optimistic updates for mutations
- Lazy loading with code splitting (ready for expansion)
- Efficient re-renders with proper memoization

### Accessibility
- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation support
- Screen reader support
- Focus management

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly UI elements
- Responsive tables with horizontal scroll

## Testing

### Running Tests

```bash
# Run tests in watch mode (recommended for development)
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Test Structure

Tests are colocated with components in `__tests__` directories:

```
src/
├── components/
│   ├── common/__tests__/
│   │   ├── ErrorMessage.test.tsx
│   │   └── LoadingSpinner.test.tsx
│   └── layout/__tests__/
│       ├── AdminRoute.test.tsx
│       ├── Header.test.tsx
│       └── ProtectedRoute.test.tsx
├── contexts/__tests__/
│   └── AuthContext.test.tsx
├── pages/__tests__/
│   └── LoginPage.test.tsx
└── utils/__tests__/
    ├── index.test.ts
    └── tokenUtils.test.ts
```

### Test Coverage

**Target**: 70%+ coverage across all metrics

**Current coverage includes**:
- ✅ **Authentication**: Login flow, token management, expiration handling
- ✅ **Authorization**: ProtectedRoute, AdminRoute, role-based access
- ✅ **Token utilities**: Expiration check, validation, JWT parsing
- ✅ **Utility functions**: Error formatting, helper methods
- ✅ **Common components**: LoadingSpinner, ErrorMessage
- ✅ **Layout components**: Header, navigation, logout
- ✅ **Form validation**: Login form, input validation

**Coverage metrics**:
- Statements: 70%+
- Branches: 70%+
- Functions: 70%+
- Lines: 70%+

### Writing Tests

Example test structure following best practices:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('ComponentName', () => {
  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<Component />);

    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('Expected Result')).toBeInTheDocument();
    });
  });
});
```

## Build and Deployment

### Production Build

```bash
npm run build
```

Output directory: `dist/`

### Environment Variables

Create `.env.production` for production:
```
VITE_API_URL=https://api.production.com/api
```

### Docker Support

Build Docker image:
```bash
docker build -t ehy-flight-routes-frontend .
```

Run container:
```bash
docker run -p 3000:80 ehy-flight-routes-frontend
```

## Code Quality

### TypeScript
- Strict mode enabled
- No implicit any
- Unused parameters/variables detection
- Consistent import/export patterns

### Code Style
- Functional components with hooks
- Custom hooks for reusable logic
- Composition over prop drilling
- Single responsibility principle

### Best Practices
- Error boundaries for error handling
- Loading states for async operations
- Proper form validation
- Authorization checks at component level
- Accessibility standards (WCAG 2.1 AA)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Security

### Token Management
The app implements comprehensive JWT token security:

**Features**:
- Token format validation before API requests
- Expiration check with 30-second buffer
- Periodic background validation (every 30 seconds)
- Automatic logout on expiration
- Clear error messages for users

**XSS Mitigation**:
- Token expiration reduces attack window
- Form input validation
- Content Security Policy headers (backend)

**Note**: For maximum security, consider implementing httpOnly cookies on the backend. Current implementation uses localStorage with comprehensive expiration handling as a mitigation strategy.

### Authorization
- Route-level protection with `ProtectedRoute` and `AdminRoute`
- Role-based UI rendering
- API-level authorization checks (backend)
- No sensitive operations exposed without proper authorization

## Troubleshooting

### API Connection Issues

**Problem**: Cannot connect to backend API
**Solutions**:
1. Verify backend is running on `http://localhost:8080`
2. Check CORS configuration in backend SecurityConfig
3. Verify `VITE_API_URL` in `.env` file
4. Check browser console for detailed error messages

**Problem**: `VITE_API_URL environment variable is required`
**Solution**: Create `.env` file with `VITE_API_URL=http://localhost:8080/api`

### Token and Authentication Issues

**Problem**: Frequent "Session expired" messages
**Solutions**:
1. Check backend JWT expiration settings
2. Frontend checks token 30 seconds before expiration (configurable)
3. Verify system clock is synchronized

**Problem**: Automatic logout after page refresh
**Cause**: Token expired or invalid
**Solution**: Login again with valid credentials

### Build Errors

**Problem**: Build fails with TypeScript errors
**Solutions**:
1. Clear node_modules: `rm -rf node_modules`
2. Clear Vite cache: `rm -rf node_modules/.vite`
3. Reinstall dependencies: `npm install`
4. Run TypeScript check: `npm run build`

**Problem**: Module not found errors
**Solution**: Ensure all dependencies are installed: `npm install`

### Test Failures

**Problem**: Tests failing locally
**Solutions**:
1. Clear test cache: `npm run test -- --clearCache`
2. Ensure clean environment: `rm -rf node_modules && npm install`
3. Check if tests pass in CI/CD environment
4. Verify test setup file is properly configured

## Contributing

1. Create feature branch
2. Make changes with proper TypeScript types
3. Add/update tests
4. Run linter: `npm run lint`
5. Run tests: `npm run test`
6. Submit pull request

## License

Private - Enes Airlines

## Support

For issues or questions, contact the development team.
