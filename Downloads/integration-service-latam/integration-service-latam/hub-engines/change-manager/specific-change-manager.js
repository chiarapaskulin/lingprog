"use strict";
const Q = require('q');

/** LABELS */
const LABEL_OUT = "out";
const LABEL_CUSTOMER_ACTION = "customer_action";
const LABEL_BLOCKED = "blocked";
const LABEL_MPT_0 = "MPT_0";
const LABEL_MPT_5 = "MPT_5";
const LABEL_MPT_10 = "MPT_10";
const LABEL_MPT_100 = "MPT_100";
const LABEL_BURNING = "burning";
const LABEL_TOP_PRIO = "top_prio";
const LABEL_GOAL = "goal";
const LABEL_NICE = "nice_to_have";
const LABEL_MPT_EXCEEDED = "mpt_exceeded"


/** BCP Status */
const BCP_NEW = "New";
const BCP_PROCESS = "In Process";
const BCP_CUST_ACTION = "Customer Action";
const BCP_CONFIRMED = "Confirmed";
const BCP_BLOCKED = "On Hold";
const BCP_SOL_PROVIDED = "Solution Provided";

/** JIRA Status */
const JIRA_BRIEFING = "briefing";
const JIRA_ANALYSIS = "analysis";
const JIRA_DEVELOPMENT = "development";
const JIRA_TEST = "test";
const JIRA_DELIVERY = "delivery";
const JIRA_FEEDBACK = "feedback";
const JIRA_CLOSURE = "closure";

/** Priority */
const PRIORITY_LOW = "9";
const PRIORITY_MEDIUM = "5";
const PRIORITY_HIGH = "3";
const PRIORITY_VERY_HIGH = "1";

let mySettings = undefined;
let arrIncidents = undefined;
let arrJira = undefined;

const hasLabel = function(x,search){
    let issue = (typeof x === 'string' || x instanceof String)?arrJira[x]:x;
    return ((" "+issue.fields.labels.join(" ").toLowerCase()+" ").indexOf(" "+search.trim().toLowerCase()+" ") > -1);
};

const transitionTo = function(x, newstatus, arrUpdate){
    arrJira[x].newstatus = newstatus;
    arrJira[x] = merge(arrJira[x], {"transition": arrJira[x].newstatus});
    if(arrUpdate != undefined)
        arrUpdate[x] = arrJira[x];
};
const updateAddLabel = function(x, label){
    arrJira[x].fields.labels.push(label.trim());
    arrJira[x] = merge(arrJira[x], {"update":{"labels": [{"add":label.trim()}]}});
};
const updateRemoveLabel = function(x, label){
    arrJira[x] = merge(arrJira[x], {"update":{"labels": [{"remove":label}]}});
};

