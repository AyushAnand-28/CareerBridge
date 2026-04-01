# ═══════════════════════════════════════════════════════════════════════════════
# Stage 1 — Builder
# Compiles TypeScript to JavaScript and generates the Prisma client
# ═══════════════════════════════════════════════════════════════════════════════
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (cached layer unless package.json changes)
COPY package*.json ./
RUN npm ci

# Copy source and compile
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

# Generate Prisma client then compile TypeScript
RUN npx prisma generate
RUN npm run build

# ═══════════════════════════════════════════════════════════════════════════════
# Stage 2 — Production image
# Lean runtime — only compiled JS, node_modules, and Prisma client
# ═══════════════════════════════════════════════════════════════════════════════
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy only what's needed to run
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
# Prisma client lives in node_modules — already installed above

EXPOSE 5000

# Use the compiled entry point
CMD ["node", "dist/index.js"]
