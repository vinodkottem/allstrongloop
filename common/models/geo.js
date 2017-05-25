'use strict';
var request = require('request');
var app = require('../../server/server');
var cloudanturl = app.dataSources.cloudantuk.settings.url;
var db = "geos";
module.exports = function (Geo) {

    function doPost(url, body, cb) {
        request.post({
                url,
                json: true,
                body: body
            },
            function (error, response, body) {
                cb(error, response);
            }
        );
    }

    /**
     *       doGet : to fetch boundary/ward co-oridnates from the db using wards index 
     */
    function doGet(url, cb) {
        request.get(cloudanturl+ '/' +db + "/_design/GeoDesign/_geo/wards?bbox=-180%2C-90%2C180%2C90&limit=20&relation=contains",
            function (error, resp, body) {
                cb(error, body);
            });
    }

    /**
     *       doGetLoc : to fetch user co-oridnates from the db using uselocation index 
     */
    function doGetLoc(url, body, cb) {
        // body will be geojson format
        var coord = body.geometry.coordinates[0];
        var query = coord.join('%2C').replace(/\,/g, '+');
        var uerl = cloudanturl + '/' +db + '/_design/GeoDesign/_geo/userlocation?g=polygon((' + query + '))&limit=200&relation=contains';
        request.get(uerl, function (error, resp, data) {
            cb(error, JSON.parse(data).rows || []);
        });
    }


    Geo.location = function (id, cb) {
        Geo.findOne({where:{id:id}})
        .then(function(result) {
            doGetLoc(null,result,function(err,geoinfo){
                cb(err,geoinfo);
            });
        })
        .catch(function(error){
            console.log(error);
            cb(error,null);
        })
    };

    Geo.remoteMethod('location',{
				http: {path: '/location/:id', verb: 'get'},
				accepts: [{arg: 'id', type: 'string',required: true}],
				          returns: {root: true, type: 'object'}
			});
};
