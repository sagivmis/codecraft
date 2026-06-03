# Production image for @codecraft/api.
# Multi-stage so the runtime layer has no dev tooling.

# --- Builder --------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /repo

RUN corepack enable && corepack prepare pnpm@11.5.1 --activate

# Copy only the files needed to install with the workspace context.
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc tsconfig.base.json ./
COPY packages ./packages
COPY apps/api ./apps/api

RUN pnpm install --frozen-lockfile

# Build shared packages first, then the API itself.
RUN pnpm -r --filter "./packages/*" build && \
    pnpm --filter '@codecraft/api' build

# Prune to production-only deps for a smaller runtime image.
RUN pnpm --filter '@codecraft/api' deploy --prod --legacy /out

# --- Runtime --------------------------------------------------------------
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /out/package.json ./package.json
COPY --from=builder /out/node_modules ./node_modules
COPY --from=builder /repo/apps/api/dist ./dist

EXPOSE 8787
USER node

CMD ["node", "dist/index.js"]
