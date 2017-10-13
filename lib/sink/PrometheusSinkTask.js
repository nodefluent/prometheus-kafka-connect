"use strict";

const { SinkTask } = require("kafka-connect");
const debug = require("debug")("nkc:prom:sink:task");

class PrometheusSinkTask extends SinkTask {

    start(properties = {}, callback = null, parentConfig = {}) {

        this.properties = properties;
        this.parentConfig = parentConfig;

        this.client = properties.client;
        this.client.start();
        callback(null);
    }

    putRecords(records) {
      return Promise.all(records.map(record => {

        if (!record || !record.value || record.value === "null") {
          return false;
        }

         return this.client.postRecord(record).then(_ => true);
      }));
    }

    put(records, callback) {

      this.putRecords(records).then(results => {
        debug(results);
        callback(null);
      }).catch(error => {
        callback(error);
      });
  }

    stop() {
        //empty (con is closed by connector)
    }
}

module.exports = PrometheusSinkTask;
