"use strict";
const Q = require('q');
const loader = require("./loader");
var fs = require('fs');
const extend = require('node.extend');
var decache = require('decache');
var express = require('express');
var app = express();

const bcp = loader.loadPort("bcp");
const jira = loader.loadPort("jira");
bcp.setConfig(loader.loadPortConfig("bcp"));
jira.setConfig(loader.loadPortConfig("jira"));

var arrIncidents;
var arrJira;
var bcpCalled;
var jiraCalled;

const testSearchResult = function () {
    let deferred = Q.defer();
    if (bcpCalled && jiraCalled) {
        let status = "";
        (Object.keys(arrIncidents).length > 0) ? status = "<p>BCP search OK</p>" : status = "<p>BCP search error</p>";
        (Object.keys(arrJira).length > 0) ? status += "<p>Jira search OK</p>" : status += "<p>Jira search error</p>";

        deferred.resolve(status);
    }
    return deferred.promise;
};

// app.use('/', express.static(__dirname + '/app'));
app.get('/kanban-status', function (req, res) {
    arrIncidents = undefined;
    arrJira = undefined;
    bcpCalled = false;
    jiraCalled = false;

    bcp.search().then(function (results) {
        bcpCalled = true;
        arrIncidents = results;
        testSearchResult().then(function (testResult) {
            res.send(testResult);
        });
    }).catch(function (e) {
        res.send("Error on BCP logon: " + e);
    });

    jira.search().then(function (results) {
        jiraCalled = true;
        arrJira = results;
        testSearchResult().then(function (testResult) {
            res.send(testResult);
        });
    }).catch(function (e) {
        res.send("Error on Jira logon: " + e);
    });
});

app.get('/set-bcp-pass', function (req, res) {
    var filePath = loader.buildPath("hub-ports/bcp/master-config.json");
    var bcpConfig = {};

    // Check if the parameters are valid
    if (!req.query.user || !req.query.pass) {
        res.send("Missing parameter.");
        return;
    } else if (req.query.user == "SeuUsuário" || req.query.pass == "SuaSenha") {
        res.send("User or Password invalid. Please try again with different parameters.");
        return;
    }

    // Before change the current password, check if it is still valid
    bcp.search().then(function (results) {
        // Logon to BCP was successful, alert the user that the password will not be changed 
        res.send("The current BCP password is still valid. Therefore, it will not be changed. If you are facing issues with card update, it is probably not related with BCP credencials. Please, contact the service Admin.");

    }).catch(function (e) {
        //BCP logon failed, continue the password change process
        var newConfig = {
            "user": req.query.user,
            "hashPass": req.query.pass
        };

        if (fs.existsSync(filePath)) {
            bcpConfig = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }

        var finalConfig = extend(bcpConfig, newConfig);

        fs.writeFileSync(filePath, JSON.stringify(finalConfig));

        decache(filePath);
        bcp.setConfig(loader.loadPortConfig("bcp"));

        res.send("BCP password updated!");
    });
});

app.listen(3000, function () {
    console.log('Listening on port 3000!');
});