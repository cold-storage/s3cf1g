# s3cf1g

s3cf1g does one simple job. It checks for the existence of a file, and if it's
there, we do nothing.

If it's not there we spin up a web page that asks you to supply a password and
URL. We then HTTP GET the file, decrypt it, and save it to disk.

The use case envisioned here is to throw s3cf1g in front of any app that has
secrets in its config file (and has HTTP access) and s3cf1g will pull down and
decrypt the config file before your app does its normal startup routine.

```
npm install s3cf1g
```

Below is an example of using s3cf1g.

`url` is optional. If not specified it can be supplied on the web form.

```
const s3cf1g = require('s3cf1g');

const opts = {
  file: '~/some/file.js',
  url: 'https://some/url/file.js'
};

s3cf1g(opts, function(err) {
  if (err) {
    handleErr(err);
  } else {
    // The config file is now safely saved to disk. Now . . .
    doWhateverYouWereGoingToDo();
  }
});
```

`process.env.PORT`

The web page we spin up will listen on `process.env.PORT || 3000`.

`export S3CF1G_FORCE=true`

If you want to force getting the file (maybe because you know it has been
changed on the remote site) just set the `S3CF1G_FORCE` environment variable to
any truthy value.

`ez-aes-256-cbc`

We use https://github.com/johndstein/ez-aes-256-cbc to decrypt the file, so
of course it would have to have been encrypted with `ez-aes-256-cbc` or
other code that uses the same method.