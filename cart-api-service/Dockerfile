FROM node:12-alpine

# Create app directory inside the image
WORKDIR /usr/src/app

# Copy package.json and package-lock.json file from the current directory to the image
COPY package*.json ./

# Install node_modules
RUN npm ci --only=prod && npm cache clean --force

# Copy the rest of the files
COPY . .

# Build the dist folder
RUN npm run build

# Env variables
ENV PORT=8080

# Bind to the port 
EXPOSE 8080

# COmmand for running app
CMD [ "npm", "run", "start:prod" ]