"use strict";

const express = require("express");
const { register } = require("prom-client");
const router = express.Router();

router.use("/metrics", (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
})

const config = {
    kafka: {
        noptions: {
            "metadata.broker.list": "localhost:9092",
            "group.id": "n-test-group",
            "enable.auto.commit": false,
            "debug": "all",
            "event_cb": true
        },
        tconf: {
            "auto.offset.reset": "earliest"
        }
    },
    topic: "pc_test_topic",
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
        middlewares: [router]
    },
    enableMetrics: false
};

module.exports = config;
