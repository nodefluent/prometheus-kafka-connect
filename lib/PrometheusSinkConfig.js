"use strict";

const {SinkConfig} = require("kafka-connect");

class PrometheusSinkConfig extends SinkConfig {

    constructor(...args){ super(...args); }

    run(){
        return super.run();
    }
}

module.exports = PrometheusSinkConfig;
