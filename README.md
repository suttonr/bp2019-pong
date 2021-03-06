## BP2019 Jupiter Hall Pong Exhibit

This is a PONG game that can be controlled via the serial port connection by connected Arduinos. The Pong game is written in Javascript, using a NodeJS server for serial communication to the Arduino. The NodeJS server provides a websocket connection for the client Pong game running in a web browser, and receives JSON controller data. 

Many game and display parameters can be set by modifying `constants.js`. 

### First Time Installation

Here's a **demo installation video**:

[![](http://img.youtube.com/vi/POdXbry-Qc4/0.jpg)](http://www.youtube.com/watch?v=POdXbry-Qc4 "Installation Demo")

#### Prerequisites to install

Note: these instructions presume you are using a Unix-y system like Linux or MacOS. These instructions are tested on MacOS Mojave. You *CAN* [run on Windows 10 WSL or via Scoop](https://github.com/daveseah/bp2019-pong/wiki/Installing-on-Windows), but the serial port commands currently don't work.

You will need to have **NodeJS** and **Git** installed. To program the Arduino board, you'll need the **Arduino IDE** but the client/server will run without connected hardware.

#### Setup

Get the Repo:

- open a terminal window
- cd to the folder you want to store the repo
- `git clone git@github.com:daveseah/bp2019-pong.git`
- `cd bp2019-pong/game`

Configure the web client software:

- `npm ci`
- if you are using nvm, type `nvm use`

### Run the Game Server

HARDWARE CONFIGURATION

If you have functioning hardware, you can change the source code to match your Arduino configuration. The game server will gracefully fail if no hardware is detected. The following instructions assume you have working hardware.

Program your Arduino with the contents of `arduino/serial-encoder` with the Arduino IDE if you haven't already, then modify the server code:

- Make sure you are in the `bp2019-pong/game` directory
- In the terminal, `npm run list:ports` to see the list of available serial ports (note: this code **does not work on Windows** using either WSL or Scoop)
- Find the _serial port path_ for your arduino board and copy it to the clipboard.
- Edit `server/serial.js` in the `CONFIG` section at top, adding `COM1` and `COM2` paths to your serial ports. 

Now to run the SERVER itself:

- Open terminal window, and make sure you are in the `bp2019-pong/game` directory
- `npm run server`
- You will see some text appear describing what the server is doing. If you have compatible hardware plugged into the USB port and you have configured `server/serial.js`, you should see a successful connection message.
- Next you will run the Game Client to see if the data is being received

### Run the Game Client

Open a SECOND TERMINAL WINDOW, then:

- Make sure you are in the `bp2019-pong/game` directory
- `npm run client`
- Open Chrome and browse to `localhost:3000`
- Twiddle the encoder knob to see if the paddle moves
- Click on the play field to enable sound (this is a browser-enforced requirement)

The game runs in an attract mode, AI players that take turns beating each other. If an Arduino paddle controller is moved, however, it will take over the player. When a player reachers 9 points, the game is over and the player reverts to AI control unless the Arduino paddle is again moved.

#### Operating Notes

* To enter FULL SCREEN MODE, go to the Chrome browser's VIEW MENU and disable _Always Show Toolbar_ and _Always Show Bookmarks_, then choose _Full Screen Mode_. The MacOS shortcut for full screen mode is `CTRL-CMD-F`.
* You can change the screen size by editing `game/constants.js` and adjusting the WIDTH and HEIGHT. The game board and elements sizes are defined relative to WIDTH and HEIGHT.
