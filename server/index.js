const express = require('express');
const {Nuxt, Builder} = require('nuxt');
const app = express();
const admin = require('firebase-admin');
const config = require('../nuxt.config.js');
config.dev = !(process.env.NODE_ENV === 'production');


// let static middleware do its job
app.use(express.static(__dirname + '/public'));


async function start() {

    const nuxt = new Nuxt(config);

    const {
        host = 'http://localhost',
        port = process.env.PORT || 3000
    } = nuxt.options.server;

    if (config.dev) {
        const builder = new Builder(nuxt);
        await builder.build()
    }

    app.use(nuxt.render);

    let server = app.listen(port, host);
    console.log('Server listening on http://' + host + ':' + port); // eslint-disable-line no-console

    socketStart(server);
    console.log('Socket.IO starts')
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
            application.users--
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
