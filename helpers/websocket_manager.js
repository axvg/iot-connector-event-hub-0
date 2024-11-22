const app_constants = require('../app_constants');
const WebSocket = require('ws');

class WSManager {
    constructor() {
        this.endpoint = app_constants.WsDeviceRouter.URL;
        this.token = app_constants.WsDeviceRouter.WS_API_KEY;
        this.wsUrl = this.endpoint + this.token;
        this.socket = new WebSocket(this.wsUrl);
        this.isConnected = false;

        this.socket.on('open', () => {
            console.log('Connected... :)');
            this.isConnected = true;
        });

        this.socket.on('message', (data) => {
            // Do nothing for now.
            console.log(`message received ${data}`);
        });

        this.socket.on('close', () => {
            console.log('Disconnected :(');
            this.isConnected = false;
        });

        this.socket.on('error',  (listener) => {
            console.log('Connection Error :(');
        });
    }

    connect() {
        this.socket = new WebSocket(this.wsUrl);
    }

    subscribe(channelName){
        this.socket.send(`subscribe:${channelName}`);
    }

    unsubscribe(channelName){
        this.socket.send(`unsubscribe:${channelName}`);
    }

    send(channelName, messageString){
        this.socket.send(`${channelName}:${messageString}`);
    }

}



module.exports = {
    WSManager
};