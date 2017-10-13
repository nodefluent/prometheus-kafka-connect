# prometheus-pushgw-kafka-connect

The connector is ready for production, but streaming into a pushgateway can result into concurrency problems,
if you produce more messages > 1 in the scrape interval, only the latest value will be crawled. This can
cause issues with Counters.
We suggest using our [prometheus connector](https://github.com/nodefluent/prometheus-kafka-connect) instead,
if you are planning to do this.
