# ==========================================
# Production-Grade Multi-Stage Dockerfile
# Next.js Frontend (React 19 / TypeScript)
# ==========================================

# 1. Base Image
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat
ENV NEXT_TELEMETRY_DISABLED=1

# 2. Dependencies Stage
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* package-lock.json* ./
# Install dependencies cleanly
RUN \
  if [ -f pnpm-lock.yaml ]; then corepack enable pnpm && corepack prepare pnpm@10.4.1 --activate && pnpm i --no-frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  else npm install; \
  fi

# 3. Builder Stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set production build environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Accept NEXT_PUBLIC build-time args if provided
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN \
  if [ -f pnpm-lock.yaml ]; then corepack enable pnpm && corepack prepare pnpm@10.4.1 --activate && pnpm run build; \
  else npm run build; \
  fi

# 4. Production Runner Stage
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create a secure non-root system user and group
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary assets from builder stage
COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size (~100MB instead of ~1GB)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Health check to ensure frontend is responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]
