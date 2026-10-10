# =========================================================================
# Multi-stage Dockerfile for BidPulse Auction Simulator & CMS Controller
# Node.js 20 on Alpine Linux + Next.js App Router + Custom Socket.io Server
# =========================================================================

# ----------------- Stage 1: Dependencies -----------------
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@12.6.0 --activate

# Install dependencies based on preferred package manager
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# ----------------- Stage 2: Builder -----------------
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@12.6.0 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment to production for build optimization
ENV NODE_ENV=production
ENV NEXT_PHASE=phase-production-build

RUN pnpm build

# ----------------- Stage 3: Production Runner -----------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install pnpm for running the custom server
RUN corepack enable && corepack prepare pnpm@12.6.0 --activate

# Create non-root system user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application & node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/src ./src
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/bidding-items.json* ./

# Prepare data directory for SQLite persistence
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data /app

USER nextjs

EXPOSE 3000

VOLUME ["/app/data"]

CMD ["pnpm", "start"]
