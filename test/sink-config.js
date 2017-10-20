"use strict";

const config = {
  kafka: {
    noptions: {
      "metadata.broker.list": "kafka:9092",
      "group.id": "n-test-group",
      "enable.auto.commit": false,
      "debug": "all",
      "event_cb": true
    },
    tconf: {
      "auto.offset.reset": "earliest"
    }
  },
  topic: "pkc_test_topic1",
  partitions: 1,
  maxTasks: 1,
  pollInterval: 2000,
  produceKeyed: true,
  produceCompressionType: 0,
  awaitRetry: 2000,
  maxRetries: 3,
  connector: {
    options: {
      job: "promclient_job",
      additionalLabels: ["method"],
      logging: () => {}
    },
    maxPollCount: 50,
    table: "accounts_import",
    incrementingColumnName: "id"
  },
  http: {
    port: 3131,
    middlewares: []
  },
  enableMetrics: false
};

module.exports = config;
