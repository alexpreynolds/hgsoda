module.exports = {
  apps : [
      {
        name: "hgsoda-client",
        script: "npm run start",
        watch: true,
        env: {
            "PORT": 80,
	    "HOST": "ec2-18-188-250-191.us-east-2.compute.amazonaws.com",
            "NODE_ENV": "development"
        },
        env_production: {
            "PORT": 80,
	    "HOST": "ec2-18-188-250-191.us-east-2.compute.amazonaws.com",	    
            "NODE_ENV": "production",
        }
      }
  ]
}
