# Torrent Server

<a href="https://webtorrent.io/">
<img src="https://camo.githubusercontent.com/357343e823b1c8d37418edce5ac401832eda2d27/68747470733a2f2f776562746f7272656e742e696f2f696d672f576562546f7272656e742e706e67" height="30px" alt="Uses Webtorrent" />
</a>

A Node.js server to which user can upload torrent files and download them to google drive.
Basic principle behind working is similar to [sarangnx/google-drive-download](https://github.com/sarangnx/google-drive-download).

## Development Setup

```bash
# copy example and set environment variables
cp .env.example .env

# install dependencies
yarn

# start server with nodemon
yarn dev
```

## Environment variables

Before you can run the app server, you need to set some variables.

**Google OAuth**

Goto [Google Developer Console](https://console.developers.google.com/apis/credentials)
and obtain `CLIENT_ID` and `CLIENT_SECRET`.  
Set `REDIRECT_URL` = `http://host/auth/callback`

**Port**

set any number other than _well-known ports_ when using locally. When deploying to heroku, you cannot use custom ports. Heroku sets `PORT` variable by itself.

```bash
# THESE ARE THE REQUIRED ENV VARS

NODE_ENV=development

# GOOGLE OAUTH
CLIENT_ID=xxx.apps.googleusercontent.com
CLIENT_SECRET=clientsecret
REDIRECT_URL=http://lvh.me:3000/auth/callback

# PORT
PORT=3000

# BASEURL OF WEB APP
WEBAPP_URI=http://localhost:8080
```
