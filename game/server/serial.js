const CONFIG = {
  SRI: { COM1: '/dev/tty.usbmodem14201', COM2: '', BAUDRATE: 115200 },
  EXHIBIT: { COM1: '/dev/ttyUSB0',COM2:'/dev/ttyUSB1', BAUDRATE: 115200 }
};

const DBG = false;

// select configuration
const { COM1, COM2, INPUT_SCALE, BAUDRATE } = CONFIG['SRI'];

// libraries
const WebSocket = require('ws');
const ArduinoPaddle = require('./arduino-paddle');
const IP = require('ip');

// communication
let SERIAL_P1 = null;
let SERIAL_P2 = null;
let CLIENT_SOCKETS = {};
let CLIENT_ID_COUNTER = 0;

// greeting
console.log('SERVER ! STARTING');

// Initialize Communications
if (COM1) {
  SERIAL_P1 = new ArduinoPaddle(COM1, BAUDRATE);
  SERIAL_P1.Connect(m_SendPaddleJSON);
}
if (COM2) {
  SERIAL_P2 = new ArduinoPaddle(COM2, BAUDRATE);
  SERIAL_P2.Connect(m_SendPaddleJSON);
}
// send to all clients
function m_SendPaddleJSON(input) {
  if (DBG) console.log('JSON', input);
  Object.keys(CLIENT_SOCKETS).forEach(key => {
    CLIENT_SOCKETS[key].send(JSON.stringify(input));
  });
}
function m_SendPaddleRAW(rawinput) {
  if (DBG) console.log('RAW', rawinput);
  Object.keys(CLIENT_SOCKETS).forEach(key => {
    CLIENT_SOCKETS[key].send(rawinput);
  });
}

// configure websocket
const WSS = new WebSocket.Server({ port: 8080 });
//
WSS.on('connection', ws => {
  ws.id = ++CLIENT_ID_COUNTER;
  CLIENT_SOCKETS[ws.id] = ws;
  // if got this far, we can save our socket connection and bind serial ports
  console.log(`SOCKET + CONNECTED ${ws.id}`);
  // tell client that they've connected
  ws.send(JSON.stringify({ info: 'SERVER:CONNECTED', sid: ws.id }));

  // socket handlers
  ws.on('message', json => {
    if (json.charAt(0) !== '{') {
      console.warn('SOCKET ! Received malformed JSON', json);
      return;
    }
    console.log(`SOCKET ! ${ws.id} sent ${json}`);
  });
  //
  ws.on('close', () => {
    let id = ws.id;
    if (id) {
      delete CLIENT_SOCKETS[ws.id];
      console.log(`SOCKET - DISCONNECTED ${ws.id}`);
    }
  });
});
//

console.log('SERVER ! WEBSOCKET SERVICE on 8080');
console.log(`\n****** ! OPEN 'http://${IP.address()}:3000' in CHROME BROWSER\n`);
