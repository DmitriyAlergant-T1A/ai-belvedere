# Build stage
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Expose build arguments as environment variables
ARG VITE_COMPANY_NAME
ENV VITE_COMPANY_NAME=$VITE_COMPANY_NAME

ARG VITE_ANTHROPIC_ENABLE
ENV VITE_ANTHROPIC_ENABLE=$VITE_ANTHROPIC_ENABLE

ARG VITE_CHECK_AAD_AUTH
ENV VITE_CHECK_AAD_AUTH=$VITE_CHECK_AAD_AUTH

ARG VITE_LOGOUT_URL
ENV VITE_LOGOUT_URL=$VITE_LOGOUT_URL

ARG VITE_LOGIN_URL
ENV VITE_LOGIN_URL=$VITE_LOGIN_URL

# Build the Vite application
RUN npm run client-build

# Prune development dependencies
RUN npm prune --production

# Final stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src-server ./src-server

EXPOSE 5500
CMD ["npm", "run", "server"]
