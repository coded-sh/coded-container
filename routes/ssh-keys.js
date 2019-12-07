const Utils = require('../utils');
const utils = new Utils();
const config = require('../config');

var qs = require('querystring');
const request = require('request');
const exec = require('child_process').exec;

module.exports = function(app){

  app.post('/ssh-keys', async (req, res) => {
      const sshKeys = req.body.sshKeys;
      const token = req.body.token;
      console.log("reload keys: " + sshKeys);
     try {
       var sshKeysStr = "";
       for (var i = 0; i < sshKeys.length; i++){
          sshKeysStr += `${sshKeys[i]}\n`;
       }
       var command = `printf "${sshKeysStr}" >> ~/.ssh/authorized_keys`;
       exec(command, function (err, stdout, stderr) {
         res.statusCode = 201;
         let json = JSON.stringify({ result: true, message: "Heyy!!!" });
         res.end(json);
       });
     } catch (e) {
       //Invalid token
       res.statusCode = 403;
       let json = JSON.stringify({ error: "Invalid token" });
       res.end(json);
       return;
     }
  });

}
