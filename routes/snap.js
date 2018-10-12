var express = require('express');
var router = express.Router({ strict: true });
var fs = require('fs');
var constants = require('../constants');
var path = require('path');
var cors = require('cors');
var spawn = require('child_process').spawn;

router.use(cors());

router.get('/:jid/:iid', function(req, res, next) {
    var jid = req.params.jid;
    var iid = req.params.iid;
    
    //
    // Check if file exists
    //
    var srcDir = path.join(constants.ASSETS, jid);
    if (!fs.existsSync(srcDir)) {
	return res.status(400).send('Specified jid is invalid (' + srcDir + ')');
    }
    var imagesDir = path.join(srcDir, 'images');
    if (!fs.existsSync(imagesDir)) {
	return res.status(400).send('Specified jid has no images (' + imagesDir + ')');
    }
    var imageBaseFn = iid + '.png';
    var imageFn = path.join(imagesDir, imageBaseFn);
    if (!fs.existsSync(imageFn)) {
	return res.status(400).send('Specified jid and iid has no associated image (' + imageFn + ')');
    }
    else {
	res.contentType(imageFn);
	res.sendFile(imageFn);
    }
});

module.exports = router;
