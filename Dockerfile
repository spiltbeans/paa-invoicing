FROM node:16.16.0

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i

COPY . .

EXPOSE 4000

CMD ["npm", "start"]