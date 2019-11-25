"use strict";
const JsonDB = require('node-json-db');
const fs = require('fs');

const moduleSettings = require("./settings");
const jiraConfig = moduleSettings.jiraConfig();

const moduleJira = require(jiraConfig.require);
moduleJira.loadSubsettings(jiraConfig);

const getCsvHeader = function(history){
    let keys = Object.keys(history[0]);
    keys.pop();//remove history
    keys.pop();//remove historybycolumn
    let columns = Object.keys(moduleJira.mapColumns());
    for(let c=0; c<columns.length;c++){
        keys.push(columns[c]+"_hours");
        keys.push(columns[c]+"_days");
    }
    return '"'+keys.join('","')+'"'+"\n";
};
const getCsvRow = function(issueHistory){
    let row = [];
    let keys = Object.keys(issueHistory);
    keys.pop();//remove history
    keys.pop();//remove historybycolumn
    for(let k=0; k<keys.length; k++){
        row.push(issueHistory[keys[k]]);
    }

    let columns = Object.keys(moduleJira.mapColumns());
    for(let c=0; c<columns.length;c++){
        if(columns[c] in issueHistory.historybycolumn){
            row.push(issueHistory.historybycolumn[columns[c]].hours.toFixed(2));
            row.push(issueHistory.historybycolumn[columns[c]].days.toFixed(2));
        } else {
            row.push('0');
            row.push('0');
        }
    }
    return '"'+row.join('","')+'"'+"\n";
};
const rawDataToCsv = function(rawHistory){
    //header
    let csv = "";
    if(rawHistory.length > 0){
        csv = getCsvHeader(rawHistory);
        for(let h=0; h<rawHistory.length; h++){
            csv += getCsvRow(rawHistory[h]);
        }
    }
    return csv;
};

moduleJira.getHistory().then(function(rawHistory){
    console.log("rawHistory("+rawHistory.length+")");
    let db = new JsonDB("rawHistory", true, true);
    db.push("/rawHistory",rawHistory);

    fs.writeFile('metrics.csv', rawDataToCsv(rawHistory), 'utf8', function (err) {
        if (err) {
            console.log('Some error occured - file either not saved or corrupted file saved.');
        } else{
            console.log('It\'s saved!');
        }
    });
}).catch(function(e){
    console.log(e);
});
