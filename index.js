const express = require('express');
const multer = require('multer');
const parser = require('body-parser');
const http = require('http');
const https = require('https');
const fs = require('fs');
const url = require('url');

const maxLen = 5000000;

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
    var options = {
        hostname: parsedUrl.host,
        path: parsedUrl.path
    };
    if (parsedUrl.protocol == 'http:'){
        var request = http.request(options, callback);
        request.end();
    }
    else if (parsedUrl.protocol == 'https:'){
        var requestS = https.request(options, callback);
        requestS.end();
    }
    function callback(res){
        console.log(res.headers['content-type']);
        if (res.headers['content-type'].split('/')[0] == 'image' && res.headers['content-length'] < maxLen) {
            res.pipe(fs.createWriteStream(file));
            var size;
            res.on('data', (data) => {
                size += data.length;
                if (size > maxLen){
                    console.log("invalid file, maximum file size permitted is " + maxLen);
                }
            });
            res.on('end', () => {
                resp.json({
                    success: true,
                    file: file
                });
            });
        }
        else {
            console.log("invalid file");
            console.log("length " + res.headers['content-length']);
        }
    }
});


app.use(express.static(__dirname));

app.listen(8080, function(){
    console.log("hi i'm listening!");
});
