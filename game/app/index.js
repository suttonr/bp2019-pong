/// REMOTE CONTROLLER SOCKET OVERRIDE /////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// const ALT_SOCKET = null; // no remote server
const ALT_SOCKET = 'ws://192.168.2.221'; // socketserver is not localhost
const ALT_SOCKET_ON = true;
const DBG = false;

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const GAME = require('./game');
const AUDIO = require('./audio');

/// CONSTANTS and GLOBALS /////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// drawing surfaces
let m_canvas, m_ctx;
let m_keystate;
// socket connections
const m_socket_url = ALT_SOCKET_ON ? ALT_SOCKET : `ws://${location.hostname}`;
const m_socket_port = 8080;
let m_socket;
// module-wide shared constants
const { WIDTH, HEIGHT } = require('./constants');

/// GAME CONTROLLER ///////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/ Initialize Game Playfields and keyboard inputs, and connect to server
/*/
function BootSystem() {
  // create, initiate and append game canvas
  m_canvas = document.createElement('canvas');
  m_canvas.width = WIDTH;
  m_canvas.height = HEIGHT;
  m_ctx = m_canvas.getContext('2d');
  document.body.appendChild(m_canvas);

  // keep track of keyboard presses
  m_keystate = {};
  document.addEventListener('keydown', function(evt) {
    m_keystate[evt.keyCode] = true;
    GAME.SetInputs(m_keystate);
  });
  document.addEventListener('keyup', function(evt) {
    delete m_keystate[evt.keyCode];
    GAME.SetInputs(m_keystate);
  });
  // create socket connection to server
  const endpoint = `${m_socket_url}:${m_socket_port}`;
  console.log(`boot: connecting to socket ${endpoint}`);
  m_socket = new WebSocket(endpoint);
  // case 1: run game on successful connection
  m_socket.onopen = () => {
    // replace alert with 'user must click to enable audio'
    AUDIO.ClickToEnable(m_canvas);
    // initialize the game
    Send({ info: 'test client->server connection' });
    InitGame();
    StepGame();
  };
  // case 2: server isn't running, so alert and retry
  m_socket.onerror = error => {
    console.log(`WebSocket error:`, error);
  };
  /***************************************************************************\
    case 3: received a control from server
    we're expecting JSON data from the socket server with the properties
    id or value
  \***************************************************************************/
  m_socket.onmessage = e => {
    const msg = e.data;
    const fchar = msg.charAt(0);
    // support two protocols NON-JSON or JSON
    // first non-JSON
    if (fchar !== '{') {
      let id = fchar;
      let value = Number.parseInt(msg.substring(1));
      if (!isNaN(value)) {
        if (DBG) console.log('RAW', id, value);
        GAME.SetInputs(id, value);
      }
      return;
    }
    // if got this far, hopefully JSON
    let { id, value } = JSON.parse(msg);
    if (!isNaN(value)) {
      if (DBG) console.log('JSON', id, value);
      GAME.SetInputs(id, value);
    }
  };
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function Send(pktObj) {
  if (m_socket) {
    const json = JSON.stringify(pktObj);
    console.log('SOCKET SEND', json);
    m_socket.send(json);
  }
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/ Initialize game data structures
/*/
function InitGame() {
  // initiate data structures
  GAME.Init();
  // initiate runtime
  GAME.Start();
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/ Start game loop
/*/
function StepGame() {
  GAME.Update();
  GAME.Draw(m_ctx);
  window.requestAnimationFrame(StepGame, m_canvas);
}

/// DEV: LIVE RELOADING ///////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
if (module.hot) {
  // warn server that client is reloading
  module.hot.dispose(function() {
    Send({ info: 'client reloaded' });
  });
  // reload the entire page to keep multiple
  // index.js instances from running until
  // code is completely modularized
  module.hot.accept(function() {
    setTimeout(() => {
      window.location.reload();
    });
  });
}

/// START THE GAME ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
BootSystem();
