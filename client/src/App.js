import './App.css';
import SocketConnection from './clientSocketInterface.js';
import {useRef,useState,useEffect} from 'react';

function App() {
  const socket = useRef(null);
  const eventLst = useRef([]);
  const svgRef = useRef(null);
  const [elementLst,setElementLst] = useState([]);

  function handleMessage(message) {
    const requestCode = message.slice(0,4);
    const payload = message.slice(5);
    switch (requestCode) {
      case 'NFME': setElementLst(JSON.parse(payload)); sendState(); break;
      default: break;
    }
  }

  function sendState() {
    //close connection if 'z' is pressed
    if (eventLst.current.filter(x => x.type === 'key' && x.eventData.key === 'z').length > 0) {
      socket.current.close();
    }
    //construct packet
    const responsePacket = {
      time: Date.now(),
      events: eventLst.current,
    }
    //send packet and reset event list
    socket.current.sendData(JSON.stringify(responsePacket),'CLST');
    eventLst.current = [];
  }

  function genComp(element) {
    //generate component based on element type
    const eleLst = [];
    switch (element.type) {
      case 'button':
        const button = (<button x={element.data.renderOps.x}
          y={element.data.renderOps.y}
          key={element.data.renderOps.name}
          style={{width:70,height:50}}
          onClick={() => onMouseClick(element.data.renderOps.name)}
          >{element.data.renderOps.text}</button>);
        eleLst.push(button); 
        break;
      case 'polygon':
        eleLst.push(...genPts(element.data.vertices).concat(genLines(element.data.vertices))); break;
      case 'textbox':
        eleLst.push(<p key={element.data.renderOps.name}>{element.data.renderOps.text}</p>);
        break;
      case 'circle':
        eleLst.push(<circle cx={element.data.center.x} cy={element.data.center.y} r={element.data.radius} key={element.data.renderOps.name}/>); break;
      default:
        console.log(`Invalid element type for element ${element} and type ${element.type}`);
    }
    return eleLst;
  }

  function onMouseClick(name) {
    eventLst.current.push({
      eventData: {name:name},
      type: 'mouse',
    });
  }

  function onKeyDown(event) {
    eventLst.current.push({
      eventData: {key:event.key},
      isRelease: false,
      type:'key',
    });
  }

  function onKeyUp(event) {
    eventLst.current.push({
      eventData:{key:event.key},
      isRelease:true,
      type:'key',
    });
  }

  //on page load
  useEffect(() => {
    const socketHandler = {};
    socketHandler.handleMessage = handleMessage;
    socket.current = new SocketConnection('ws://localhost:8080');
    socket.current.setHandler(socketHandler);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    svgRef.current.focus();
    //eslint-disable-next-line
  },[]);

  //all elements except buttons are rendered in the one svg element, all the buttons are rendered in the wrapping div
  return (
  <div style={{position:'relative'}} ref={svgRef}>
    {elementLst.filter(x => !x.data.renderOps.svgRender).map(element => genComp(element))}
    <svg width={window.innerWidth} height={window.innerHeight} tabIndex='0' onKeyDown={onKeyDown} onKeyUp={onKeyUp}>
      {elementLst.filter(x => x.data.renderOps.svgRender).map(element => genComp(element))}
    </svg>
  </div>);
}

//gen pts of polygon
function genPts(points) {
  let newPtLst = [];
  if (points.length > 0) {
    newPtLst = points.map((pt,ind) => {
      return <Point pt={pt} key={ind + 'pt'} />
    });
  }
  return newPtLst;
}

//gen lines of polygon
function genLines(pts) {
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