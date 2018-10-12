module.exports = {
  apps : [
      {
        name: "hgsoda-express",
        script: "npm run dev",
        watch: true,
        env: {
            "PORT": 3000,
	    "HOST": "ec2-18-188-250-191.us-east-2.compute.amazonaws.com",
            "NODE_ENV": "development"
        },
        env_production: {
            "PORT": 3000,
	    "HOST": "ec2-18-188-250-191.us-east-2.compute.amazonaws.com",	    
            "NODE_ENV": "production",
        }
      }
  ]
}
