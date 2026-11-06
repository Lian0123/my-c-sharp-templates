FROM node:24.22.2-bookworm-slim
WORKDIR /ops
COPY package*.json ./
RUN npm ci --omit=dev
COPY deadletter.mjs ./
USER node
ENTRYPOINT ["node", "/ops/deadletter.mjs"]
