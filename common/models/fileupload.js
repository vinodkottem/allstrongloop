'use strict';


var multer = require('multer');
var fs = require('fs');

module.exports = function (Fileupload) {
    var uploadedFileName = '';
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            var dirPath = 'client/tmp/'
            if (!fs.existsSync(dirPath)) {
                var dir = fs.mkdirSync(dirPath);
            }
            cb(null, dirPath + '/');
        },
        filename: function (req, file, cb) {
            console.log(file.originalname);
            cb(null, file.originalname);
        }
    });
    Fileupload.upload = function (req, res, cb) {
        var upload = multer({
            storage: storage
        }).single('file');
        upload(req, res, function (err) {
            if (err) {
                res.json(err);
            }
            res.json(uploadedFileName);
        });
    };

    Fileupload.remoteMethod('upload', {
        accepts: [{
            arg: 'req',
            type: 'object',
            http: {
                source: 'req'
            }
        }, {
            arg: 'res',
            type: 'object',
            http: {
                source: 'res'
            }
        }],
        returns: {
            arg: 'result',
            type: 'string'
        }
    });
};
