# tykkipeli-server
*Tykistöjohtajana valttejasi ovat ballistiikkaopit ja nopeus. Huomioi tuuli!*

This is a Node.js server implementation for the Aapeli/Playforia classic cannon game. A slightly modified game client (build can be found under releases) is used.

[DB Diagram](https://dbdiagram.io/d/61334090825b5b0146f2ccec)

## How to play

### Running the server
1. Clone the repository  
   `git clone https://github.com/ounai/tykkipeli-server.git && cd tykkipeli-server`
3. Install dependencies  
   `npm i`
5. Run the server  
   `npm start`

By default the server will listen to incoming connections on `localhost:4242`, this can be changed with environment variables:  
`ACANNONS_IP=<ip> ACANNONS_PORT=<port> npm start`

### Running the client
1. Make sure you have Java installed.
2. Download the client from [releases](https://github.com/ounai/tykkipeli-server/releases).
3. Unzip and run the client.
4. Type nickname and server IP (e.g. xx.xx.xx.xx:<port>) to the launcher.
   - If no port is given (e.g. xx.xx.xx.xx), the port will default to 4242.
   - Leaving the IP field blank will default to `localhost:4242`.
   - Leaving the nickname field blank (or giving a nickname that is already in use) will default to an anonymous nickname.
6. Click "Go" to launch to game, it will connect to a server running on the given IP.
