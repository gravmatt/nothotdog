'use strict';

const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const awsConfig = require('./aws-config');
const Rekognition = require('aws-sdk/clients/rekognition');
const r = new Rekognition(awsConfig);
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const oratio = require('@orat.io/integration-sdk');
const PORT = process.env.NOTHOTDOG_PORT || 8082;
const botToken = '';

app.set('trust proxy', 1);
app.set('x-powered-by', false);

app.disable('etag');
app.disable('view cache');

app.use(bodyParser.json());
app.use(oratio());

function random(len) {
    let rdmString = "";
    for (; rdmString.length < len; rdmString += Math.random().toString(36).substr(2))
;
    return rdmString.substr(0, len);
}

function getRandomFile() {
    const downloads = path.join(__dirname, 'downloads');
    if(!fs.existsSync(downloads)) {
        fs.mkdirSync(downloads);
    }
    return path.join(downloads, random(32));
}

app.post('/nohotdog', (req, res) => {
    console.log(req.body);

    if(req.body.message.type === 'image') {
        (req.body.message.content.startsWith('https') ? https : http)
        .get(req.body.message.content, (result) => {
            const imageFile = getRandomFile();

            result.pipe(fs.createWriteStream(imageFile))
            .on('finish', () => {
                const params = {
                    Image: {
                        Bytes: new Buffer(fs.readFileSync(imageFile))
                    },
                    MaxLabels: 5,
                    MinConfidence: 80
                };

                r.detectLabels(params, (err, data) => {
                    if(err) {
                        console.log(err);
                    }
                    else {
                        if(data.Labels.filter((label => {
                            return label.Name === 'Hot Dog';
                        })).length > 0) {
                            res.sendText('Hotdog');
                        }
                        else {
                            res.sendText('No Hotdog');
                        }
                    }
                });
            });
        });
    }
    else {
        res.sendText('Only Hotdogs!');
    }
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});