"use strict";

const { runSinkConnector, ConverterFactory } = require("./../index.js");
const config = require("./config.js");

console.log("Waiting for message to be consumed...");

const etl = (message, next) => {
  let record;
  console.log(message);

  return next(null, message);
  // Do the transformation here

  // if (record && record.metric && record.value) {
  //   // Continue with the transformed record
  //   console.log(message);
  //   console.log("Processed");
  // }
  //
  // // Continue without throwing error
  // console.log("Not processed");
  // return next();

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
