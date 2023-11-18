# tykkipeli-server
*Tykistöjohtajana valttejasi ovat ballistiikkaopit ja nopeus. Huomioi tuuli!*

This is a Node.js server implementation for the Aapeli/Playforia classic cannon game. A slightly modified game client is used.

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
1. Make sure you have Java installed
