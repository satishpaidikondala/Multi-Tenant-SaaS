# frontend/Dockerfile
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose the React port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]