# Use an official Node.js runtime as a base image
FROM node:18.12.1

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
# ci = continous integration. Install required dependencies
# or RUN npm install
RUN npm ci

# Copy the rest of the application code to the working directory
# files in .dockerignore will not be copied.
COPY . .

# Expose the port the app runs on
EXPOSE 7080

# Define the command to run the application
CMD ["npm", "start"]


