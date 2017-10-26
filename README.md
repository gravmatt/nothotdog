# NotHotdog

Detects hotdogs or not hotdogs.

![alt text](jinjiang.jpg "ISSA HOTDOG!")

## Install dependencies

```
npm install
```

## Setup

Edit `config.js` with:

Add a random string here `FACEBOOK_VERIFY_TOKEN`. It is needed to set the webhook if you don't know how to deal with the verification process.

`FACEBOOK_PAGE_TOKEN` is needed to give your bot permission to response with a message.

`AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` is needed to talk to the amazon API.

*Btw you need a AWS account.*

## Run it

```
node index.js
```

*If you dont have nodejs installed, you should take care of that first.*
