var path = require('path');

var assetsDir = path.join(__dirname, 'assets');

module.exports = Object.freeze({
    HOST: 'ec2-18-188-250-191.us-east-2.compute.amazonaws.com',
    ASSETS: assetsDir
});
