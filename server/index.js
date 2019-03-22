const admin = require('firebase-admin');
const express = require('express');
const consola = require('consola');
const {Nuxt, Builder} = require('nuxt');
const app = express();

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js');
config.dev = !(process.env.NODE_ENV === 'production');

async function start() {
    // Init Nuxt.js
    const nuxt = new Nuxt(config);

    const {host, port} = nuxt.options.server;

    // Build only in dev mode
    if (config.dev) {
        const builder = new Builder(nuxt);
        await builder.build();
    } else {
        await nuxt.ready();
    }

    // Give nuxt middleware to express
    app.use(nuxt.render);

    // Listen the server
    const server = app.listen(port, host);
    consola.ready({
        message: `Server listening on http://${host}:${port}`,
        badge: true
    });

    socketStart(server);
    console.log('Socket.IO starts');
}

function socketStart(server) {

    const application = {
        users: 0,
        list: [],
        suggestList: [],
    };

    const serviceAccount = require('./firebase.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: 'https://list-37525.firebaseio.com'
    });

    const db = admin.database();
    const listRef = db.ref("list");
    const suggestListRef = db.ref("suggest");

    const io = require('socket.io').listen(server);

    io.on('connection', socket => {

        console.log(socket.handshake.address);

        application.users++;

        socket.on('disconnect', () => {
            application.users--;
        });

        listRef.on('value', data => {
            application.list = data.val();
            io.emit('get-messages', application.list);
        });

        suggestListRef.on('value', data => {
            application.suggestList = data.val();
            io.emit('get-suggest', application.suggestList);
        });

        socket.on('send-message', message => {
            listRef.push(message).then(() => {
                io.emit('get-messages', application.list);
            });

            if (application.suggestList[message]) return;

            suggestListRef.child(message).set({value: message}).then(() => {
                io.emit('get-suggest', application.suggestList);
            });
        });

        socket.on('remove-message', deletedItem => {
            listRef.child(deletedItem).remove().then(() => {
                io.emit('get-messages', application.list);
            });
        });

    });
}

start();
