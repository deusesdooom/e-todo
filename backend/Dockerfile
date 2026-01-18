FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY src ./src

# Copy frontend (if serving from backend)
# COPY ../frontend ./frontend  <-- COMMENTED OUT, as Docker Compose volume mount handles this

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]