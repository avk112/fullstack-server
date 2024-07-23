# Use the Node.js image with your version
FROM node:20.11.1-alpine AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Copy the entire app to the container
COPY . .

# Copy the .env and .env.development files
COPY .env ./

# Install app dependencies
RUN npm install

# Expose the port the app runs on
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start:dev"]