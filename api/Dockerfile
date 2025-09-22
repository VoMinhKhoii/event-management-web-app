FROM node:24-alpine

# Set working directory first
WORKDIR /app

# Copy package.json and install dependencies first (for better caching)
COPY package*.json ./
RUN npm ci

COPY . .

# Expose port
EXPOSE 8800

# Start the application
CMD ["node", "app.js"]