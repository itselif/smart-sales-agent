# Use Node.js as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy all files
COPY . .

# Build documentation
RUN npx mindbricks-docs-face -b

# Expose port for serving
EXPOSE 3000

# Serve the documentation
CMD ["serve", ".mindbricks", "-p", "3000"]