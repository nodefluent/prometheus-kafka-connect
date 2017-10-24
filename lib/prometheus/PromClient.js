"use strict";

const Promise = require("bluebird");
const debug = require("debug")("nkc:prom:pushgatewayclient");
const { Counter, Gauge, register: REGISTER } = require("prom-client");

const DEFAULT_LABELS = ["label", "job"];
const RECORD_TYPES = ["counter", "gauge"];
const DEFAULT_METRIC_KEYS = ["metric", "label", "value", "help", "type"];

class PromClient {

  constructor(properties = {}){

    this.properties = properties;
    this.register = this.properties.register || REGISTER;
    this.metrics = {};
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

    case "gauge":
      object = new Gauge({
        name: record.metric,
        help: record.help,
        registers: [this.register],
        labelNames: DEFAULT_LABELS.concat(addLabels)
      });
      break;

    default:
      throw new Error(`The record type ${record.type} is not supported. Please use one of the following: ${RECORD_TYPES.join(", ")}.`);
    }

    this.metrics[record.metric] = object;
    return this.metrics[record.metric];
  }

  _modify(data) {
    return new Promise((resolve, reject) => {

      debug(data);

      //skip if its empty
      if (!data) {
        return resolve(false);
      }

      let metricObject = null;

      //validate scheme
      try {
        this._checkThrowable(data);
        metricObject = this._getMetricObject(data);
      } catch(err) {
        return reject(err);
      }

      const allLabels = this._getLabels(data);
      debug(allLabels);

      try {
        switch(data.type) {

        case "counter":
          metricObject.inc(allLabels, data.value);
          break;

        case "gauge":
          metricObject.set(allLabels, data.value);
          break;

        default:
            //empty
        }

      } catch(err) {
        return reject(err);
      }

      resolve(true);
    });
  }

  _getLabels(data) {

    // Case of data.label is string
    // e.g: {label: "foo"}
    const singleLabel = data.label && typeof data.label === "string" ? {label: data.label} : null;

    // Case of data.label is object
    // e.g: {label: {foo: "bar"}}
    let multiLabel = data.label && typeof data.label === "object" ? data.label : null;

    // Case of additional label is not children of key label
    // e.g: {label: "test", "foo": "bar"}
    if(!multiLabel) {
      multiLabel = {};
      for (const key in data) {
        if (DEFAULT_METRIC_KEYS.indexOf(key) === -1) {
          multiLabel[key] = data[key];
        }
      }
    }

    return Object.assign({}, {
      job: this.properties.job
    },
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
    //empty
  }

  setRecord(record){
    return this._modify(record.value);
  }
}

module.exports = PromClient;
