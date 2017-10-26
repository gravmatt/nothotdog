'use strict';

module.exports = {
    serverPath: process.env.NOTHOTDOG_PATH || '/webhook',
    facebook: {
        verifyToken: process.env.FACEBOOK_VERIFY_TOKEN || '<verify-token>', // add some random string
        pageToken: process.env.FACEBOOK_PAGE_TOKEN || '<page-token>'
    },
    aws: {
        region: 'eu-west-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '<your-access-key-id>',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '<your-secret-access-key>'
    }
};
