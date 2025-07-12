# Multi-stage build for React application with Express server
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application and server files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./

# Expose port 3000
EXPOSE 3000

# Start the Express server
CMD ["npm", "start"] 