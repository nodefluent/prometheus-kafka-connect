"use strict";

const { SinkConnector } = require("kafka-connect");

const PromClient = require("./../prometheus/PromClient.js");

class PrometheusSinkConnector extends SinkConnector {

  start(properties = {}, callback) {

    this.client = new PromClient(properties.options);
    callback();
  }

  taskConfigs(maxTasks, callback) {

    callback(null, {
      maxTasks,
      client: this.client
    });
  }

  stop() {
    // empty
  }
}

module.exports = PrometheusSinkConnector;
