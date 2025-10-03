FROM node:24

WORKDIR /solid-pancake

COPY . .

RUN npm i 
RUN npm run build

CMD ["node", "dist/main.js"]
