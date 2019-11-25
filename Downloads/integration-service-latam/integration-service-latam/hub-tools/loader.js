"use strict";
const path = require('path');
const extend = require('node.extend');
const rootPath = __dirname.replace("hub-tools","");
const settings = {
    portsPath: rootPath+"hub-ports/",
    enginesPath: rootPath+"hub-engines/"
};
const loadConfig = function(general,specific,master){
    let settings;
    if(general == undefined){
        throw "No general config for "+port;
    }
    settings = general;
    if(specific != undefined){
        settings = extend(general, specific);
    }
    if(master != undefined){
        settings = extend(general, specific);
        settings = extend(settings, master);
    }
    return settings;
}
module.exports = {
    loadPort: function(port){
        return require(path.join(settings.portsPath,port,port));
    },
    loadEngine: function(engine){
        try {
            return require(path.join(settings.enginesPath,engine,"specific-"+engine));
        } catch (error) {
            return require(path.join(settings.enginesPath,engine,engine));
        }
    },
    loadPortConfig: function(port){
        let general, specific, master;
        try {
            general = require(path.join(settings.portsPath,port,"general-config"));
        } catch (error) {
            // do nothing
        }
        try {
            specific = require(path.join(settings.portsPath,port,"specific-config"));
        } catch (error) {
            // do nothing
        }
        try {
            master = require(path.join(settings.portsPath,port,"master-config"));
        } catch (error) {
            // do nothing
        }
        return loadConfig(general, specific, master);
    },
    loadEngineConfig: function(engine){
        let general, specific, master;
        try {
            general = require(path.join(settings.enginesPath,engine,"general-config"));
        } catch (error) {
            // do nothing
        }
        try {
            specific = require(path.join(settings.enginesPath,engine,"specific-config"));
        } catch (error) {
            // do nothing
        }
        try {
            master = require(path.join(settings.enginesPath,engine,"master-config"));
        } catch (error) {
            // do nothing
        }
        return loadConfig(general, specific, master);
    },
    buildPath: function(path){
        return rootPath+path;
    }
};
