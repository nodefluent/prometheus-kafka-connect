# prometheus-kafka-connect

Connector to prometheus client which only includes sink. This will be useful to stream data from Kafka to Prometheus and subsequently to Grafana. This connector depends on, [kafka-connect](https://github.com/nodefluent/kafka-connect) and [node-sinek](https://github.com/nodefluent/node-sinek) as the consumer. Please read up those dependencies to make things clearer.

You can use javascript consumer or native which depends on [librdkafka](https://github.com/edenhill/librdkafka). The example can be found in `example` directory, which there is a comment to specify where you need to do the transformation. Basically, you need to do that in ETL function, that needs to be passed to the connector. Or just like the following.

```js
const { runSinkConnector, ConverterFactory } = require("prometheus-kafka-connect");
const config = require("./config.js");

console.log("Waiting for message to be consumed...");

const etl = (message, next) => {

  // Do the transformation here
  let record;
  try {
    record = {
      metric: message.name
      value: 1,
      type: "counter" // or "gauge"
    };
  } catch(err) {
    // Do nothing
  }

  if (record && record.metric && record.value) {
    // Continue with the transformed record
    return next(null, record);
  }

  // Continue without throwing error
  return next();

}

const converter = ConverterFactory.createSinkSchemaConverter(null,etl);

runSinkConnector(config, [converter], console.log.bind(console)).then(sink => {

});

```

### Configuration
* For the native and non-native consumer please take a look at [node-sinek](https://github.com/nodefluent/node-sinek) project.
* There is an example of doing local setup complete with kafka, zookeeper, prometheus, and grafana in `local-setup` directory
* Please take a look at `example/config.js` file, this is an excerpt from there.

```js
...
    connector: {
        options: {
            job: "promclient_job",
            additionalLabels: ["method"]
        },
    },
...
```
#### job
This is to mark the job that needed to be consumed by prometheus, the configuration from prometheus is defined in the `prometheus.yml`, take a look at `local-setup` directory

#### additionalLabels
The additionalLabels that are needed for the metric, the default is label, but you can add as many as you want in the array format.
