####
# This Dockerfile is used to build a Docker image for the LabSeq Frontend (Angular)
# Build the image with: docker build -f Dockerfile -t labseq-frontend .
# Run the container with: docker run -i --rm -p 4200:80 labseq-frontend
####

## Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build Angular app for production
RUN npm run build --prod

## Stage 2: Runtime (Nginx)
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app from build stage
COPY --from=build /app/dist/labseq-frontend/browser /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]