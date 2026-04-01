# ═══════════════════════════════════════════════════════════════
# SAST Pipeline — Frontend Dockerfile (Multi-stage)
# Author: Mohamed Adhnaan J M | BYTEAEGIS (byteaegis.in)
#
# Stage 1: Build the React app with Vite
# Stage 2: Serve the static build with nginx
# ═══════════════════════════════════════════════════════════════

# ── Stage 1: Build ───────────────────────────────────────────
FROM node:20-slim AS build

WORKDIR /app

# Copy package files first for Docker layer caching
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy application source
COPY . .

# Build the production bundle
RUN npm run build

# ── Stage 2: Serve ───────────────────────────────────────────
FROM nginx:alpine

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose nginx port
EXPOSE 80

# Default nginx command
CMD ["nginx", "-g", "daemon off;"]
