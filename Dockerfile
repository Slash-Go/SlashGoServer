FROM node:17
WORKDIR /usr/src/app
COPY . .
RUN npm install --production
RUN npm install typescript
RUN npm run build
CMD ["npm", "run", "start"]
EXPOSE 3000