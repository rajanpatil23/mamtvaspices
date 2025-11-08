#############################################
# Multi-stage Dockerfile: build client and server
#############################################

FROM node:22-alpine AS builder
WORKDIR /app

# ---- Build client (Next.js) ----
# Copy client package files and install
COPY ../client/package*.json ./client/
RUN cd client && npm ci

# Copy client source and build
COPY ../client ./client
RUN cd client && npm run build

# ---- Build server ----
# Copy server source and build
COPY package*.json ./
RUN npm ci

# Copy client node_modules into top-level node_modules so runtime "next" and its peers
# are available to the server when it requires 'next'. This avoids needing to run
# a second install of client deps at runtime.
RUN mkdir -p /app/node_modules && cp -R client/node_modules/. /app/node_modules || true

# Copy server source and build
COPY . .
RUN npm run build

#############################################
# Runtime image
#############################################
FROM node:22-alpine AS runtime
WORKDIR /app

# Copy built server (dist) and server node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Copy built Next client (.next) and public into a predictable path
# The server expects the Next build at /app/src/client by default (NEXT_CLIENT_DIR)
RUN mkdir -p /app/src/client
COPY --from=builder /app/client/.next /app/src/client/.next
COPY --from=builder /app/client/public /app/src/client/public
COPY --from=builder /app/client/package*.json /app/src/client/

ENV NODE_ENV=production
ENV NEXT_CLIENT_DIR=/app/src/client
EXPOSE 5000

# Run the compiled server
CMD ["node", "dist/server.js"]
