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
COPY apps/shop apps/shop
# Railway servis o'zgaruvchisi build paytida ARG orqali keladi: https://<api-domen>/api
ARG VITE_API_URL
RUN test -n "$VITE_API_URL" || (echo "VITE_API_URL berilmagan" >&2 && exit 1)
RUN npm run build -w @mc/shop

FROM caddy:2-alpine
COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/apps/shop/dist /srv
