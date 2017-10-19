"use strict";

const { runSinkConnector, ConverterFactory } = require("./../index.js");
const config = require("./config.js");

console.log("Waiting for message to be consumed...");

const etl = (message, next) => {

  // Do the transformation here
  let record;

  try {
    record = {
      metric: message.metric,
      value: message.value || 1,
      type: "counter",
      method: message.method
    }
  } catch(err) {
    // DO nothing
  }

  if (record && record.metric && record.value) {
    // Continue with the transformed record
    console.log(message);
    console.log("Processed");
    return next(null, record);
  }

  // Continue without throwing error
  console.log("Not processed");
  return next();

}

const converter = ConverterFactory.createSinkSchemaConverter(null,etl);

runSinkConnector(config, [converter], console.log.bind(console)).then(sink => {

    const exit = (isExit = false) => {
        sink.stop();
        if (!isExit) {
            process.exit();
        }
    };

    process.on("SIGINT", () => {
        exit(false);
    });

    process.on("exit", () => {
        exit(true);
    });
});
