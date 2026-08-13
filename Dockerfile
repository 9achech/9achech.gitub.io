# Use official Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --production

# Copy all application source files
COPY . .

# Create volume mount point for persistent database
RUN mkdir -p /app/data

# Expose HTTP port
EXPOSE 8080

# Environment variables
ENV PORT=8080

# Start Node.js Express REST API server & database
CMD ["node", "server/server.js"]
