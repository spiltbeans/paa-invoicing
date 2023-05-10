FROM node:16.16.0

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i --production

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]