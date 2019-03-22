const express   = require('express');
const app       = express();
const http      = require('http');
const server    = http.createServer(app);
const socketIO  = require('socket.io')(server); //hello I am new

const LISTEN_PORT = 8080; //make sure greater than 3000. Some ports are reserved/blocked by firewall ...

app.use((express.static(__dirname + '/public'))); //set root dir to the public folder

//routes
app.get('/color', function(req,res) {
    res.sendFile(__dirname + '/public/color.html');
});

app.get('/collaborate', function(req,res) {
    res.sendFile(__dirname + '/public/collaborate.html');
});


// Array for available colours, playerId, player selected colour, etc
let nextPlayerId = 0;
let numberPlayersInGame = 0;

let playerId = {};
let playerColour = {};

let colours = {
    red:    {r:255, g:0,   b:0  },
    orange: {r:255, g:127, b:80 },
    yellow: {r:255, g:255, b:0  },
    green:  {r:0,   g:128, b:0  },
    blue:   {r:0,   g:191, b:255},
    purple: {r:139, g:0,   b:255},
    pink:   {r:255, g:105, b:180},
    black:  {r:0,   g:0,   b:0  },
    white:  {r:255, g:255, b:255}
};
let mixedColour = {r:255, r:255, r:255};


//websocket stuff
socketIO.on('connection', function(socket) {
    nextPlayerId++;
    numberPlayersInGame++;
    playerId[socket.id] = nextPlayerId;
    console.log('player#' + playerId[socket.id] + ' (socket.id=' + socket.id + ') has joined the game! => Total=' + numberPlayersInGame);
    console.log(playerId);

    socket.on('disconnect', function(data) {
        numberPlayersInGame--;
        console.log('player#' + playerId[socket.id] + ' (socket.id=' + socket.id + ') has left the game! => Total=' + numberPlayersInGame);
        delete playerId[socket.id];
        delete playerColour[socket.id];
        console.log(playerId);
    });


    //custom events
    //socket = one client
    //socketIO.sockets = all clients

    socket.on('colour_selected', function(data) {
        console.log('player#' + playerId[socket.id] + ' selected colour ' + data);
        playerColour[socket.id] = colours[data];
        console.log('# of players selected colours are: ' + Object.keys(playerColour).length)
        console.log(playerColour);

        //Mixing colors from colors selected by all players 
        let r = 0;
        let g = 0;
        let b = 0;
        let numColoursToMix = 0;

        const list = Object.keys(playerColour);
        list.forEach(player => {
            r = r + playerColour[player].r;
            g = g + playerColour[player].g;
            b = b + playerColour[player].b;
            numColoursToMix++;
        });
        console.log('Sum of colors: r=' + r + ', g=' + g + ', b=' + b);
        
        r = parseInt(r / numColoursToMix);
        g = parseInt(g / numColoursToMix);
        b = parseInt(b / numColoursToMix);
        console.log('Mixed color:   r=' + r + ', g=' + g + ', b=' + b);
        socketIO.sockets.emit('color_change', {r, g, b});
    });

});

//finally, start server
server.listen(LISTEN_PORT);
console.log('listening to port: ' + LISTEN_PORT);
