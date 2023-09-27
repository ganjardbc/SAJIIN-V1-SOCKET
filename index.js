'use strict';

const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const bodyParser = require('body-parser');
const INDEX = '/index.html';

const routes = require('./utils/routes');
const config = require('./utils/config');

class Server {
    constructor () {
        this.port = process.env.PORT || 8082;
        this.host = 'localhost';

        this.app = express();

        this.http = this.app
            .use((req, res) => {
                res.sendFile(INDEX, { root: __dirname })
            })
            .listen(this.port, () => {
                console.log(`Listening on *:${this.port}`)
            });

        this.socket = socketio(this.http, { 
            cors: { 
                origin: '*' 
            } 
        });
    }

    appConfig () {
        this.app.use(
            bodyParser.json()
        );
        new config(this.app);
    }

    includeRoutes () {
        new routes(this.app, this.socket).routesConfig();
    }

    appExecute () {
        this.appConfig();
        this.includeRoutes();
        this.http;
    }
}

const app = new Server();
app.appExecute();