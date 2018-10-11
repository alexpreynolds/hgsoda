var express = require('express');
var router = express.Router();
var constants = require('../constants');

router.get('/', function(req, res, next) {
    let jid = req.query.jid;
    if (!jid) {
	res.status(301).redirect('http://' + (process.env.HOST || constants.HOST));
    }
    else {
	res.status(301).redirect('http://' + (process.env.HOST || constants.HOST) + '/?jid=' + jid);
    }
});

module.exports = router;
