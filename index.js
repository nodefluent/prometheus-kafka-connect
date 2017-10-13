"use strict";

const { JsonConverter, ConverterFactory } = require("kafka-connect");

const PrometheusSinkConfig = require("./lib/PrometheusSinkConfig.js");
const PrometheusSinkConnector = require("./lib/sink/PrometheusSinkConnector.js");
const PrometheusSinkTask = require("./lib/sink/PrometheusSinkTask.js");

const runSinkConnector = (properties, converters = [], onError = null) => {

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
