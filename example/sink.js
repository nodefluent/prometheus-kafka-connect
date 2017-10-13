"use strict";

const { runSinkConnector, ConverterFactory } = require("./../index.js");
const config = require("./config.js");

console.log("Waiting for message to be consumed...");

const etl = (message, next) => {
  console.log(message);
  return next(null, message);

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
