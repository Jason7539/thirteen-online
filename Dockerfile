FROM node:16

# create working directory 
WORKDIR /usr/src/app

# Install dependencies 
COPY package*.json ./ 

RUN npm install 

# Uncomment below for production 
# RUN npm ci --only=production 

# Bundle app source 
COPY . . 

# Expose port app binds to 
EXPOSE 8080

# Commands to run app 
CMD ["node", "./src/app.js"]