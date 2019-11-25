"use strict";
const loader = require("../../hub-tools/loader");
const bcp = loader.loadPort("bcp");
const jira = loader.loadPort("jira");
const changeManager = loader.loadEngine("change-manager");

bcp.setConfig(loader.loadPortConfig("bcp"));
jira.setConfig(loader.loadPortConfig("jira"));
changeManager.setConfig(loader.loadEngineConfig("change-manager"));

bcp.search().then(function(results){
    changeManager.tryIncidents(results).then(function(result){
        console.log("tryIncidents: new("+Object.keys(result.new).length+") - update("+Object.keys(result.update).length+")");
        jira.createTasks(result.new);
        jira.updateTasks(result.update);
    }).catch(function(e){
        console.log(e);
    });
}).catch(function(e){
    console.log(e);
});

jira.search().then(function(results){
    changeManager.tryJira(results).then(function(result){
        console.log("tryJira: new("+Object.keys(result.new).length+") - update("+Object.keys(result.update).length+")");
        jira.createTasks(result.new);
        jira.updateTasks(result.update);
    }).catch(function(e){
        console.log(e);
    });
}).catch(function(e){
    console.log(e);
});