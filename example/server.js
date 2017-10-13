'use strict';

const express = require('express');
const cluster = require('cluster');
const server = express();
const register = require('prom-client').register;
const Histogram = require('prom-client').Histogram;
const Counter = require('prom-client').Counter;
const Gauge = require('prom-client').Gauge;

const h = new Histogram({
	name: 'test_histogram',
	help: 'Example of a histogram',
	labelNames: ['code']
});

const c = new Counter({
	name: 'test_counter',
	help: 'Example of a counter',
	labelNames: ['code']
});

const g = new Gauge({
	name: 'test_gauge',
	help: 'Example of a gauge',
	labelNames: ['method', 'code']
});

setTimeout(() => {
	h.labels('200').observe(Math.random());
	h.labels('300').observe(Math.random());
}, 10);

setInterval(() => {
	c.inc({ code: 200 });
}, 5000);

setInterval(() => {
	c.inc({ code: 400 }, 5);
}, 2000);

setInterval(() => {
	g.set({ method: 'get', code: 200 }, Math.random());
	g.set(Math.random());
	g.labels('post', '300').inc();
}, 100);


server.get('/metrics', (req, res) => {
	res.set('Content-Type', register.contentType);
	res.end(register.metrics());
});

server.get('/metrics/counter', (req, res) => {
	res.set('Content-Type', register.contentType);
	res.end(register.getSingleMetricAsString('test_counter'));
});

//Enable collection of default metrics
// require('prom-client').collectDefaultMetrics();

console.log('Server listening to 3000, metrics exposed on /metrics endpoint');
server.listen(3000);
