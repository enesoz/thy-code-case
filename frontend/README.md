# Frontend - React SPA

Production-ready React application for flight route management.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

**Access:** http://localhost:3000

## Tech Stack

- React 19 with TypeScript 5.9
- Vite (build tool)
- React Router v7
- TanStack React Query v5
- Axios with JWT interceptors
- React Hook Form
- Tailwind CSS
- Vitest + React Testing Library

## Configuration

Create `.env` file:
```env
VITE_API_URL=http://localhost:8080/api
```

## Features

### Authentication
- JWT-based with automatic expiration handling
- Token validation every 30 seconds
- Graceful session timeout

### User Roles
- **ADMIN**: Full access to all features
- **AGENCY**: Routes search only

### Pages
- `/login` - Authentication
- `/routes` - Search routes (all users)
- `/locations` - Manage locations (admin only)
- `/transportations` - Manage transportations (admin only)

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable components
│   ├── pages/           # Page components
│   ├── contexts/        # React contexts (Auth)
│   ├── services/        # API client
│   ├── types/           # TypeScript types
│   └── utils/           # Utilities
├── .env                 # Environment variables
└── vite.config.ts       # Vite configuration
```

## Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:ui` - Tests with UI
- `npm run test:coverage` - Coverage report

## Testing

**Coverage:** 70%+ across all metrics

```bash
# Watch mode
npm test

# With UI
npm run test:ui

# With coverage
npm run test:coverage
```

## API Integration

All endpoints require JWT token in Authorization header (except `/auth/login`).

**Base URL:** `http://localhost:8080/api`

See backend README for endpoint details.

## Security

- JWT token validation with expiration checks
- Protected routes with role-based access
- Form input validation
- XSS mitigation

## Docker

```bash
# Build image
docker build -t frontend .

# Run container
docker run -p 3000:80 frontend
```

## Performance

- Route-based code splitting
- React Query caching (5-minute stale time)
- Optimized bundle size
- Lazy loading

## Troubleshooting

**API connection issues:**
- Verify backend is running on http://localhost:8080
- Check `VITE_API_URL` in `.env`
- Check CORS configuration in backend

**Build errors:**
```bash
rm -rf node_modules
npm install
npm run build
```

**Test failures:**
```bash
npm run test -- --clearCache
```

## Browser Support

Chrome, Firefox, Safari, Edge (latest versions)
