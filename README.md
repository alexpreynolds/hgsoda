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
$ export AWS_HOST="http://hgsoda.altius.org"
$ PORT=3000 HOST=${AWS_HOST} npm run dev
```

### Frontend

```
$ cd git/hgsoda/client
$ npm install
$ export AWS_HOST="http://hgsoda.altius.org"
$ sudo PORT=80 HOST=${AWS_HOST} npm run start
```

### PM2 deployment (production)

#### Installation

```
$ sudo npm install pm2 -g
$ sudo pm2 startup systemd
$ sudo npm i -g serve
$ sudo ln -s /home/ubuntu/node-v10.12.0-linux-x64/bin/serve /usr/bin/serve
```

#### Backend

We disable `watch` as the contents of this folder can change during snapshot processing. If `watch` is enabled, the node process will restart and potentially interrupt the creation of a gallery, which is bad.

```
$ cd git/hgsoda
$ cat > hgsoda-server.json
{
    apps : [
        {
            name: "hgsoda-server",
            script: "npm run build",
            interpreter: "node",
            watch: false,
	    cwd: "/home/ubuntu/git/hgsoda",
            env: {
                "DEBUG": "hgsoda:*",
                "PORT": 3000,
                "NODE_ENV": "production",
                "HOST": "hgsoda.altius.org"
            }
        }
    ]
}
$ sudo pm2 start hgsoda-server.json
```

#### Frontend

For the frontend, we serve a static build of the React application. We should be able to safely enable `watch` here, as we do not expect the contents of this folder to change. However, if we do change this folder's contents, this can affect the backend process and so we disable this parameter.

```
$ cd git/hgsoda/client
$ npm run build
$ cat > hgsoda-client.json
{
    apps : [
	{
	    name: "hgsoda-client",
	    script: "npx",
	    interpreter: "none",
	    watch: false,
	    cwd: "/home/ubuntu/git/hgsoda/client",
	    args: "serve -l 80 -s build"
	}
    ]
}
$ sudo pm2 start hgsoda-client.json
```

#### Other

Once `pm2` is set up, use:

```
$ sudo pm2 save
```

to persist the process configuration between reboots of the host server.