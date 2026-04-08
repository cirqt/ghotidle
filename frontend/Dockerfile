# Frontend Dockerfile
FROM node:20-slim
WORKDIR /app/frontend
# Copy only package.json and package-lock.json first
COPY package*.json ./
# Install dependencies
RUN npm install
# Now copy the rest of the files
COPY . ./
# Build the React app for production
RUN npm run build
EXPOSE 3000
CMD ["npx", "serve", "-s", "build", "-l", "tcp://0.0.0.0:3000"]
