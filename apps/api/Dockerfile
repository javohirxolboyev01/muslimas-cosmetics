# Build konteksti — repo ildizi (monorepo: @mc/shared kerak)
FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
COPY apps/shop/package.json apps/shop/
COPY apps/admin/package.json apps/admin/
RUN npm ci

COPY packages/shared packages/shared
COPY apps/api apps/api
RUN npm run build -w @mc/api && npm prune --omit=dev

WORKDIR /app/apps/api
ENV NODE_ENV=production
# Har deploy'da migratsiyalar qo'llanadi. SEED_ON_START=true — boshlang'ich ma'lumotlar va admin (bir martalik)
CMD ["sh", "-c", "node dist/migrate.js && if [ \"$SEED_ON_START\" = true ]; then node dist/seed.js; fi && exec node dist/server.js"]
