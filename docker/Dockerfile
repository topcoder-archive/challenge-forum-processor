# Use the base image with Node.js
FROM node:22.23.2

# Copy the current directory into the Docker image
COPY . /challenge-forum-processor

# Set working directory for future use
WORKDIR /challenge-forum-processor

# Install the dependencies from package.json
RUN npm ci
#RUN npm run build
#RUN npm run test

CMD npm start