"use strict";

const config = {
  kafka: {
    noptions: {
      "debug": "all",
      "metadata.broker.list": "kafka:9092",
      "group.id": "test-group-pkc-9092",
      "enable.auto.commit": false,
      "event_cb": true
    }
  },
  topic: "test-topic-pkc-9092-1",
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
      logging: () => {}
    },
  },
  http: {
    port: 3131,
    middlewares: []
  },
  enableMetrics: false
};

module.exports = config;
