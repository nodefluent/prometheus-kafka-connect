"use strict";

const config = {
  kafka: {
    noptions: {
      "debug": "all",
      "metadata.broker.list": process.env["KAFKA_HOST"] || "localhost:9092",
      "group.id": "n-test-group-9092",
      "enable.auto.commit": false,
      "event_cb": true
    }
  },
  topic: "kc-prom-1",
  partitions: 1,
  maxTasks: 1,
  pollInterval: 250,
  produceKeyed: true,
  produceCompressionType: 0,
  connector: {
    scrapeEndpoint: "/metrics",
    options: {
      job: "promclient_job",
      additionalLabels: ["method"],
      logging: () => {},
      cleaning: {
        interval: 20, // in seconds
        // value: 1, // maximum value that will be pruned
        rank: 10 // not trimming the top rank metric
      }
    }
  },
  http: {
    port: 3149,
    middlewares: []
  },
  enableMetrics: true
};

module.exports = config;
