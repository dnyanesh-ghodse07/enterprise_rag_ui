# ═══════════════════════════════════════════════════════
# RIO AI FRONTEND — Production Dockerfile
#
# Stage 1: Build the React app (Node.js)
# Stage 2: Serve with Nginx (tiny, fast)
#
# Result: ~25MB image (!!!)
# ═══════════════════════════════════════════════════════

# ─── Stage 1: Build ───────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (layer caching)
COPY package.json package-lock.json ./
RUN npm ci --silent

# Copy source code and build
COPY . .

# Build-time environment variables
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ─── Stage 2: Serve ───────────────────────────────────
FROM nginx:alpine AS runner

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget -q --spider http://localhost:80/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
