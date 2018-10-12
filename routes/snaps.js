var express = require('express');
var router = express.Router({ strict: true });
var fs = require('fs');
var constants = require('../constants');
var path = require('path');
var cors = require('cors');
var spawn = require('child_process').spawn;

router.use(cors());

router.get('/:jid', function(req, res, next) {
    var jid = req.params.jid;

    //
    // Check if file exists
    //
    var srcDir = path.join(constants.ASSETS, jid);
    if (!fs.existsSync(srcDir)) {
	return res.status(400).send('Specified jid is invalid (' + srcDir + ')');
    }
    var imagesDir = path.join(srcDir, 'images');
    if (!fs.existsSync(imagesDir)) {
	return res.status(400).send('Specified jid has no images directory (' + imagesDir + ')');
    }
    else {
	//
	// Read in configuration parameters
	//
	try {
	    snapsFn = path.join(srcDir, 'snaps.json')
	    snaps = JSON.parse(fs.readFileSync(snapsFn, 'utf-8'));
	    snaps.jid = jid;
	    return res.json(snaps);
	}
	catch(err) {
	    if (err.code === 'ENOENT') {
		console.log('Error: Snaps file not found!');
		return res.status(400).send('Specified jid has no snaps JSON (' + snapsFn + ')');
	    } else {
		throw err;
	    }
	}
    }
});

module.exports = router;
