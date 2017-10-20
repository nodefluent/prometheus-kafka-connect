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
    options: {
      job: "promclient_job",
      additionalLabels: ["method"],
      logging: () => {}
    },
  },
  http: {
    port: 3149,
    middlewares: []
  },
  enableMetrics: true
};

module.exports = config;
