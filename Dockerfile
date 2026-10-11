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
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* .npmrc* ./
RUN pnpm install --frozen-lockfile --dangerously-allow-all-builds

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

# Copy built application & node_modules with correct ownership
COPY --chown=nextjs:nodejs --from=builder /app/package.json ./package.json
COPY --chown=nextjs:nodejs --from=builder /app/pnpm-lock.yaml* ./pnpm-lock.yaml
COPY --chown=nextjs:nodejs --from=builder /app/pnpm-workspace.yaml* ./pnpm-workspace.yaml
COPY --chown=nextjs:nodejs --from=builder /app/.npmrc* ./.npmrc
COPY --chown=nextjs:nodejs --from=builder /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs --from=builder /app/.next ./.next
COPY --chown=nextjs:nodejs --from=builder /app/public ./public
COPY --chown=nextjs:nodejs --from=builder /app/dist ./dist
COPY --chown=nextjs:nodejs --from=builder /app/src ./src
COPY --chown=nextjs:nodejs --from=builder /app/server.ts ./server.ts
COPY --chown=nextjs:nodejs --from=builder /app/next.config.mjs* ./
COPY --chown=nextjs:nodejs --from=builder /app/tsconfig.json ./tsconfig.json
COPY --chown=nextjs:nodejs --from=builder /app/bidding-items.json* ./

USER nextjs

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
