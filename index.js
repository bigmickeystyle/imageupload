const express = require('express');
const multer = require('multer');
const parser = require('body-parser');
const http = require('http');
const https = require('https');
const fs = require('fs');
const url = require('url');

var app = express();

var diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + '_' + Math.floor(Math.random() * 99999999) + '_' + file.originalname);
    }
});

var uploader = multer({
    storage: diskStorage,
    limits: {
        filesize: 2097152
    }
});

app.use(parser.json());

app.use(parser.urlencoded({
    extended: false
}));

app.use(function logUrl(req, res, next) {
    console.log('requesting: ' + req.method + req.url);
    next();
});

app.get('/', ( req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/upload', uploader.single('file'), function(req, res) {
    if (req.file) {
        res.json({
            success: true,
            file: '/uploads/' + req.file.filename
        });
    } else {
        res.json({
            success: false
        });
    }
});

app.post('/uploadurl', function(req, resp) {
    var parsedUrl = url.parse(req.body.url);
    var pathArray = parsedUrl.path.split('/');
    var fileName = pathArray[pathArray.length - 1];
    var file = './uploads/' +  Date.now() + '_' + Math.floor(Math.random() * 99999999) + '_' + fileName;
    if (parsedUrl.protocol == 'http:'){
        var options = {
            hostname: parsedUrl.host,
            path: parsedUrl.path
        };
        var request = http.request(options, (res) => {

            res.pipe(fs.createWriteStream(file));
            res.on('end', () => {
                resp.json({
                    success: true,
                    file: file
                });
            });
        });
        request.end();
    }
});


app.use(express.static(__dirname));

app.listen(8080, function(){
    console.log("hi i'm listening!");
});
