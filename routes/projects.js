let Utils = require('../utils');
let utils = new Utils();
let config = require('../config');

let qs = require('querystring');
let request = require('request');
let exec = require('child_process').exec;
let fs = require('fs');

//More friendly output
let figlet = require('figlet');

let ParseServer = require('parse-server').ParseServer;

module.exports = function(app){

  app.post('/project', async (req, res) => {
    const projectName = req.body.projectName;
    const projectType = req.body.projectType;
    const port = req.body.port;
    const token = req.body.token;
     try {
       const user = await utils.loggedUser(token);
       var hookTemplate = `#!/bin/sh\nbranch=\\$(git rev-parse --symbolic --abbrev-ref \\$1)\nexec curl localhost:${config.PORT}/reload/${projectName}/\\$branch\n`;
       var command = `mkdir /${projectName}.git && cd /${projectName}.git && git init --bare && cd hooks/ && printf "${hookTemplate}" >> post-update && chmod 755 post-update`;
       exec(command, function (err, stdout, stderr) {
         command = `cd ~ && curl ${config.CLUSTER_URL}/create-project-script/${projectName}/4000/${projectType} -o create-project && chmod +x create-project && ./create-project`;// && rm create-app`;
         exec(command, function (err, stdout, stderr) {
           command = `cd ~ && curl ${config.CLUSTER_URL}/reload-project-script/${projectName}/${projectType} -o reload-project && chmod +x reload-project`;// && rm create-app`;
           exec(command, function (err, stdout, stderr) {
             res.statusCode = 201;
             let json = JSON.stringify({ result: true, message: "Heyy!!!" });
             res.end(json);
           });
         });
       });
     } catch (e) {
       //Invalid token
       res.statusCode = 403;
       let json = JSON.stringify({ error: "Invalid token" });
       res.end(json);
       return;
     }
  });

  app.get('/reload/:app_name/:branch', function (req, res) {

    console.log('* * * * * * * * * * * * * * * * * * *');
    console.log('Deploying project');
    console.log('Project name: ' + req.params.app_name);
    console.log('Branch: ' + req.params.branch);
    console.log('* * * * * * * * * * * * * * * * * * *');

    var branch = req.params.branch;
    if (branch == 'master') {
      var command = 'cd ~/' + req.params.app_name + ' && git pull coded master && ~/./reload-project';
      exec(command, function (err, stdout, stderr) {
        figlet('CODED', {
                 font: 'Small Slant',
                 horizontalLayout: 'full',
                 verticalLayout: 'default'
         }, function (err, data) {
           res.statusCode = 201;
           res.end(`${data}\n\nYour project was updated`);
         });
      });
    }else{
      res.statusCode = 403;
      res.end(`You should push to your master branch.`);
    }
  });
}
