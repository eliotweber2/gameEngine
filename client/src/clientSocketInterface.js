function promiseFromEvent(eventTarget,eventName) {
    return new Promise((resolve) => {
        const handleEvent = () => {
            eventTarget.removeEventListener(eventName, handleEvent);
            resolve();
        };

        eventTarget.addEventListener(eventName,handleEvent);
    })
}

function ping(client) {
    client.socket.send('PING');
}

function afterSocketConnect(client) {
    client.pingInterval = null;
    client.sessionId == null? client.socket.send('NOID') : client.socket.send('HSID ' + client.sessionId);
    client.socket.send('RQPC');
    client.socket.addEventListener("close", () => client.handleClose());
    client.socket.addEventListener("message", (message) => client.handleMessage(message.data));
}

class SocketConnection {
    constructor(url,handler={foo:'bar'}) {
        this.timeBetweenPings = null;
        this.reqCodeLength = 4;
        this.url = url;
        this.handler = handler;
        this.shouldReconnect = true;
        this.setUpSocketConnection(this.url);
        this.sessionId = null;
    }

    setUpSocketConnection(url) {
        
        this.socket = new WebSocket(url);
        this.waitForSocketConnection(this.socket,afterSocketConnect);
        
    }

    setHandler(handler) {
        this.handler = handler;
    }

    async waitForSocketConnection(socket,callback) {
        await promiseFromEvent(socket,"open").then(() => callback(this));
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

    sendData(data,code=null) {
        if (code != null) {this.socket.send('SVRQ ' + code + ' ' + data)} else {this.socket.send('SVRQ ' + data)}
    }

    handleMessage(message) {
        message = message.toString();
        const messageId = message.slice(message.indexOf('|')+1);
        message = message.slice(0,message.length-messageId.length-1);
        const requestCode = message.slice(0,this.reqCodeLength);
        const payload = message.slice(this.reqCodeLength+1);
        this.socket.send('ACKD ' + parseInt(messageId));
        switch (requestCode) {
            case 'PONG': this.pingInterval = setTimeout(() => ping(this), this.timeBetweenPings); break;
            case 'SNID': this.sessionId = payload; break;
            case 'SVRS': this.handleServerResponse(payload); break;
            case 'INPT': this.timeBetweenPings = parseInt(payload); this.pingInterval = setTimeout(() => ping(this), this.timeBetweenPings); break;
            case 'INCL': this.reqCodeLength = parseInt(payload); break;

            default: console.log(`WARNING: Server has sent the incorrect request ${message} with request code ${requestCode}`); break;
        }
    }

    handleServerResponse(message) {
        if (!('handleMessage' in this.handler)) {
            console.log(`WARNING: Handler does not have the handleMessage method, the server cannot communicate with it. The message was ${message}`);
        } else {this.handler.handleMessage(message)}
    }

    stop() {
        console.log('Closing socket');
        this.socket.send('CLSE');
    }

    preventReconnect() {this.shouldReconnect = false}
}

export default SocketConnection;