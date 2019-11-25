"use strict";
const Q = require('q');
const fs = require('fs');
const xml2js = require('xml2js');

const buildID = function(currentBacklog,currentTask){
    // return "BCPNID"+currentBacklog["key"]+'-'+currentTask["id"];
    return "BCPNID-"+currentTask["id"];
};
const parseXml = function(xml){
    let deferred = Q.defer();
    let parser = new xml2js.Parser({explicitArray: true}, {normalize: true});
    parser.parseString(xml, function (e, result) {
        if(e){
            deferred.reject("Error parsing XML("+e+")");
        } else {
            deferred.resolve(result.backlogs.backlog);
        }
    });
    return deferred.promise;
};
const translate = function(type,incident,currentTask){
    switch (type) {
        case 'priority':
           if(currentTask.hasOwnProperty("priority")){
                switch (currentTask["priority"]) {// options from Spreadsheet: "Very High|High|Medium|Low"
                    case "very high":
                        return {"id":"1"};
                    case "high":
                        return {"id":"2"};
                    case "medium":
                        return {"id":"3"};
                    case "low":
                        return {"id":"4"};
                    default:
                        return {"id":"3"};
                }
            } else {
                return {"id":"3"};
            }
        case 'labels':
            let arrLabels = [];
            arrLabels.push(buildID(incident,currentTask));
            return arrLabels;
        default:
            return {};
    }
};
const formatSpreadsheetProcessor = function(SpreadsheetIncident){
    let name = SpreadsheetIncident.PROCESSOR_NAME.replace(/Mr\.|Ms\./,"");
    name = name.trim().split(" ");
    name.reverse();
    return "Spreadsheet_Processor: "+name.join(", ")+" ("+SpreadsheetIncident.PROCESSOR_ID.toLowerCase()+")";
};

module.exports = {
    getSubsettings: function(){
        return {
            xmlpath: "./spreadsheet.xml",
        };
    },
    search: function(settings){
        let deferred = Q.defer();
        try {
            fs.readFile(settings.subsettings.xmlpath, "utf8", function(err, data) {
                if(err){
                    deferred.reject("Spreadsheet request failed with parseXml error.");
                } else {
                    parseXml(data)
                    .then(function(obj){
                        deferred.resolve(obj);
                    })
                    .fail(function(e) {
                        deferred.reject("Spreadsheet request failed with parseXml error.");
                    });
                }
            });
        } catch (e) {
            deferred.reject("Spreadsheet request failed with error: " + e);
        }
        return deferred.promise;
    },
    parseToKanban: function(arrSpreadsheetIncidents){
        let arrParsed = {};
        for (let i in arrSpreadsheetIncidents) {
            let currentBacklog = arrSpreadsheetIncidents[i]["$"];
            currentBacklog["tasks"] = arrSpreadsheetIncidents[i]["tasks"];
            for(let t in currentBacklog["tasks"][0]["task"]){
                let currentTask = currentBacklog["tasks"][0]["task"][t]["$"];
                arrParsed[buildID(currentBacklog,currentTask)] = {
                    "fields": {
                        "summary": currentTask.summary,
                        "description": currentTask.description,
                        "priority": translate("priority",currentBacklog,currentTask),
                        "labels": translate("labels",currentBacklog,currentTask),
                        "assignee": {"name": currentTask.owner},
                        "timetracking": {
                            "originalEstimate": currentTask.estimation,
                            "remainingEstimate": currentTask.estimation
                        },
                        "parent": {"key": currentBacklog["key"]},
                        "issuetype": {'name': "Task"},
                        "fixVersions": [{"name":currentBacklog["fixversion"]}]
                    }
                };
            }
        }
        return arrParsed;
    }
};
