"use strict";

const Promise = require("bluebird");
const debug = require("debug")("nkc:prom:pushgatewayclient");
const { Counter, Gauge, collectDefaultMetrics, register } = require("prom-client");

const DEFAULT_LABELS = ["label", "job"];

class PromClient {

  constructor(properties = {}){

    this.properties = properties;
    this.register = this.properties.register || register;
    this.metrics = {};
    this.metricObject = null;
  }

  _newObject(record) {

    let object;
    const addLabels = this.properties.additionalLabels || [];
    record.help = record.help || `${record.metric} with type ${record.type || "gauge"}`;

    switch(record.type) {

    case "counter":
      object = new Counter({
        name: record.metric,
        help: record.help,
        registers: [this.register],
        labelNames: DEFAULT_LABELS.concat(addLabels)
      });
      break;

    default:
      object = new Gauge({
        name: record.metric,
        help: record.help,
        registers: [this.register],
        labelNames: DEFAULT_LABELS.concat(addLabels)
      });
    }

    this.metrics[record.metric] = object;
    return this.metrics[record.metric];
  }

  _modify(data) {

    return new Promise((resolve, reject) => {

      debug(data);

      try {
        this._checkThrowable(data);
      } catch(err) {
        reject(err);
      }

      if (!data) {
        resolve(false);
      }

      this.metricObject = this._getMetricObject(data);

      debug(this.metricObject);

      const allLabels = this._getLabels(data);

      debug(allLabels);

      try {
        switch(data.type) {
        case "counter":
          this.metricObject.inc(allLabels, data.value);
          break;
        default:
          this.metricObject.set(allLabels, data.value);
        }
      } catch(err) {
        reject(err);
      }

      // Set back to null for cleaning up
      this.metricObject = null;
      resolve(true);
    });

  }

  _getLabels(data) {

    // Case of data.label is string
    // e.g: {label: "foo"}
    const singleLabel = data.label && typeof data.label === "string" ? {label: data.label} : null;

    // Case of data.label is object
    // e.g: {label: {foo: "bar"}}
    let multiLabel = data.label && typeof data.label === "object" || data.label instanceof Object ? data.label : null;

    // Case of additional label is not children of key label
    // e.g: {label: "test", "foo": "bar"}
    if(!multiLabel) {
      multiLabel = {};
      for (const key in data) {
        if (["metric", "label", "value", "help", "type"].indexOf(key) === -1) {
          multiLabel[key] = data[key];
        }
      }
    }

    return Object.assign({},
      {job: this.properties.job},
      singleLabel,
      multiLabel
    );
  }

  _checkThrowable(data) {

    const {metric, value, type, help} = data;

    if (!metric || !value) {
      throw new Error("no metric and/or value");
    }

    if (typeof metric !== "string") {
      throw new Error("A metric should be string.");
    }

    if (typeof value !== "number") {
      throw new Error("A value of metric should be number.");
    }

    if (help && typeof help !== "string") {
      throw new Error("A help of metric should be string.");
    }

    if (type && typeof type !== "string") {
      throw new Error("A type of metric should be string.");
    }

  }

  _getMetricObject(data = {}) {

    return this.metrics[data.metric] || this._newObject(data);
  }

  start() {

    // Generate default metrics from node process
    collectDefaultMetrics({register: this.register});
  }

  setRecord(record){

    return this._modify(record.value);
  }
}

module.exports = PromClient;
