"use strict";
const JiraApi = require('jira-client');
const Q = require('q');

let mySettings = undefined;

const buildSearchHistoryQuery = function () {
    return buildQuery(mySettings.searchHistoryQuery);
};
const buildSearchQuery = function () {
    return buildQuery(mySettings.searchQuery);
};
const buildQuery = function (query) {
    if (query != undefined) {
        for (let setting in mySettings) {
            var regex = new RegExp("(\\$" + setting + ")", "g");
            query = query.replace(regex, mySettings[setting]);
        };
        return query;
    }
};
const sumColumnTime = function (issueHistory, column, fromTime, toTime) {
    let fromDate = new Date(fromTime);
    let toDate = new Date(toTime);
    let time = toDate.getTime() - fromDate.getTime();
    if (column in issueHistory.historybycolumn) {
        issueHistory.historybycolumn[column].hours += (time / 3600000);//miliseconds to hour
    } else {
        issueHistory.historybycolumn[column] = { hours: (time / 3600000), days: 0 };
    }
    issueHistory.historybycolumn[column].days = issueHistory.historybycolumn[column].hours / 24;
};
const getIssueCustomType = function (issue) {
    let labels = issue.fields.labels.join(" ");
    let labelTypePrefix = labels.toUpperCase().indexOf(mySettings.labelTypePrefix);
    if (labelTypePrefix > -1) {
        return labels.substr(labelTypePrefix, labels.indexOf(" ", labelTypePrefix) - labelTypePrefix);
    } else {
        return "Incident";
    }
};
const getIssueCluster = function (issue) {
    let labels = issue.fields.labels.join(" ").toUpperCase();
    for (let x = 0; x < mySettings.clusterLabels.length; x++) {
        if (labels.indexOf(mySettings.clusterLabels[x].toUpperCase()) > -1) {
            return mySettings.clusterLabels[x];
        }
    }
    return "New";
};
const jiraClient = function () {
    return new JiraApi({
        protocol: mySettings.protocol,
        host: mySettings.host,
        username: mySettings.username,
        password: mySettings.password,
        apiVersion: mySettings.apiVersion,
        strictSSL: mySettings.strictSSL,
        fields: mySettings.fields
    });
};
const handleJiraError = function (deferred, e) {
    switch (e.statusCode) {
        case 401:
            deferred.reject("Jira search error [Unauthorized (401)]");
            break;
        case 403:
            deferred.reject("Jira search error [Forbidden (403)]");
            break;
        case 404:
            deferred.reject("Jira search error [Not Found (404)]");
            break;
        default:
            if (e.hasOwnProperty("statusCode")) {
                deferred.reject("Jira search error [" + e.statusCode + "]");
            } else {
                deferred.reject("Jira search error [" + e + "]");
            }
            break;
    }
};
const mapStatusColumn = function (status) {
    for (let x in mapColumnStatus) {
        if (status == mapColumnStatus[x].name) {
            return x;
        } else if (status == "Accepted") {
            return "accepted";//only used for metrics
        }
    }
    return '';
};
//Important: The status order of Open and Completed status are use to define metrics
const mapColumnStatus = {
    "briefing": { name: "Open", id: "11" },
    "analysis": { name: "Planned", id: "21" },
    "development": { name: "In Progress", id: "31" },
    "test": { name: "In Testing", id: "71" },
    "delivery": { name: "Ready for Documentation", id: "51" },
    "feedback": { name: "Under Review", id: "91" },
    "closure": { name: "Completed", id: "101" }
};
//if needed to show the current name of the columns
const mapColumns = {
    "briefing":"Briefing",
    "analysis":"Analysis",
    "development":"Development",
    "test":"Test",
    "delivery":"Delivery",
    "feedback":"Feedback",
    "closure":"Closure"
};
const fillUpdateFields = function (issue) {
    if (issue.newstatus != undefined) {
        issue.transition = mapColumnStatus[issue.newstatus];
        delete issue.newstatus;
    }
};
const fillCreateFields = function (issue) {
    issue.fields.project = { 'key': mySettings.projectKey };
    if (mySettings.parentBacklog && !issue.fields.parent)
        issue.fields.parent = { 'key': mySettings.parentBacklog };
    if (mySettings.issueType && !issue.fields.issuetype)
        issue.fields.issuetype = { 'name': mySettings.issueType };
    if (mySettings.reporter && !issue.fields.reporter)
        issue.fields.reporter = { 'name': mySettings.reporter };
    if (mySettings.dodField && !issue.fields[mySettings.dodField])
        issue.fields[mySettings.dodField] = mySettings.dod;
    delete issue.bcpstatus;
};
const parseToKanban = function (arrJiraTasks) {
    let arrParsed = {};
    let arrDelete = ['expand', 'self'];
    let arrDeleteFields = ['customfield_', 'components', 'parent', 'aggregatetimeestimate', 'creator', 'subtasks', 'reporter', 'aggregateprogress', 'progress', 'votes', 'timespent', 'project', 'aggregatetimespent', 'resolutiondate', 'workratio', 'watches', 'created', 'updated', 'timeoriginalestimate', 'duedate', 'issuetype', 'timeestimate', 'versions', 'issuelinks', 'lastViewed', 'resolution'];
    let arrDeleteFieldsPriority = ['self', 'iconUrl'];
    let arrDeleteFieldsStatus = ['self', 'iconUrl', 'description', 'statusCategory'];
    if (arrJiraTasks != undefined && arrJiraTasks.issues != undefined) {
        for (let x in arrJiraTasks.issues) {
            /* remove useless fields for kanban */
            for (let y in arrJiraTasks.issues[x]) {
                for (let d in arrDelete) {
                    if (y.indexOf(arrDelete[d]) > -1) {
                        delete arrJiraTasks.issues[x][y];
                    }
                }
            }
            for (let y in arrJiraTasks.issues[x].fields) {
                for (let d in arrDeleteFields) {
                    if (y.indexOf(arrDeleteFields[d]) > -1) {
                        if (mySettings.keepFields) {
                            if (!mySettings.keepFields.includes(y))
                                delete arrJiraTasks.issues[x].fields[y];
                        } else {
                            delete arrJiraTasks.issues[x].fields[y];
                        }
                    }
                }
            }
            for (let y in arrJiraTasks.issues[x].fields.priority) {
                for (let d in arrDeleteFieldsPriority) {
                    if (y.indexOf(arrDeleteFieldsPriority[d]) > -1) {
                        delete arrJiraTasks.issues[x].fields.priority[y];
                    }
                }
            }
            for (let y in arrJiraTasks.issues[x].fields.status) {
                for (let d in arrDeleteFieldsStatus) {
                    if (y.indexOf(arrDeleteFieldsStatus[d]) > -1) {
                        delete arrJiraTasks.issues[x].fields.status[y];
                    }
                }
            }
            /* remove useless fields for kanban */

            /* translate the status as kanbanColumn to simplify the understanding */
            arrJiraTasks.issues[x].kanbanColumn = mapStatusColumn(arrJiraTasks.issues[x].fields.status.name);

            /* only considers issues with the default Label in ID prefix */
            if (arrJiraTasks.issues[x].fields.labels != undefined) {
                for (let y in arrJiraTasks.issues[x].fields.labels) {
                    if (arrJiraTasks.issues[x].fields.labels[y].indexOf(prefixId()) > -1) {
                        arrParsed[arrJiraTasks.issues[x].fields.labels[y]] = arrJiraTasks.issues[x];
                        break;
                    }
                }
            }
        }
    } else {
        arrParsed = [];
    }
    return arrParsed;
};
const prefixId = function () {
    return mySettings.fixedId.replace(/[0-9]/g, '');
};
const checkFixedId = function (arrJira) {
    if (mySettings.fixedId in arrJira) {
        delete arrJira[mySettings.fixedId];
        return true;
    }
    return false;
};
module.exports = {
    setConfig: function (settings) {
        mySettings = settings;
    },
    search: function () {
        const deferred = Q.defer();
        jiraClient().searchJira(buildSearchQuery(), { maxResults: 200 })
            .then(function (result) {
                result = parseToKanban(result);
                if (checkFixedId(result)) {
                    deferred.resolve(result);
                }
                deferred.reject("Jira search error [No fixed incident]");
            }).catch(function (e) {
                handleJiraError(deferred, e);
            });
        return deferred.promise;
    },
    getHistory: function () {
        const deferred = Q.defer();
        var arrIssueHistory = [];
        var issueIndex = 0
        var currentDate = new Date();
        currentDate = currentDate.toISOString();
        jiraClient().searchJira(buildSearchHistoryQuery(), { maxResults: 500, fields: ["id", "labels"] })
            .then(function (result) {
                if (result.issues.length > 1) {
                    for (let i = 0; i < result.issues.length; i++) {
                        jiraClient().findIssue(result.issues[i].id, "changelog").then(function (issue) {
                            let issueHistory = {
                                key: issue.key,
                                summary: issue.fields.summary,
                                issuetype: issue.fields.issuetype.name,
                                customtype: getIssueCustomType(issue),
                                cluster: getIssueCluster(issue),
                                created: issue.fields.created,
                                completed: null,
                                currentcolumn: mapStatusColumn(issue.fields.status.name),
                                history: [],
                                historybycolumn: {}
                            };
                            for (let x = issue.changelog.startAt; x < issue.changelog.maxResults; x++) {
                                for (let y = 0; y < issue.changelog.histories[x].items.length; y++) {
                                    if (issue.changelog.histories[x].items[y].field == 'status') {
                                        issueHistory.history.push({
                                            from: mapStatusColumn(issue.changelog.histories[x].items[y].fromString),
                                            to: mapStatusColumn(issue.changelog.histories[x].items[y].toString),
                                            time: issue.changelog.histories[x].created
                                        });
                                    }
                                }
                            }

                            if (issueHistory.history.length == 0) {
                                //there is no status change since the creation
                                sumColumnTime(issueHistory, issueHistory.currentcolumn, issueHistory.created, currentDate);
                            } else {
                                for (let x = 0; x < issueHistory.history.length; x++) {
                                    if (x == 0) {
                                        //first status is changed and should be compared to creation date
                                        sumColumnTime(issueHistory, issueHistory.history[x].from, issueHistory.created, issueHistory.history[x].time);

                                    } else {
                                        //middle status should be compared with x-1 status
                                        sumColumnTime(issueHistory, issueHistory.history[x].from, issueHistory.history[x - 1].time, issueHistory.history[x].time);
                                    }
                                    if (x == issueHistory.history.length - 1) {
                                        //last status should be compared to current date
                                        sumColumnTime(issueHistory, issueHistory.history[x].to, issueHistory.history[x].time, currentDate);

                                        //save completed date for incidents
                                        if (issueHistory.customtype == "Incident" && issueHistory.history[x].to == "completed") {
                                            issueHistory.completed = issueHistory.history[x].time;
                                        } else if (issueHistory.customtype != "Incident" && issueHistory.history[x].to == "accepted") {
                                            //If it's not a incident, a 'complete' date should be used when status is Accepted
                                            issueHistory.completed = issueHistory.history[x].time;
                                        }
                                    }
                                }
                            }

                            arrIssueHistory.push(issueHistory);

                            issueIndex++;
                            if (issueIndex == result.issues.length) {
                                deferred.resolve(arrIssueHistory);
                            }
                        }).catch(function (e) {
                            handleJiraError(deferred, e);
                            issueIndex++;
                            if (issueIndex == result.issues.length) {
                                deferred.resolve(arrIssueHistory);
                            }
                        });
                    }
                } else {
                    deferred.reject("Jira history error [No fixed incident]");
                }
            }).catch(function (e) {
                handleJiraError(deferred, e);
            });
        return deferred.promise;
    },
    updateTasks: async function (arrUpdate) {
        //remember to update the transition: arrJira[key].newstatus using the old jira.columnToTransition
        let promisesArray = [];

        for (let x in arrUpdate) {
            fillUpdateFields(arrUpdate[x]);
            console.log("Jira updateTasks [" + x + "]");
            if (arrUpdate[x].transition != undefined) {
                promisesArray.push(jiraClient().transitionIssue(arrUpdate[x].id, { "transition": arrUpdate[x].transition }).then(() => {
                    console.log("Jira transitionIssue success [" + x + "]");
                }).catch(function () {
                    console.log("Jira transitionIssue error [" + x + "]");
                }));
            }
            if (arrUpdate[x].update != undefined) {
                promisesArray.push(jiraClient().updateIssue(arrUpdate[x].id, { "update": arrUpdate[x].update }).then(() => {
                    console.log("Jira updateIssue success [" + x + "]");
                }).catch(function (e) {
                    console.log("Jira updateIssue error [" + x + "]");
                }));
            }
        }
        await Promise.all(promisesArray);
    },
    
    createTasks: async function (arrCreate) {
        let promisesArray = [];
        for (let x in arrCreate) {
            fillCreateFields(arrCreate[x]);
            console.log("Jira createTasks [" + x + "]");
            promisesArray.push(jiraClient().addNewIssue(arrCreate[x]).then(function (e) {
                console.log("Jira addIssue success [" + x + "]");
            }).catch(function (e) {
                console.log("Jira addIssue error [" + x + "]");
            }));
        }
        await Promise.all(promisesArray);
    }
};