# ---------- build ----------
FROM node:20-alpine AS build
WORKDIR /app

# 使用国内源
RUN npm config set registry https://registry.npmmirror.com

COPY package.json ./
COPY pnpm-lock.yaml* ./
COPY package-lock.json* ./
COPY yarn.lock* ./

RUN if [ -f pnpm-lock.yaml ]; then \
      npm i -g pnpm && pnpm i --frozen-lockfile; \
    elif [ -f package-lock.json ]; then \
      npm ci; \
    elif [ -f yarn.lock ]; then \
      npm i -g yarn && yarn install --frozen-lockfile; \
    else \
      npm i; \
    fi

COPY . .
RUN npm run build

# ---------- runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=build /app/.output ./.output
COPY --from=build /app/package.json ./package.json

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
