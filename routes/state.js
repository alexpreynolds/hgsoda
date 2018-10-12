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
	console.log("starting snap script...");
	var snapshotJsScript = path.join(__dirname, '..', 'bin', 'snaps.js');
	var snapshotScriptSpawn = spawn(snapshotJsScript,
					['srcDir=\"'+srcDir+'\"'],
					{
					    stdio : 'ignore',
					    detached : true,
					    shell : true,
					    env : process.env
					}
				       );
	// Ensure that the spawned script is detached
	// cf. https://stackoverflow.com/questions/12871740/how-to-detach-a-spawned-child-process-in-a-node-js-script
	snapshotScriptSpawn.unref();
	console.log("snap script started and detached...");
	return res.json({ 'pending' : true });
    }
    else {
	var srcInProgressTokenFn = path.join(srcDir, 'inProgress');
	var srcInProgressTokenExists = fs.existsSync(srcInProgressTokenFn);
	return res.json({ 'pending' : srcInProgressTokenExists });
    }
});

module.exports = router;
