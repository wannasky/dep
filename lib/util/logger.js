const fileUtil = require('./fileUtil');
const colors = require('colors');

const logger = {

    file: (path) => {
        console.log(fileUtil.readFileSync(path))
    },

    error: (msg) => {
        console.log(msg.red);
    },

    warn: (msg) =>{
        console.log(msg.yellow);
    },

    info: (msg) => {
        console.log(msg.cyan);
    }

};

module.exports = logger;
