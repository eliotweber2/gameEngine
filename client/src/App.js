import './App.css';
import SocketConnection from './clientSocketInterface.js';
import {useRef,useEffect} from 'react';

function App() {
  const socket = useRef(null);
  const eventLst = useRef([]);

  function handleMessage(message) {
    const requestCode = message.slice(0,4);
    //const payload = message.slice(5);
    //console.log(requestCode,payload);
    switch (requestCode) {
      case 'NFME': sendState(); break;
      default: break;
    }
  }

  function sendState() {
    const responsePacket = {
      time: Date.now(),
      keyEvents: eventLst.current,
    }
    socket.current.sendData(JSON.stringify(responsePacket),'CLST');
    eventLst.current = [];
  }

  function onKeyDown(event) {
    eventLst.current.push({
      eventData: {key:event.key},
      isRelease: false,
    });
  }

  function onKeyUp(event) {
    eventLst.current.push({
      eventData:{key:event.key},
      isRelease:true,
    });
  }

  useEffect(() => {
    const socketHandler = {};
    socketHandler.handleMessage = handleMessage;
    socket.current = new SocketConnection('ws://localhost:8080');
    socket.current.setHandler(socketHandler);
    //eslint-disable-next-line
  },[]);
  return (<svg width={window.innerWidth} height={window.innerHeight} tabIndex='0' onKeyDown={onKeyDown} onKeyUp={onKeyUp}>

  </svg>);
}

export default App;