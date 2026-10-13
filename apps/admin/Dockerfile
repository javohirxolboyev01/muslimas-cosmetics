# Build konteksti — repo ildizi (monorepo: @mc/shared kerak)
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
COPY apps/shop/package.json apps/shop/
COPY apps/admin/package.json apps/admin/
RUN npm ci

COPY packages/shared packages/shared
COPY apps/admin apps/admin
# API shu domendagi /api orqali (Caddy uni ichki tarmoqdan api servisiga uzatadi)
ENV VITE_API_URL=/api
ENV VITE_USE_MOCK=false
RUN npm run build -w @mc/admin

FROM caddy:2-alpine
COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/apps/admin/dist /srv
