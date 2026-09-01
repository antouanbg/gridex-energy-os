FROM node:22-alpine AS build
WORKDIR /app
COPY services/api/package*.json ./
RUN npm ci
COPY services/api/tsconfig.json ./
COPY services/api/src ./src
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY services/api/package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
USER node
EXPOSE 8080
CMD ["node", "dist/index.js"]
