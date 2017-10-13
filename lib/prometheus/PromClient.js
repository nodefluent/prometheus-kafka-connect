"use strict";

const Promise = require("bluebird");
const request = require("request");
const debug = require("debug")("nkc:prom:pushgatewayclient");
const express = require('express');
const { register, Counter, Gauge } = require('prom-client');

const UTF8 = "utf8";

class PromClient {

    constructor(properties = {}){
      this.properties = properties;
      this.server = express();
      this.currObj = null;
      this.metrics = [];
    }

    _newObject(record) {

      switch(record.type) {

        case "counter":
          return new Counter({
            name: record.metric,
            help: record.help,
            label: ["label"]
          });
          break

        default:
          return new Gauge({
            name: record.metric,
            help: record.help,
            label: ["label"]
          });
      }
    }

    _modify(data = {}) {

      try {

        // If it doesn't exist in the array, create a new metric initialization
        if (this.metrics.map(x => name).indexOf(data.metric) === -1) {

          this.metrics.push({
            name: data.metric,
            object: this._newObject(data)
          });

          this.currObj = this.metrics[0].object;
        }
        // Otherwise use from the array
        else {
          this.currObj = this.metrics.filter(x => x.name = data.metric)[0].object;
        }
      } catch(err) {
        return Promise.reject(false);
      }


      switch(data.type) {
        case "counter":
            this.currObj.inc(data.value);
            break;
        default:
            this.currObj.set(data.value);
      }

      this.currObj = null;

      return Promise.resolve(true);
    }

    start() {
        this.server.get('/metrics', (req, res) => {
        	res.set('Content-Type', register.contentType);
        	res.end(register.metrics());
        });

        console.log(`PromClient is listening to port ${3000}`);
        this.server.listen(3000);

    }

    postRecord(record){
        return _modify(record.value);
    }
}

module.exports = PromClient;
