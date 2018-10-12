# hgsoda
HiGlass soda plot gallery tool

## Setup

Installation and testing is being done on an Ubuntu 16 host.

Some libraries are required for Puppeteer functionality:

```
$ sudo apt-get install libxss1 libnss3-dev -y
```

The `hgsoda` tool is made up of a React frontend that mediates user interaction, and an Express backend that handles turning BED files into browser snapshots.

Both the frontend and backend need to run on separate ports. Here's an example of how to start the development servers for each:

### Backend

```
$ cd git/hgsoda
$ mkdir -p assets
$ npm install
$ export AWS_HOST="http://ec2-18-188-250-191.us-east-2.compute.amazonaws.com"
$ PORT=3000 HOST=${AWS_HOST} npm run dev
```

### Frontend

```
$ cd git/hgsoda/client
$ npm install
$ export AWS_HOST="http://ec2-18-188-250-191.us-east-2.compute.amazonaws.com"
$ sudo PORT=80 HOST=${AWS_HOST} npm run start
```