const findMpt = function(elm){
    return elm.toLowerCase().indexOf("mpt_") > -1;
};
const merge = function() {
    var destination = {}, sources = [].slice.call( arguments, 0 );
    sources.forEach(function( source ) {
        for ( var prop in source ) {
            if ( prop in destination && Array.isArray( destination[ prop ] ) ) {
                destination[ prop ] = destination[ prop ].concat( source[ prop ] );
            } else if ( prop in destination && typeof destination[ prop ] === "object" ) {
                destination[ prop ] = merge( destination[ prop ], source[ prop ] );
            } else {
                destination[ prop ] = source[ prop ];
            }
        }
    });
    return destination;
};
const tryCompare = function(){
    let deferred = Q.defer();
    if(arrJira != undefined && arrIncidents != undefined && ( Object.keys(arrIncidents).length > 0 ) ){
        let arrNewIncidents = {};
        let arrUpdateIncidents = {};
        //Incidents returned by the service
        for(let x in arrIncidents){
            if (arrJira.hasOwnProperty(x)){
                /** Update Incident */
                checkDod(arrJira[x], x);       
                compareToUpdate(x,arrUpdateIncidents);                
                delete arrJira[x];
                delete arrIncidents[x];
            } else {
                /** Create Incident */
                if(arrIncidents[x].bcpFields.MPT_EXCEEDED != ''){
                    arrIncidents[x].fields.labels.push(LABEL_MPT_EXCEEDED);
                }
                if(arrIncidents[x].bcpFields.PRIORITY_KEY == PRIORITY_VERY_HIGH){
                    arrIncidents[x].fields.labels.push(LABEL_BURNING);
                }else if(arrIncidents[x].bcpFields.PRIORITY_KEY == PRIORITY_LOW){
                    arrIncidents[x].fields.labels.push(LABEL_NICE);
                }else{
                    arrIncidents[x].fields.labels.push(LABEL_GOAL);
                } 

                arrIncidents[x].fields.labels.push(arrIncidents[x].bcpFields.CATEGORY);               
                arrIncidents[x].fields.assignee.name = arrIncidents[x].bcpFields.PROCESSOR_ID;
                arrNewIncidents[x] = arrIncidents[x];
            }
        }

        //Incidents only in Jira
        for(let x in arrJira){
            checkDod(arrJira[x], x);
            updateReplaceDod(x,arrUpdateIncidents);
            switch (arrJira[x].kanbanColumn) {                
                case JIRA_FEEDBACK:
                    if(hasLabel(x,LABEL_OUT) != true){
                        updateRemoveLabel(x, LABEL_BLOCKED);
                        updateRemoveLabel(x, LABEL_CUSTOMER_ACTION);
                        transitionTo(x,JIRA_CLOSURE,arrUpdateIncidents);
                    }
                                        
                    break;
                default:
                    if(hasLabel(x,LABEL_CUSTOMER_ACTION)){
                        updateRemoveLabel(x, LABEL_CUSTOMER_ACTION);
                        transitionTo(x,JIRA_CLOSURE,arrUpdateIncidents);
                    }else if(hasLabel(x,LABEL_BLOCKED)){
                        updateRemoveLabel(x, LABEL_BLOCKED);
                        transitionTo(x,JIRA_CLOSURE,arrUpdateIncidents);
                    }else{
                        updateAddLabel(x, LABEL_OUT);
                        transitionTo(x,JIRA_FEEDBACK,arrUpdateIncidents);
                    }
                    
                    break;

            }
            arrUpdateIncidents[x] = arrJira[x];
        }
        deferred.resolve({new:arrNewIncidents, update:arrUpdateIncidents});
    }
    return deferred.promise;
};
const compareToUpdate = function(key,arrUpdate){
    //comparison custom made for bcpstatus
    switch(arrIncidents[key].bcpstatus){
        case BCP_NEW:
            break;
        case BCP_PROCESS:

            if(hasLabel(key,LABEL_OUT) ){
                arrJira[key].newstatus = JIRA_BRIEFING;
                arrJira[key] = merge(arrJira[key], {"transition": arrJira[key].newstatus});
            }
            
            switch (arrJira[key].kanbanColumn) {
                case JIRA_FEEDBACK:
                    arrJira[key].newstatus = JIRA_BRIEFING;
                    arrJira[key] = merge(arrJira[key], {"transition": arrJira[key].newstatus});
                    break;
                case JIRA_CLOSURE:
                    arrJira[key].newstatus = JIRA_BRIEFING;
                    arrJira[key] = merge(arrJira[key], {"transition": arrJira[key].newstatus});
                    break;                    
            }

            updateRemoveLabel(key, LABEL_CUSTOMER_ACTION);
            updateRemoveLabel(key, LABEL_BLOCKED);
            updateRemoveLabel(key, LABEL_OUT);

            arrUpdate[key] = arrJira[key];
            break;
        case BCP_CUST_ACTION:
            
            updateAddLabel(key, LABEL_CUSTOMER_ACTION);

            updateRemoveLabel(key, LABEL_BLOCKED);
            updateRemoveLabel(key, LABEL_OUT);
            
            arrUpdate[key] = arrJira[key];
            break;
        case BCP_CONFIRMED:
            
            if(arrJira[key].kanbanColumn != JIRA_CLOSURE) {
                arrJira[key].newstatus = JIRA_CLOSURE;
                arrJira[key] = merge(arrJira[key], {"transition": arrJira[key].newstatus});
            }
            
            updateRemoveLabel(key, LABEL_OUT);
            updateRemoveLabel(key, LABEL_CUSTOMER_ACTION);
            updateRemoveLabel(key, LABEL_BLOCKED);
            
            arrUpdate[key] = arrJira[key];
            break;
        case BCP_BLOCKED:
            
            updateAddLabel(key, LABEL_BLOCKED);

            updateRemoveLabel(key, LABEL_CUSTOMER_ACTION);
            updateRemoveLabel(key, LABEL_OUT);
            arrUpdate[key] = arrJira[key];
            break;
        case BCP_SOL_PROVIDED:

            if(arrJira[key].kanbanColumn != JIRA_FEEDBACK) {
                arrJira[key].newstatus = JIRA_FEEDBACK;
                arrJira[key] = merge(arrJira[key], {"transition": arrJira[key].newstatus});
            }

            updateRemoveLabel(key, LABEL_OUT);
            updateRemoveLabel(key, LABEL_CUSTOMER_ACTION);
            updateRemoveLabel(key, LABEL_BLOCKED);

            arrUpdate[key] = arrJira[key];
            break;
    }

    if(arrJira[key].fields.summary == ''){
        arrJira[key].fields.summary = arrIncidents[key].fields.summary;
        arrJira[key] = merge(arrJira[key], {"update":{"summary": [{"set":arrIncidents[key].fields.summary}]}});
        arrUpdate[key] = arrJira[key];
    }
    if(arrIncidents[key].fields.description != arrJira[key].fields.description){
        arrJira[key].fields.description = arrIncidents[key].fields.description;
        arrJira[key] = merge(arrJira[key], {"update":{"description": [{"set":arrIncidents[key].fields.description}]}});
        arrUpdate[key] = arrJira[key];
    }
    if(arrIncidents[key].fields.priority.id != arrJira[key].fields.priority.id){
        arrJira[key].fields.priority.id = arrIncidents[key].fields.priority.id;
        arrJira[key] = merge(arrJira[key], {"update":{"priority": [{"set":{"id":arrIncidents[key].fields.priority.id}}]}});
        arrUpdate[key] = arrJira[key];
    }
 
    // Only update MPT if the BCP status is "In Process"
    if ((arrIncidents[key].bcpstatus == BCP_PROCESS) ||
        (arrIncidents[key].bcpstatus == BCP_NEW)) {
        let bcpMpt = arrIncidents[key].fields.labels.find(findMpt);

        if(bcpMpt !== undefined){
            let arrMpts = [LABEL_MPT_0,LABEL_MPT_5,LABEL_MPT_10,LABEL_MPT_100];
            let arrLabelsOperations = [];
            arrMpts.splice(arrMpts.indexOf(bcpMpt),1);
            for(let x in arrMpts){
                let jiraMpt = arrJira[key].fields.labels.indexOf(arrMpts[x]);
                if(jiraMpt > -1){
                    arrJira[key].fields.labels.splice(jiraMpt);
                    arrLabelsOperations.push({"remove":arrMpts[x]});
                }
            }
            if(arrJira[key].fields.labels.indexOf(bcpMpt) == -1){
                arrLabelsOperations.push({"add":bcpMpt});
            }
            if(arrLabelsOperations.length > 0){
                arrJira[key].fields.labels.push(bcpMpt);
                arrJira[key] = merge(arrJira[key], {"update":{"labels": arrLabelsOperations}});
                arrUpdate[key] = arrJira[key];
            }
        } else {
            let jiraMpt = arrJira[key].fields.labels.join(" ").indexOf("MPT_");
            if(jiraMpt > -1){
                arrJira[key] = merge(arrJira[key], {"update":{"labels": [{"remove":LABEL_MPT_10},{"remove":LABEL_MPT_5},{"remove":LABEL_MPT_0}]}});
                arrUpdate[key] = arrJira[key];
            }
        }
    }
    // Only update EXPIREDATE_ if the BCP status is "In Process"
    if ((arrIncidents[key].bcpstatus == "In Process") ||
        (arrIncidents[key].bcpstatus == "New")) {

        let incidentLabels = arrIncidents[key].fields.labels.join("#").toUpperCase();
        let jiraLabels = arrJira[key].fields.labels.join("#").toUpperCase();
        let bcpExpireDate = incidentLabels.indexOf("EXPIREDATE_");
        let jiraExpireDate = jiraLabels.indexOf("EXPIREDATE_");

        if(bcpExpireDate > -1){
            let jiraDaystoexpire = jiraLabels.indexOf("DAYS_");
            bcpExpireDate = incidentLabels.substr(bcpExpireDate, (incidentLabels.indexOf("#",bcpExpireDate) - bcpExpireDate));

            if(jiraExpireDate > -1){
                jiraExpireDate = jiraLabels.substr(jiraExpireDate, (jiraLabels.indexOf("#",jiraExpireDate) - jiraExpireDate));
                // check if need to remove the current EXPIREDATE_ from jira
                if(jiraExpireDate != bcpExpireDate){
                    arrJira[key] = merge(arrJira[key], {"update":{"labels": [{"add":bcpExpireDate},{"remove":jiraExpireDate}]}});
                    arrUpdate[key] = arrJira[key];
                }
            } else {
                arrJira[key] = merge(arrJira[key], {"update":{"labels": [{"add":bcpExpireDate}]}});
                arrUpdate[key] = arrJira[key];
            }

            let one_day = 1000*60*60*24;
            let today = new Date();
            let expireDate = incidentLabels.match(/EXPIREDATE_(\d+)/);
            expireDate = new Date(expireDate[1].substr(0,4), (expireDate[1].substr(4,2) -1), expireDate[1].substr(6,2));
            let diffDays = Math.ceil((expireDate.getTime()-today.getTime())/(one_day));
            let bcpDaystoexpire = "DAYS_"+diffDays;

            if(jiraDaystoexpire > -1){
                jiraDaystoexpire = jiraLabels.substr(jiraDaystoexpire, (jiraLabels.indexOf("#",jiraDaystoexpire) - jiraDaystoexpire));
                // check if need to remove the current DAYS_ from jira
                if(jiraDaystoexpire != bcpDaystoexpire){
                    arrJira[key] = merge(arrJira[key], {"update":{"labels": [{"add":bcpDaystoexpire},{"remove":jiraDaystoexpire}]}});
                    arrUpdate[key] = arrJira[key];
                }
            } else {
                arrJira[key] = merge(arrJira[key], {"update":{"labels": [{"add":bcpDaystoexpire}]}});
                arrUpdate[key] = arrJira[key];
            }
        }
    }    
    updateReplaceDod(key,arrUpdate);
};

