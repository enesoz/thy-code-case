# Stage 1: Build
FROM node:22-alpine AS build

WORKDIR /app

# Accept API URL as build argument with default for Docker Compose
ARG VITE_API_URL=http://localhost:8080/api
ENV VITE_API_URL=$VITE_API_URL

# Copy frontend package files first
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source code
COPY frontend/ .

# Copy api-specification generated types to the expected location
# Create parent directory and copy
RUN mkdir -p ../api-specification
COPY api-specification/generated ../api-specification/generated
COPY api-specification/shared.ts ../api-specification/shared.ts

# Build the application (use docker-specific build that skips prebuild)
RUN npm run build:docker

# Stage 2: Production with nginx
FROM nginx:1.27-alpine

# Copy custom nginx config
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
