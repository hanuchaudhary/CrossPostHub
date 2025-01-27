From node:18-alpine

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./ 

RUN npm install --force

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"]

