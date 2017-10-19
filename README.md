# prometheus-kafka-connect

Connector to prometheus client which only includes sink. This will be useful to stream data from Kafka to Prometheus and subsequently to Grafana. This connector depends on, [kafka-connect]() and [node-sinek]() as the consumer. You can use javascript consumer or native which depends on [librdkafka]().

The example can be found in `example` directory, which there is a comment to specify where you need to do the transformation. Basically, you need to do that in ETL function, that needs to be passed to the connector. Or just like the following.

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
