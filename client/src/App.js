import './App.css';
import SocketConnection from './clientSocketInterface.js';
import {useRef,useEffect} from 'react';

function App() {
  const socket = useRef(null);

  function handleMessage(message) {
    const requestCode = message.slice(0,4);
    const payload = message.slice(5);
    console.log(requestCode,payload);
  }

  function onKeyDown(event) {
    
  }

  useEffect(() => {
    const socketHandler = {};
    socketHandler.handleMessage = handleMessage;
    socket.current = new SocketConnection('ws://localhost:8080');
    socket.current.setHandler(socketHandler);
  },[]);

  return (<svg tabIndex='0'>

  </svg>);
}

export default App;