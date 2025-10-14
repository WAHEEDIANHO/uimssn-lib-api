# Use an appropriate Node.js base image
FROM node:24
# Set the working directory
WORKDIR /app
# Copy package.json and yarn.lock
COPY package.json yarn.lock ./
# Install dependencies
RUN yarn install
# Copy the rest of the application code
COPY . .
# Build the application
RUN yarn run build
# Set the command to run the application
CMD ["yarn", "run", "start"]