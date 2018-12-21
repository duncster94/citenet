FROM node:10

# Create app directory
WORKDIR /usr/src/citenet

# Install app dependencies
COPY package*.json ./

RUN npm install
RUN npm install nodemon
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . .

EXPOSE 8001
CMD [ "nodemon", "app.js" ]
