"use strict";

const assert = require("assert");
const uuid = require("uuid");
const request = require("request");
const { SourceRecord } = require("kafka-connect");
const { NProducer } = require("sinek");

const { runSourceConnector, runSinkConnector, ConverterFactory } = require("./../../index.js");
const sinkProperties = require("./../sink-config.js");

describe("Connector INT", function() {

    describe("Sink", function() {

        let config = null;
        let error = null;

        it("should be able to run prometheus sink config", function() {
            const onError = _error => {
                error = _error;
            };
            return runSinkConnector(Object.assign({}, sinkProperties, { enableMetrics: true }), [], onError).then(_config => {
                config = _config;
                return true;
            });
        });

        it("should be able to await a few message puts", function(done) {
            this.timeout(5000);
            setTimeout(() => {
                assert.ifError(error);
                done();
            }, 4500);
        });

        it("should be able to close configuration", function(done) {
            config.stop();
            setTimeout(done, 1500);
        });

    });

    describe("Converter Factory", function() {

        const random = (Math.random()*10).toFixed(3) * 1;
        let config = null;
        let error = null;
        let topic = "pc_test_topic_2";
        let converter = {};
        let producer = null;

        it("should be able to create custom converter", function(done) {

            const etl = (message, callback) => {

                let record = {
                    metric: message.metric,
                    value: message.value,
                    label: message.label,
                    type: message.type,
                    help: message.help
                }

                return callback(null, record);

            }

            converter = ConverterFactory.createSinkSchemaConverter(null, etl);

            const payload = {"metric":"pi_metric","value":3.14159,"type":"gauge","help":"it is pi","label":"constants"};

            const aFakeKafkaMessage = {
                partition: 0,
                topic: "bla",
                value: payload,
                offset: 1,
                key: Buffer.from("123", "utf8")
            };

            converter.toConnectData(Object.assign({}, aFakeKafkaMessage), (error, message) => {
                assert.ifError(error);
                assert.deepEqual(message.value.value, payload);
                assert.ok(message.key);
                assert.ok(message.value.key);

                converter.toConnectData(Object.assign({}, aFakeKafkaMessage), (error, message) => {

                    assert.ifError(error);
                    assert.deepEqual(message.value.value, payload);
                    assert.ok(message.key);
                    assert.ok(message.value.key);

                    done();
                });
            });
        });

        it("should be able to produce a few messages", function() {
            producer = new NProducer(sinkProperties.kafka, topic, 1);
            return producer.connect().then(_ => {
                return Promise.all([
                    producer.buffer(topic, "3", {"metric":"euler_metric","value":2.71828,"type":"gauge"}),
                    producer.buffer(topic, "4", {"metric":"any_metric","value":random})
                ]);
            });
        });

        it("should be able to await a few broker interactions", function(done) {
            setTimeout(() => {
                assert.ifError(error);
                done();
            }, 1500);
        });

        it("should be able to sink message through custom converter", function() {
            const onError = _error => {
                error = _error;
            };

            const customProperties = Object.assign({}, sinkProperties, { topic });
            return runSinkConnector(customProperties, [converter], onError).then(_config => {
                config = _config;
                return true;
            });
        });

        it("should be able to await scrape process", function(done) {
            this.timeout(3000);
            setTimeout(() => {
                assert.ifError(error);
                done();
            }, 2500);
        });

        it("should be able to get the same value from prometheus", function(done) {

            request({
                url: "http://localhost:9090/api/v1/query?query=any_metric",
                method: 'GET'
            },
            (error, response, body) => {

                assert.ok(body && JSON.parse(body).status ==="success");
                const result = JSON.parse(body);
                const metric_name = result.data.result[0].metric["__name__"];
                const metric_value = result.data.result[0].value[1] * 1;
                assert(metric_name, "any_metric");
                assert(metric_value, random);
                done();
            });
        });

        it("should be able to close configuration", function(done) {
            config.stop();
            producer.close();
            setTimeout(done, 1500);
        });
    });

    describe("Sink with erroneous message", function() {

        const brokenTopic = sinkProperties.topic + "_broken";
        let config = null;
        let error = null;
        let errorArray = [];

        it("should be able to run prometheus sink config", function() {
            const onError = _error => {
                error = _error;
            };

            sinkProperties.topic = brokenTopic;

            return runSinkConnector(sinkProperties, [], onError).then(_config => {
                config = _config;
                return true;
            });
        });


        it("should be able to close configuration", function(done) {
            config.stop();
            setTimeout(done, 1500);
        });

        it("should produce the erroneous message", function(done) {

            const partitions = 1;
            const producer = new NProducer(sinkProperties.kafka, [brokenTopic]);
            producer.on("error", error => {
                console.error(error);
                return done();
            });

            producer.connect()
                .then(() => producer.send(brokenTopic, JSON.stringify({payload: "this is another wrong"})))
                .then(() => done());
        });

        it("should be able to run prometheus sink config", function() {
            const onError = _error => {
                error = _error;
            };

            sinkProperties.topic = brokenTopic;
            sinkProperties.maxRetries = 2;
            sinkProperties.awaitRetry = 100;
            sinkProperties.haltOnError = true;

            return runSinkConnector(sinkProperties, [], onError).then(_config => {
                config = _config;
                return true;
            });
        });

        it("should put valid messages and fail on erroneous message", function(done) {
            this.timeout(8500);
            setTimeout(() => {
                assert.equal(error, "Error: halting because of retry error.");
                done();
            }, 8000);
        });
    });
});
