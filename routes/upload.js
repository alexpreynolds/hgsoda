var express = require('express');
var fileUpload = require('express-fileupload');
var router = express.Router({ strict: true });
var fs = require('fs');
var util = require('util');
var constants = require('../constants');
var uuidv4 = require('uuid/v4');
var spawn = require('child_process').spawn;
var path = require('path');

// default options
router.use(fileUpload({
    createParentPath: true,
    safeFileNames: true,
    preserveExtension: false,
    abortOnLimit: true,
    limits: { fileSize: 1024 * 1024 }
}));

router.get('/', function(req, res, next) {
    return res.status(400).send('No files were specified.');
});

router.post('/', function(req, res) {
    if (!req.files) {
	return res.status(400).send('No files were uploaded.');
    }
    
    // The name of the input field (i.e. "coordsFn") is used to retrieve the uploaded file
    let coordsFn = req.files.coordsFn;

    if (!coordsFn) {
	console.log('Coordinates unspecified or other error');
	console.log(coordsFn);
	res.redirect('/');
    }

    // Set up destination filename and folder, if necessary
    var jid = uuidv4();
    var destDir = path.join(constants.ASSETS, jid);
    if (!fs.existsSync(constants.ASSETS)) {
	fs.mkdirSync(constants.ASSETS);
    }
    if (!fs.existsSync(destDir)) {
	fs.mkdirSync(destDir);
    }

    // Use the mv() method to place the file on the server
    var destCoordsFn = path.join(destDir, 'coordinates.bed');
    var destCoordsFnPromise = coordsFn.mv(destCoordsFn)
	.then(function() {
	    return "[" + jid + "] copied coordinates";
	})
	.catch(function(err) {
	    if (err)
		return err;
	});

    // Write job params to JSON file
    var destConfigFn = path.join(destDir, 'config.json');
    var objConfig = {
	padding : parseInt(req.body.padding),
	viewWidth : parseInt(req.body.viewWidth),
	viewHeight : parseInt(req.body.viewHeight),
	hgServerURL : req.body.hgServerURL,
	hgViewconfId : req.body.hgViewconfId,
	hgViewUid : req.body.hgViewUid,
	hgAssembly : req.body.hgAssembly
    };
    var jsonConfigStr = JSON.stringify(objConfig);
    var fsWriteFilePromisified = util.promisify(fs.writeFile);
    var jsonConfigFnPromise = fsWriteFilePromisified(destConfigFn, jsonConfigStr)
	.then(function() {
	    return "[" + jid + "] copied parameters";
	})
	.catch(function(err) {
            if (err)
		return err;
	});

    // Write in-progress token to destDir
    var destInProgressTokenFn = path.join(destDir, 'inProgress');
    var inProgressTokenFnPromise = fsWriteFilePromisified(destInProgressTokenFn, '')
	.then(function() {
	    return "[" + jid + "] touched in-progress token";
	})
	.catch(function(err) {
            if (err)
		return err;
	});

    // Resolve all promises    
    Promise.all([destCoordsFnPromise,
		 jsonConfigFnPromise,
		 inProgressTokenFnPromise])
	.then(function(values) {
	    // Log actions
	    console.log(values);
	})
	.catch(function(errs) {
	    console.log('upload errors:', errs);
	    return res.status(500).send(errs);
	})
	.finally(function() {
	    // Redirect client 
	    res.status(301).redirect('http://' + (process.env.HOST || constants.HOST) + '/?jid=' + jid);

	    // Start the script that makes snapshots
	    /*
	    console.log("starting snap script...");
	    var snapshotJsScript = path.join(__dirname, '..', 'bin', 'snaps.js');
	    var snapshotScriptSpawn = spawn(snapshotJsScript,
					    ['srcDir=\"'+destDir+'\"'],
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
	    */
	});
});

module.exports = router;
