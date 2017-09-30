#!/usr/bin/env node

'use strict';

// http-shutdown just allows us to force shutdown of the http server.
require('http-shutdown').extend();
const mp = require('multiparty');
const axios = require('axios');
const fs = require('fs');
const {
  decrypt
} = require('ez-aes-256-cbc');
let server = null;
exports = module.exports = function(opts, cb) {
  if (process.env.S3CF1G_FORCE || !fs.existsSync(opts.file)) {
    getTheFile(opts, cb);
  } else {
    process.nextTick(cb);
  }
};
function doForm(res, url) {
  url = url ? url : '';
  let form = `
<!DOCTYPE html>
<style>
input, button {
  font-size: 1.2em
}
</style>
<form
  action="/"
  method="post"
  enctype="multipart/form-data">
  Password: <br>
  <input
    type="password"
    name="password"
    size='40'><br>
  URL: <br>
  <input
    type="url"
    name="url"
    size="100"
    value="${url}"><br><br>
  <button
    type="submit"
    value="whatever">Submit</button>
</form>
    `;
  res.setHeader('content-type', 'text/html');
  res.end(form);
}
function handleReq(opts, cb, req, res) {
  if (req.method === 'POST') {
    (new mp.Form()).parse(req, function(err, fields) {
      // fields looks like this
      // { password: [ 'adfasdf' ], url: [ 'https://foo.zoo' ] }
      if (err) {
        console.error(err);
        doForm(res, opts.url);
      } else {
        axios.get(fields.url[0])
          .then(function(response) {
            try {
              fs.writeFileSync(
                opts.file,
                decrypt(response.data,
                  fields.password[0]));
              server.forceShutdown(function() {
                cb();
              });
            } catch (err) {
              console.error(err);
              doForm(res, opts.url);
            }
          })
          .catch(function(err) {
            console.log(err);
            doForm(res, opts.url);
          });
      }
    });
  } else {
    doForm(res, opts.url);
  }
}
function getTheFile(opts, cb) {
  server = require('http')
    .createServer(handleReq.bind(null, opts, cb))
    .withShutdown()
    .listen(process.env.PORT || 3000);
}
if (require.main === module) {
  exports({
    file: 'junk.txt',
    url: 'http://canfig.s3-website-us-east-1.amazonaws.com/s3cf1g/junk.txt'
  }, function(err) {
    console.log('ok we are moving on', err);
  });
}