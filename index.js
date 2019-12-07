//Load config file
const config = require('./config');
const package = require('./package.json');

//Polka - A micro web server so fast, it'll make you dance!👯
const polka = require('polka');
const app = polka();

//Initialize Parse SDK
const Parse = require('parse/node');

Parse.initialize(config.PARSE_SERVER_APP_ID);
Parse.serverURL = config.PARSE_SERVER_URL;

const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

app.use(bodyParser.json({}));

//Include Project routes
require('./routes/projects')(app);

//Include SSH keys routes
require('./routes/ssh-keys')(app);

//Check if Coded Node is available
app.get('/hey', function (req, res) {
  res.statusCode = 200;
  let json = JSON.stringify({ result: true, message: "Nice! I'm working!!!" });
  res.end(json);
});

//Start Coded Cluster
app.listen(config.PORT, err => {
    if (err) throw err;
    console.log(`> Running on localhost:${config.PORT}`);
    console.log(`> Version: ${package.version}`);
});
