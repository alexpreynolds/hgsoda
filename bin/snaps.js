const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const sprintf = require('sprintf-js').sprintf;
const Promise = require('bluebird');

const args = process.argv
    .slice(2)
    .map(arg => arg.split('='))
    .reduce((args, [value, key]) => {
        args[value] = key;
        return args;
    }, {});

//
// Read in configuration parameters
//
try {
    configFn = path.join(args.srcDir, 'config.json')
    config = JSON.parse(fs.readFileSync(configFn, 'utf-8'));
}
catch(err) {
    if (err.code === 'ENOENT') {
	console.log('Error: Configuration file not found!');
    } else {
	throw err;
    }
}

//
// Read in coordinates
//
try {
    coordsFn = path.join(args.srcDir, 'coordinates.bed')
    coordsStr = fs.readFileSync(coordsFn, 'utf-8');
}
catch(err) {
    if (err.code === 'ENOENT') {
	console.log('Error: Coordinates file not found!');
    } else {
	throw err;
    }
}

//
// Read in padding if overriding (e.g., for manually debugging SNPs)
//
try {
    config.padding = args.padding || config.padding;
}
catch(err) {
    console.log('Error: Could not override padding!');
    throw err;
}

//
// Make an array of coordinate objects to loop through
// if non-zero padding is specified, calculate the midpoint
// and pad around midpoint
//
const coords = [];
coordsStr.split(/\n/).forEach((intervalStr) => {
    const interval = intervalStr.split(/\t/);
    if (interval[0].length > 0) {
	if (config.padding <= 0) {
	    coords.push({
		chr: interval[0],
		start: parseInt(interval[1]),
		stop: parseInt(interval[2]),
		id: interval[3] || ''
	    });
	}
	else {
	    const midpoint = parseInt(interval[1]) + parseInt((parseInt(interval[2]) - parseInt(interval[1]))/2);
	    coords.push({
		chr: interval[0],
		start: parseInt(midpoint) - parseInt(config.padding),
		stop: parseInt(midpoint) + parseInt(config.padding),
		id: interval[3] || ''
	    });
	}
    }
});

//
// Snapshot helper functions
// cf. https://gist.github.com/alexpreynolds/efb585132262dd3968168ef35f964231
//
async function stall(stallTime = 3000) {
    await new Promise(resolve => setTimeout(resolve, stallTime));
};

async function takeSnapshot(destDir, prefix, chr, start, stop) {
    const width = config.viewWidth || 1024;
    const height = config.viewHeight || 1280;

    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            `--window-size=${ width },${ height }`
        ],
        timeout: 20000
    });
    var page = await browser.newPage();
    await page.setViewport({
        width: config.viewWidth || 1024,
        height: config.viewHeight || 1280,
        deviceScaleFactor: 1
    });
    await page.emulateMedia('screen');

    const url = config.hgServerURL
	  + "/?config=" + config.hgViewconfId
	  + "&chr=" + chr
	  + "&start=" + start
	  + "&stop=" + stop
	  + "&viewUid=" + config.hgViewUid
	  + "&assembly=" + config.hgAssembly;

    console.log(url);

    await stall(2000);    
    await page.goto(url, {
        waitUntil: ['networkidle0', 'domcontentloaded', 'load', 'networkidle2']
    });
    await stall(20000);

    /*
    await page.pdf({
        path: 'localPuppeteerTest.pdf',
        width: '1024px',
        height: '1280px',
        pageRanges: '1-1'
    });
    */

    const destPNGFn = path.join(destDir, [prefix, chr, start, stop].join('_') + '.png');
    
    await page.screenshot({
	path: destPNGFn,
	fullPage: true
    });
    await stall(2000);
    
    await browser.close();
};

//
// Set up destination images folder
//
const destDir = path.join(args.srcDir, 'images');
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir);
}

//
// Set up cleanup
//
function cleanup() {
    inProgressSentinelFn = path.join(args.srcDir, 'inProgress');
    fs.unlink(inProgressSentinelFn, function(err) {
	if (err)
	    throw err;
	console.log('Debug: inProgress sentinel deleted');
    });    
}

//
// We will snap snaps in batches to give the headless browser time to render things
//
const chunk = (array, batchSize = 2) => {
    const chunked = [];
    for(let i = 0; i < array.length; i += batchSize) {
	chunked.push(array.slice(i, i + batchSize))
    }   
    return chunked;
}
var idx = 0;
const snapCoord = function(coord) {
    return new Promise(resolve => {
	idx++;
	console.log(idx);
	const prefix = sprintf("%08d", idx);
	takeSnapshot(destDir, prefix, coord.chr, coord.start, coord.stop)
	setTimeout(resolve, 10000);
    });
};
const chunkedData = chunk(coords);
const reducer = (chain, batch) => chain
      .then(() => Promise.all(
	  batch.map(d => snapCoord(d))
      ));
const promiseChain = chunkedData.reduce(
    reducer,
    Promise.resolve()
);
promiseChain.then(() => cleanup());
