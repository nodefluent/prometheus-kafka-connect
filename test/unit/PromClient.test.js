"use strict";

const assert = require("assert");
const { connector } = require("../sink-config");
const PromClient = require("./../../lib/prometheus/PromClient.js");

describe("PromClient Unit", function() {

  const promclient = new PromClient(connector.options);

  describe("Correct value", function() {

    it("should register the metric", function(done) {

      const expected = promclient._newObject({metric: "test_metric", type: "gauge"});

      assert.doesNotThrow(() => {
        const metric = promclient._getMetricObject({metric: "test_metric", type: "gauge"});
        assert.deepEqual(metric, expected);
        done();
      });
    });

    it("set on gauge should change the value", function(done) {
      const expected = 123;
      assert.doesNotThrow(() => {
        const metric = promclient._getMetricObject({metric: "gauge_metric", type: "gauge"});
        promclient._modify({metric: "gauge_metric", type: "gauge", label:"test", value: 456});
        promclient._modify({metric: "gauge_metric", type: "gauge", label:"test", value: 123});
        assert.deepEqual(metric.hashMap["job:promclient_job,label:test"].value, expected);
        done();
      });
    });

    it("inc on counter should increase the value", function(done) {
      const expected = 3;
      assert.doesNotThrow(() => {
        const metric = promclient._getMetricObject({metric: "counter_metric", type: "gauge"});
        promclient._modify({metric: "counter_metric", type: "counter", label:"test", value: 1});
        promclient._modify({metric: "counter_metric", type: "counter", label:"test", value: 2});
        assert.deepEqual(metric.hashMap["job:promclient_job,label:test"].value, expected);
        done();
      });
    });

    it("should create the correct label for custom label - nested", function(done) {
      const expected = {job: connector.options.job, label:"test", method: "get"};
      assert.doesNotThrow(() => {
        const labels = promclient._getLabels({metric: "test_label_1", type: "gauge", label: { label: "test", method: "get"}});
        assert.deepEqual(labels, expected);
        done();
      });
    });

    it("should create the correct label for custom label - not nested", function(done) {
      const expected = {job: connector.options.job, label:"test", method: "get"};
      assert.doesNotThrow(() => {
        const labels = promclient._getLabels({metric: "test_label_1", type: "gauge", label: "test", method: "get"});
        assert.deepEqual(labels, expected);
        done();
      });
    });

  });

  describe("Errornous value", function() {

    it("should fail when object has been registered", function(done) {
      const expected = "no metric and/or value";
      try {
        promclient._checkThrowable({metric: "fail_1"});
      } catch (err) {
        const message = err.message;
        assert.deepEqual(message, expected);
        done();
      }
    });

    it("should fail on non string metric", function(done) {
      const expected = "A metric should be string.";
      try {
        promclient._checkThrowable({metric: 123, value: 456});
      } catch (err) {
        const message = err.message;
        assert.deepEqual(message, expected);
        done();
      }
    });

    it("should fail on non number value", function(done) {
      const expected = "A value of metric should be number.";
      try {
        promclient._checkThrowable({metric: "fail_2", value: "foo"});
      } catch (err) {
        const message = err.message;
        assert.deepEqual(message, expected);
        done();
      }
    });

    it("should fail on non string type", function(done) {
      const expected = "A type of metric should be string.";
      try {
        promclient._checkThrowable({metric: "fail_3", value: 1, type: 123});
      } catch (err) {
        const message = err.message;
        assert.deepEqual(message, expected);
        done();
      }
    });

    it("should fail on non string help", function(done) {
      const expected = "A help of metric should be string.";
      try {
        promclient._checkThrowable({metric: "fail_4", value: 1, help: 123});
      } catch (err) {
        const message = err.message;
        assert.deepEqual(message, expected);
        done();
      }
    });

    it("should fail on non declared additional label", function(done) {
      const expected = "Added label \"foo\" is not included in initial labelset: [ 'label', 'job', 'method' ]";
      promclient._modify({metric: "fail_5", type: "gauge", value: 1, foo: "test_label"})
        .catch(err => {
          const message = err.message;
          assert.deepEqual(message, expected);
          done();
        });
    });

  });

});
