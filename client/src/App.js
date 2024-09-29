import './App.css';
import SocketConnection from './clientSocketInterface.js';
import {useRef,useState,useEffect} from 'react';

function App() {
  const socket = useRef(null);
  const eventLst = useRef([]);
  const [ptLst,setPtLst] = useState([]);

  function handleMessage(message) {
    const requestCode = message.slice(0,4);
    const payload = message.slice(5);
    //console.log(requestCode,payload);
    switch (requestCode) {
      case 'NFME': setPtLst(JSON.parse(payload)); sendState(); break;
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
  return (
  <svg width={window.innerWidth} height={window.innerHeight} tabIndex='0' onKeyDown={onKeyDown} onKeyUp={onKeyUp}>
    {ptLst.map(shape => genShape(shape))}
  </svg>);
}

function genShape(points) {
  return genPts(points).concat(genRectLines(points));
}

function genPts(points) {
  let newPtLst = [];
  if (points.length > 0) {
    newPtLst = points.map((pt,ind) => {
      return <Point pt={pt} key={ind + 'pt'} />
    });
  }
  return newPtLst;
}

function genRectLines(pts) {
  if (pts.length < 2) {return []}
  let lineLst = [];
  for (let i = 0; i < pts.length-1; i++) {
    lineLst.push(<Line pt1={pts[i]} pt2={pts[i+1]} key={i + 'ln'}/>);
  }
  lineLst.push(<Line pt1={pts[0]} pt2={pts[pts.length-1]} key={pts.length-1 + 'ln'}/>);
  return lineLst;
}

function Point (props) {
  return <circle cx={props.pt.x} cy={props.pt.y} r="5" />
}

function Line({pt1,pt2}) {
  return <line x1={pt1.x} y1={pt1.y} x2={pt2.x} y2={pt2.y} strokeWidth='3' stroke='red'/>
}
export default App;