const updateReplaceDod = function(x, arrUpdate){
    /** Replace DOD interely? */
    if(arrJira[x].hasOwnProperty("allDoDUnchecked") && arrJira[x].hasOwnProperty("allDoDDefault") && arrJira[x].hasOwnProperty("noDoD")){
        if((arrJira[x].allDoDUnchecked && arrJira[x].allDoDDefault) || arrJira[x].noDoD ){
            /** Add new DOD */
            let arrU = {"update": {}};
            arrU.update[mySettings.dodField] = [{"set":mySettings.dod}];
            arrJira[x] = merge(arrJira[x], arrU);
            arrUpdate[x] = arrJira[x];
        }
    }
};

const checkDod = function(issue, x){
    
    let allInDoDDefault = true;
    let allUnchecked = true;
    let dF = mySettings.dodField; // for better code reading
    let existInDefaultDod = false;
    let noDoD = true;

    if(issue.fields.hasOwnProperty(dF)){
        noDoD = false;
        for(let d=0; d<issue.fields[dF].length; d++){
            /** Not all are uncheck, cant replace DOD */
            if(issue.fields[dF][d].checked == true){
                allUnchecked = false;
            }

            /** Current DOD item exist in default DOD? */
            for(let s=0; s<mySettings.dod.length; s++){
                if((issue.fields[dF][d].name == mySettings.dod[s].name) &&
                (issue.fields[dF][d].id == mySettings.dod[s].id)) {
                    existInDefaultDod = true;
                    break;
                }
            }
            if(existInDefaultDod == false){
                allInDoDDefault = false;
            }

        }
        if ((mySettings.dod.length > issue.fields[dF].length) && allInDoDDefault){
            allInDoDDefault = false;
        }
    } else {//DOD dont exist
        noDoD = true;
        allUnchecked = true;
        existInDefaultDod = false;
        allInDoDDefault = false;
    }
    issue.allDoDDefault = allInDoDDefault;
    issue.allDoDUnchecked = allUnchecked; 
    issue.noDoD = noDoD;    
};

module.exports = {
    setConfig:function(settings){
        mySettings = settings;
    },
    tryIncidents:function(arr){
        arrIncidents = arr;
        return tryCompare();
    },
    tryJira:function(arr){
        arrJira = arr;
        return tryCompare();
    }
}
