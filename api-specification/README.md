# API Specification Module

This module contains the OpenAPI specification for the THY Flight Routes API and auto-generated TypeScript types.

## Overview

The OpenAPI schema is the single source of truth for API contracts between the backend and frontend. TypeScript types are automatically generated from this schema to ensure type safety.

## Structure

```
api-specification/
├── openapi.json          # OpenAPI 3.0 schema (generated from backend)
├── generated/            # Auto-generated TypeScript types
│   ├── models/          # DTO type definitions
│   ├── services/        # API service interfaces
│   └── index.ts         # Main export
├── package.json         # NPM configuration
└── README.md           # This file
```

## Usage

### Generate Types from Backend

1. **Ensure backend is running** on `http://localhost:8080`

2. **Update schema and generate types:**
   ```bash
   cd api-specification
   npm run update
   ```

   This will:
   - Download the latest OpenAPI schema from the backend
   - Generate TypeScript types in the `generated/` directory

### Manual Schema Update

If you have the OpenAPI schema file:

```bash
cd api-specification
npm run generate:types
```

### Use Generated Types in Frontend

The frontend project references these types:

```typescript
import type { LoginResponse, LocationResponse } from '@thy-code-case/api-specification';
```

## Scripts

- `npm run copy:schema` - Download OpenAPI schema from running backend
- `npm run generate:types` - Generate TypeScript types from openapi.json
- `npm run update` - Update schema and regenerate types (recommended)
- `npm run clean` - Remove generated files

## Workflow

### When Backend DTOs Change

1. Update backend DTO classes
2. Run backend: `mvn spring-boot:run`
3. Update types: `cd api-specification && npm run update`
4. Rebuild frontend: `cd ../ehy-flight-routes-frontend && npm run build`

TypeScript will catch any breaking changes at compile time.

## Type Generation Tool

This module uses [openapi-typescript-codegen](https://github.com/ferdikoomen/openapi-typescript-codegen) to generate:
- TypeScript interfaces for all DTOs
- Axios-based API client (optional)
- Full type safety for requests and responses

## Notes

- The `generated/` directory is gitignored and regenerated on demand
- The `openapi.json` file can be committed to version control for offline development
- Frontend build can be configured to auto-regenerate types before compilation
