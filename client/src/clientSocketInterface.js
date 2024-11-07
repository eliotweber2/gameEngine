class SocketConnection {
    constructor(url,handler={}) {
        this.timeBetweenPings = null;
        //default request code length
        this.reqCodeLength = 4;
        this.url = url;
        this.handler = handler;
        this.shouldReconnect = true;
        this.socket = new WebSocket(this.url);
        this.sessionId = null;
        //wait for connection before trying to sync with server
        this.waitForSocketConnection();
    }

    setHandler(handler) {
        this.handler = handler;
    }

    async waitForSocketConnection() {
        //promise will resolve when socket opens
        const waitForOpen = new Promise((resolve) => {
            this.socket.addEventListener("open",() => resolve());
        });
        await waitForOpen.then(() => this.afterSocketConnect());
    }

    afterSocketConnect() {
        this.pingInterval = null;
        //send id to server if it exists
        this.sessionId == null? this.socket.send('NOID') : this.socket.send('HSID ' + this.sessionId);
        //request ping interval and code length
        this.socket.send('RQPC');
        this.socket.addEventListener("close", () => this.handleClose());
        this.socket.addEventListener("message", (message) => this.handleMessage(message.data));
    }

    handleClose() {
        console.log('Connection with server has stopped.');
        if (this.shouldReconnect) {
            console.log('Attempting to reconnect...');
            this.setUpSocketConnection(this.url);
        }
    }

    on(event,callback) {
        this.socket.addEventListener(event,callback);
    }

    //accessible by user
    sendData(data,code=null) {
        if (code != null) {this.socket.send('SVRQ ' + code + ' ' + data)} else {this.socket.send('SVRQ ' + data)}
    }

    handleMessage(message) {
        message = message.toString();
        //get message id
        const messageId = message.slice(message.indexOf('|')+1);
        //remove id from message
        message = message.slice(0,message.length-messageId.length-1);
        //separate rest of message
        const requestCode = message.slice(0,this.reqCodeLength);
        const payload = message.slice(this.reqCodeLength+1);
        //acknowledge message
        this.socket.send('ACKD ' + parseInt(messageId));
        switch (requestCode) {
            case 'PONG': this.pingInterval = setTimeout(() => this.socket.send('PING'), this.timeBetweenPings); break;
            case 'SNID': this.sessionId = payload; break;
            case 'SVRS': this.handleServerResponse(payload); break;
            case 'INPT': this.timeBetweenPings = parseInt(payload); this.pingInterval = setTimeout(() => this.socket.send('PING'), this.timeBetweenPings); break;
            case 'INCL': this.reqCodeLength = parseInt(payload); break;

            default: console.log(`WARNING: Server has sent the incorrect request ${message} with request code ${requestCode}`); break;
        }
    }

    handleServerResponse(message) {
        if (!('handleMessage' in this.handler)) {
            console.log(`WARNING: Handler does not have the handleMessage method, the server cannot communicate with it. The message was ${message}`);
        } else {this.handler.handleMessage(message)}
    }

    close() {
        console.log('Closing socket');
        this.shouldReconnect = false;
        this.socket.send('CLSE');
    }
}

export default SocketConnection;