FROM node:18-alpine

# Install Bun
RUN apk add --no-cache curl && \
    curl -fsSL https://bun.sh/install | bash && \
    mv /root/.bun/bin/bun /usr/local/bin/bun

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./ 

RUN bun install

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["bun", "dev"]
