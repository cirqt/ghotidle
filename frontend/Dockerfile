# Frontend Dockerfile
FROM node:20-slim
WORKDIR /app/frontend
# Copy only package.json and package-lock.json first
COPY package*.json ./
# Install dependencies
RUN npm install
# Now copy the rest of the files
COPY . ./
EXPOSE 3000
