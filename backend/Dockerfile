# ═══════════════════════════════════════════════════════════════════════════════
# Stage 1 — Builder
# Compiles TypeScript to JavaScript and generates the Prisma client
# ═══════════════════════════════════════════════════════════════════════════════
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json AND the prisma folder first.
# This prevents the `postinstall` script (`prisma generate`) from crashing
# during `npm ci` because it needs `prisma/schema.prisma` to exist.
COPY package*.json ./
COPY prisma ./prisma

RUN npm ci

# Copy source and compile
COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# ═══════════════════════════════════════════════════════════════════════════════
# Stage 2 — Production image
# Lean runtime — only compiled JS, node_modules, and Prisma client
# ═══════════════════════════════════════════════════════════════════════════════
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Again, copy package.json and prisma folder before npm ci
COPY package*.json ./
COPY --from=builder /app/prisma ./prisma

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
# Prisma client is automatically generated into node_modules during npm ci 

EXPOSE 5000

# Use the compiled entry point
CMD ["node", "dist/index.js"]
