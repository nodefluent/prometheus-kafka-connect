"use strict";

const { JsonConverter, ConverterFactory } = require("kafka-connect");

const PrometheusSinkConfig = require("./lib/PrometheusSinkConfig.js");
const PrometheusSinkConnector = require("./lib/sink/PrometheusSinkConnector.js");
const PrometheusSinkTask = require("./lib/sink/PrometheusSinkTask.js");

const express = require("express");
const { Registry } = require("prom-client");
const debug = require("debug")("nkc:prom:config");

const runSinkConnector = (properties, converters = [], onError = null) => {

  if(!properties || !properties.connector || !properties.connector.options){
    return Promise.reject(new Error("Connector configuration is missing, connector.options should be an object."));
  }

  if(!properties.connector.options.job){
    return Promise.reject(new Error("Connector configuration is missing, connector.options.job should be set."));
  }

  if(!properties.http){
    properties.http = {};
  }

  if(!Array.isArray(properties.http.middlewares)){
    properties.http.middlewares = [];
  }
  
  debug(properties);

  const router = express.Router();
  const register = new Registry();

  router.use(properties.connector.scrapeEndpoint || "/metrics", (req, res) => {
    res.set("Content-Type", register.contentType);
    res.end(register.metrics());
  });

  properties.connector.options.register = register;
  properties.http.middlewares.push(router);

  const config = new PrometheusSinkConfig(properties,
    PrometheusSinkConnector,
    PrometheusSinkTask, [JsonConverter].concat(converters));

  if (onError) {
    config.on("error", onError);
  }

  return config.run().then(() => {
    return config;
  });
};

module.exports = {
  runSinkConnector,
  ConverterFactory
};
