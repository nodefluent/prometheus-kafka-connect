const Counter = require('prom-client').Counter;

const c = new Counter({
	name: 'rj_counter',
	help: 'Example of a counter'
});

console.log("Counter increased");
c.inc();
