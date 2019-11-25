"use strict";
const Q = require('q');
const https = require('https');
const fs = require('fs');
const xml2js = require('xml2js');
let mySettings = undefined;

const buildID = function(incident){
    return 'BCPNID'+incident.MESSAGE_NO+'_'+incident.MESSAGE_YEAR;
};
const parseXml = function(xml){
    let deferred = Q.defer();
    let parser = new xml2js.Parser({explicitArray: false}, {normalize: true});
    parser.parseString(xml, function (e, result) {
        if(e){
            deferred.reject("Error parsing XML("+e+")");
        } else {
            let response = result['asx:abap']['asx:values']['RESULTNODE1'];
            // response is a String when no message was found on BCP
            if (typeof response === 'string' || response instanceof String) {
                deferred.resolve([]);
            } else {
                // here response is either an array of messages or a single message object
                response = response['_-SID_-CN_IF_DEVDB_INC_OUT_S'];
                if (Array.isArray(response)) {
                    deferred.resolve(response)
                } else {
                    // when it's a single object, an array is created
                    var array = [];
                    array.push(response);
                    deferred.resolve(array); 
                }
            }
        }
    });
    return deferred.promise;
};
const translate = function(type,incident){
    switch (type) {
        case 'priority':
            switch (incident['PRIORITY_DESCR'].toLowerCase()) {// options from BCP: "Very High|High|Medium|Low"
                case "very high":
                    return {"id":"1"};
                case "high":
                    return {"id":"2"};
                case "medium":
                    return {"id":"3"};
                case "low":
                    return {"id":"4"};
                default:
                    return {"id":"4"};
            }
        case 'labels':
            let arrLabels = [];

            //only considers MPT if in process
            if ((incident.STATUS_DESCR == "New") ||
                (incident.STATUS_DESCR == "In Process")) {

                let d10 = new Date(),d5 = new Date(),d0 = new Date();
                d10.setDate(d10.getDate() + 10);
                d5.setDate(d5.getDate() + 5);
                let expirationLimit10 = d10.toISOString().replace(/\.(.*)/,'').replace(/[\-|\:|\T]/g,'');//lead zeros
                let expirationLimit5 = d5.toISOString().replace(/\.(.*)/,'').replace(/[\-|\:|\T]/g,'');//lead zeros
                let expirationLimit0 = d0.toISOString().replace(/\.(.*)/,'').replace(/[\-|\:|\T]/g,'');//lead zeros

                if (incident.MPT_EXCEEDED != '') {
                    arrLabels.push('MPT_0');
                } else if (incident.MPT_EXPIRY <= expirationLimit0) { // MPT_EXPIRY = 20170704201402
                    arrLabels.push('MPT_0');
                } else if (incident.MPT_EXPIRY <= expirationLimit5) { // MPT_EXPIRY = 20170704201402
                    arrLabels.push('MPT_5');
                } else if (incident.MPT_EXPIRY <= expirationLimit10) { // MPT_EXPIRY = 20170704201402
                    arrLabels.push('MPT_10');
                } else {
                    arrLabels.push('MPT_100');
                }
            } else {
                arrLabels.push('MPT_100');
            }

            //only considers EXPIREDATE if in process
            if ((incident.STATUS_DESCR == "New") ||
                (incident.STATUS_DESCR == "In Process")) {
                arrLabels.push('EXPIREDATE_'+incident.MPT_EXPIRY.substr(0,8));
            }

            arrLabels.push(buildID(incident));
            return arrLabels;
        case "bcpFields":
                let arrFields = {};
                if(mySettings.bcpFields != undefined)
                    for(let field in mySettings.bcpFields){
                        if(incident.hasOwnProperty(mySettings.bcpFields[field])){
                            arrFields[mySettings.bcpFields[field]] = incident[mySettings.bcpFields[field]];
                        }
                    }
                return arrFields;
            break;
        default:
            return {};
    }
};
const formatBCPProcessor = function(bcpIncident){
    let name = bcpIncident.PROCESSOR_NAME.replace(/Mr\.|Ms\./,"");
    name = name.trim().split(" ");
    name.reverse();
    return "BCP_Processor: "+name.join(", ")+" ("+bcpIncident.PROCESSOR_ID.toLowerCase()+")";
};
const parseToKanban= function(arrBcpIncidents){
    let arrParsed = {};
    for (let i in arrBcpIncidents) {
        let bcpIncident = arrBcpIncidents[i];
        let description = bcpIncident.URL_MESSAGE+"\n"+formatBCPProcessor(bcpIncident)+"\nCust.: "+bcpIncident.CUST_NAME+"\nCust. No.:"+bcpIncident.CUST_NO; 
        arrParsed[buildID(bcpIncident)] = {
            'fields': {
                'summary': (bcpIncident.MESSAGE_NO + " " + bcpIncident.MESSAGE_YEAR + ": " + bcpIncident.DESCRIPTION).replace(new RegExp("^[0]+|[0]+$", "g"), ""),
                'description': description,
                "priority": translate('priority',bcpIncident),
                'environment': buildID(bcpIncident),
                "labels": translate('labels',bcpIncident),
                "assignee": {'name': null},
            },
            'bcpstatus': bcpIncident.STATUS_DESCR, //only used to compare status. This is removed after comparison
            'bcpFields': translate('bcpFields',bcpIncident)
        };
    }
    return arrParsed;
};
module.exports = {
    setConfig: function(settings){
        mySettings = settings;
    },
    search: function(){
        let deferred = Q.defer();
        try {
            let options = {
                hostname: mySettings.host,
                port: mySettings.port,
                path: (mySettings.searchPath + mySettings.savedSearchId),
                method: mySettings.method,
                ca: fs.readFileSync(__dirname + mySettings.localCertFile),                
                auth: mySettings.user + ':' + mySettings.hashPass
            };
            options.agent = new https.Agent(options);

            let req = https.request(options, (res) => {
                let xml = '';
                res.setEncoding('utf8');
                res.on('data', (d) => {
                    xml += d;
                });
                res.on('end', () => {
                    if(xml.indexOf("Logon failed") === -1){
                        parseXml(xml).then(function(obj){
                            deferred.resolve(parseToKanban(obj));
                        }).fail(function(e) {
                            deferred.reject("BCP request failed with parseXml error.");
                        });
                    } else {
                        deferred.reject("BCP logon failed.");
                    }
                });
            });
            req.on('error', (e) => {
                deferred.reject("BCP request failed with error." + e);
            });
            req.end();
        } catch (e) {
            deferred.reject("BCP request failed with error: " + e);
        }
        return deferred.promise;
    }
};
