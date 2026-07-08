FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy prisma before npm install
COPY prisma ./prisma

# Install dependencies
RUN npm ci

# Copy remaining source
COPY . .

# Build
RUN npm run build

FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD ["npm","start"]