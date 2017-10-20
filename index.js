"use strict";

const { JsonConverter, ConverterFactory } = require("kafka-connect");

const PrometheusSinkConfig = require("./lib/PrometheusSinkConfig.js");
const PrometheusSinkConnector = require("./lib/sink/PrometheusSinkConnector.js");
const PrometheusSinkTask = require("./lib/sink/PrometheusSinkTask.js");

const express = require("express");
const { Registry } = require("prom-client");
const debug = require("debug")("nkc:prom:config");

const runSinkConnector = (properties, converters = [], onError = null) => {

  const router = express.Router();
  const register = new Registry();

  router.use("/metrics", (req, res) => {
    res.set("Content-Type", register.contentType);
    res.end(register.metrics());
  });

  properties.connector.options.register = register;
  properties.http.middlewares = properties.http.middlewares || [];
  properties.http.middlewares.push(router);

  debug(properties);

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
