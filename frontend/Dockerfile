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
# Install a simple static file server
RUN npm install -g http-server
EXPOSE 3000
CMD ["sh", "-c", "http-server build -p ${PORT:-3000}"]
