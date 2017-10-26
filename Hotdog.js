'use strict';

const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const config = require('./config');
const Rekognition = require('aws-sdk/clients/rekognition');
const r = new Rekognition(config.aws);
const request = require('request-promise');


class Hotdog {
    constructor(webhookEvent) {
        this.senderID = webhookEvent.sender.id;
        this.imageURL = webhookEvent.message &&
            webhookEvent.message.attachments &&
            webhookEvent.message.attachments[0].type === 'image' &&
            webhookEvent.message.attachments[0].payload.url;
    }

    doIt() {
        this.sendTyping();

        if(!this.imageURL) {
            this.sendMessage('Only Hotdogs!');
            return;
        }

        const self = this;

        new Promise((resolve, reject) => {
            (self.imageURL.startsWith('https') ? https : http)
            .get(self.imageURL, (result) => {
                const imageFile = self.getRandomFile();
                result.pipe(fs.createWriteStream(imageFile))
                .on('finish', () => {
                    resolve(imageFile);
                });
            });
        })
        .then((imageFile) => {
            return new Promise((resolve, reject) => {
                fs.readFile(imageFile, (err, data) => {
                    if(err) reject(err);
                    else resolve(data);
                    fs.unlink(imageFile);
                });
            });
        })
        .then((imageData) => {
            return new Promise((resolve, reject) => {
                const params = {
                    Image: {
                        Bytes: new Buffer(imageData)
                    },
                    MaxLabels: 5,
                    MinConfidence: 80
                };
                r.detectLabels(params, (err, data) => {
                    if(err) {
                        console.log(err);
                        resolve(false);
                    }
                    else {
                        console.log(data);
                        const len = data.Labels.filter((label => {return label.Name === 'Hot Dog'})).length;
                        resolve(len > 0);
                    }
                });
            });
        })
        .then((isHotdog) => {
            self.sendMessage(isHotdog ? 'Hotdog' : 'Not Hotdog');
        })
        .catch((err) => {
            console.log(err);
            self.sendMessage('Not Hotdog!');
        });
    }

    sendMessage(text) {
        const url = `https://graph.facebook.com/v2.6/me/messages?access_token=${config.facebook.pageToken}`;

        request.post(url, {
            json: {
                recipient: {id: this.senderID},
                message: {text: text}
            }
        })
        .catch(console.log);
    }

    sendTyping() {
        const url = `https://graph.facebook.com/v2.6/me/messages?access_token=${config.facebook.pageToken}`;
        
        request.post(url, {
            json: {
                recipient: {id: this.senderID},
                sender_action: 'typing_on'
            }
        })
        .catch(console.log);
    }

    random(len) {
        let rdmString = '';
        for (; rdmString.length < len; rdmString += Math.random().toString(36).substr(2));
        return rdmString.substr(0, len);
    }

    getRandomFile() {
        const downloads = path.join(__dirname, 'downloads');
        if(!fs.existsSync(downloads)) {
            fs.mkdirSync(downloads);
        }
        return path.join(downloads, this.random(32));
    }
}


module.exports = Hotdog;
