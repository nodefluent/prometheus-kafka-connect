"use strict";

const Promise = require("bluebird");
const request = require("request");
const debug = require("debug")("nkc:prom:pushgatewayclient");
const express = require('express');
const { register, Counter, Gauge, collectDefaultMetrics } = require('prom-client');

const DEFAULT_LABELS = ["label", "job"];

class PromClient {

    constructor(properties = {}){
      this.properties = properties;
      this.server = express();
      this.metrics = {};
      this.metricObject = null;
    }

    _newObject(record) {
      record.help = record.help || `${record.metric} with type ${record.type || "gauge"}`;
      const addLabels = this.properties.additionalLabels || [];
      let object;

      switch(record.type) {

        case "counter":
          object = new Counter({
            name: record.metric,
            help: record.help,
            labelNames: DEFAULT_LABELS.concat(addLabels)
          });
          break;

        default:
          object = new Gauge({
            name: record.metric,
            help: record.help,
            labelNames: DEFAULT_LABELS.concat(addLabels)
          });
      }

      this.metrics[record.metric] = object;
      return this.metrics[record.metric];
    }

    _modify(data) {

      if (!data) {
        return Promise.reject(false);
      }

      this.metricObject = this._getMetricObject(data);

      const allLabels = this._getLabels(data);

      switch(data.type) {
        case "counter":
          this.metricObject.inc(allLabels, data.value);
          break;
        default:
          this.metricObject.set(allLabels, data.value);
      }

      // Set back to null for cleaning up
      this.metricObject = null;
      return Promise.resolve(true);
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
      collectDefaultMetrics();
    }

    setRecord(record){
      try {
        this._checkThrowable(record.value);
      } catch(err) {
        return Promise.reject(false);
      }
      return this._modify(record.value);
    }
}

module.exports = PromClient;
