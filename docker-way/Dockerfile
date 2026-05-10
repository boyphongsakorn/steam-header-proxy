FROM node:22-alpine

# Create app directory
WORKDIR /app

# Copy source (no dependencies - uses only Node built-ins)
COPY server.js .

# Non-root user for security
RUN addgroup -S steam && adduser -S steam -G steam
USER steam

EXPOSE 3000

CMD ["node", "server.js"]
