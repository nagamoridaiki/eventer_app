FROM node:12
RUN mkdir -p /app
WORKDIR /app
COPY ./src .
RUN npm install
EXPOSE 3000
CMD [ "npm", "run", "dev" ]