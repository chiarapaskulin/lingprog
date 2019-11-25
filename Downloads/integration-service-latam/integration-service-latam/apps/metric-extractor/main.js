"use strict";
const loader = require("../../hub-tools/loader");
const jira = loader.loadPort("jira");
const metricExtractor = loader.loadEngine("metric-extractor");

jira.setConfig(loader.loadPortConfig("jira"));
metricExtractor.setConfig(loader.loadEngineConfig("metric-extractor"));