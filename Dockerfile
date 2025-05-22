FROM oven/bun:alpine

WORKDIR /usr/src/app

# Copy entire codebase (including schema.prisma) first
COPY . .

# Install dependencies (now with prisma/schema.prisma available)
RUN bun install

# (Optional) Prisma steps
RUN bunx prisma migrate dev
RUN bunx prisma generate
RUN bun run prisma/seed.ts

EXPOSE 3000

CMD ["bun", "dev"]
