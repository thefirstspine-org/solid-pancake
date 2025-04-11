FROM node:20

WORKDIR /solid-pancake

COPY . .

RUN npm i 
RUN npm run build

CMD ["node", "--import", "solarwinds-apm", "dist/main.js"]
