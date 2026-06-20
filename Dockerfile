# syntax=docker/dockerfile:1

# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app

# Skip husky's "prepare" hook setup inside the container (no .git here).
ENV HUSKY=0

# Install deps + build. Source is copied first because Nuxt's postinstall
# (`nuxt prepare`) needs the project files to generate types.
COPY . .
RUN npm ci && npm run build

# ---- Runtime stage ----
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
# Nitro's node-server reads HOST/PORT and any NUXT_PUBLIC_* vars at runtime.
ENV HOST=0.0.0.0
ENV PORT=3000

# Only the built server output is needed at runtime.
COPY --from=build /app/.output ./.output

USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
