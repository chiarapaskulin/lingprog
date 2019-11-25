"use strict";

var loader;
var bcp;
var jira;
var changeManager;

function reloadModules() {
    const kanbanFolders = ["hub-tools\\loader", "hub-ports", "hub-engines"];

    Object.keys(require.cache).forEach(function (key) {
        (kanbanFolders.find(folder => key.includes(folder))) ? delete require.cache[key] : "";
    });

    loader = require("../../hub-tools/loader");
    bcp = loader.loadPort("bcp");
    jira = loader.loadPort("jira");
    changeManager = loader.loadEngine("change-manager");
    bcp.setConfig(loader.loadPortConfig("bcp"));
    jira.setConfig(loader.loadPortConfig("jira"));
    changeManager.setConfig(loader.loadEngineConfig("change-manager"));
};

async function startAsync() {
    try {
        // Reset Modules for a fresh start of each branch
        reloadModules();

        // Retrieve incidents from BCP and Cards from Jira
        let [bcpResult, jiraResult] = await Promise.all([bcp.search(), jira.search()]);
        console.log("Retrieved incidents: " + Object.keys(bcpResult).length + " - Retrieved cards: " + Object.keys(jiraResult).length);

        // Check if the result list are valid (OBS: It's expected at least one item as search result from each endpoint)
        if (Object.keys(bcpResult).length < 1) {
            throw "BCP search result list is empty";
        } else if (Object.keys(jiraResult).length < 1) {
            throw "Jira search result list is empty";
        }

        // Compare incidents and cards to determine the necesary updates  
        changeManager.tryIncidents(bcpResult);
        let comparasionResult = await changeManager.tryJira(jiraResult);

        console.log("tryIncidents: new(" + Object.keys(comparasionResult.new).length + ") - update(" + Object.keys(comparasionResult.update).length + ")");

        // Performe the necesary updates   
        await Promise.all([jira.createTasks(comparasionResult.new), jira.updateTasks(comparasionResult.update)]);

        return "Board update complete";
    } catch (error) {
        throw error;
    }
};

module.exports.startAsync = startAsync;