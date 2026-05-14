FROM oven/bun:1 AS backend-builder
WORKDIR /app
COPY backend/package.json backend/bun.lock ./
RUN bun install --frozen-lockfile
COPY backend/ .
EXPOSE 3000
CMD ["bun", "run", "src/index.ts"]
