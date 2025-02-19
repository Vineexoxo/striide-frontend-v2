# Stage 1: Build the application
FROM node:18-alpine AS builder
# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set working directory
# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the Next.js app
RUN npm run build

# Stage 2: Create a minimal production image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy only the necessary files from the builder stage
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Expose port
# Build the Next.js app
RUN npm run build

# Stage 2: Create a minimal production image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy only the necessary files from the builder stage
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Expose port
EXPOSE 3000

# Use production start command
CMD ["npm", "run", "start"]
