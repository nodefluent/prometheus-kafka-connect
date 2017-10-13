"use strict";

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
            proto: "http",
            host: "localhost",
            port: 9091,
            job: "pushgateway_job",
            logging: () => {}
        },
        maxPollCount: 50,
        table: "accounts_import",
        incrementingColumnName: "id"
    },
    http: {
        port: 3149,
        middlewares: []
    },
    enableMetrics: false
};

module.exports = config;
