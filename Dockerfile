FROM node:14.15.5

# Install specific versions of pnpm and @nestjs/cli
RUN npm install -g pnpm@6.32.2 @nestjs/cli@7.5.2

WORKDIR /app

# Copy package.json and pnpm-lock.yaml (if it exists)
COPY package.json pnpm-lock.yaml* ./

# Install all dependencies, including dev dependencies
RUN pnpm install --frozen-lockfile || pnpm install --no-frozen-lockfile

# Manually install @types/ioredis and ioredis
RUN pnpm add -D @types/ioredis ioredis

# Copy source code
COPY . .

# Display installed packages (for debugging)
RUN pnpm list

# Try to build
RUN pnpm run build

EXPOSE 3000

CMD ["pnpm", "run", "dev"]