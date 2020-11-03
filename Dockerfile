FROM node:alpine

# Create a folder for code
WORKDIR /server

# install npm dependencies
COPY package*.json yarn.lock ./
RUN yarn 

# Heroku does not respect the expose
# given in dockerfile. But this can be
# used for local testing.
EXPOSE 3000

# Copy the code to workdir
COPY . .

# start the server
CMD ["yarn", "start"]
