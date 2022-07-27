const mongoose = require('mongoose');

module.exports = {
    init: () => {
        mongoose.connect(process.env.MONGODB).catch(err => console.log(err.reason));

        mongoose.Promise = global.Promise;

        mongoose.connection.on('connected', () => {
            console.log('\n+++ Mongoose connection successfully opened +++');
        });

        mongoose.connection.on('err', err => {
            console.error(`!!! Mongoose connection Error !!! \n ${err.stack}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('!!! Mongoose connection disconnected !!!');
        });
    }
};