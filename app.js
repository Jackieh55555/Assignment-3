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

app.get('/controller', function(req,res) {
    res.sendFile(__dirname + '/public/controller.html');
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
    pink:   {r:255, g:105, b:180}
};


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
        socketIO.sockets.emit('color_change', colours[data]);
    });

    socket.on('red', function(data) {
        //console.log('Red event heard');
        console.log('Red event heard from player#' + playerId[socket.id]);
        playerColour[socket.id] = {r:255, g:0, b:0};
        console.log(playerColour);
        socketIO.sockets.emit('color_change', {r:255, g:0, b:0});
    });

    socket.on('orange', function(data) {
        //console.log('Orange event heard');
        console.log('Orange event heard from player#' + playerId[socket.id]);
        playerColour[socket.id] = {r:255, g:127, b:80};
        socketIO.sockets.emit('color_change', {r:255, g:127, b:80});
    });

    socket.on('yellow', function(data) {
        //console.log('Yellow event heard');
        console.log('Yellow event heard from player#' + playerId[socket.id]);
        playerColour[socket.id] = {r:255, g:255, b:0};
        console.log(playerColour);
        socketIO.sockets.emit('color_change', {r:255, g:255, b:0});
    });

    socket.on('green', function(data) {
        //console.log('Green event heard');
        console.log('Green event heard from player#' + playerId[socket.id]);
        playerColour[socket.id] = {r:0, g:128, b:0};
        console.log(playerColour);
        socketIO.sockets.emit('color_change', {r:0, g:128, b:0});
    });

    socket.on('blue', function(data) {
        //console.log('Blue event heard');
        console.log('Blue event heard from player#' + playerId[socket.id]);
        playerColour[socket.id] = {r:0, g:191, b:255};
        console.log(playerColour);
        socketIO.sockets.emit('color_change', {r:0, g:191, b:255});
    });

    socket.on('purple', function(data) {
        //console.log('Purple event heard');
        console.log('Purple event heard from player#' + playerId[socket.id]);
        playerColour[socket.id] = {r:139, g:0, b:255};
        console.log(playerColour);
        socketIO.sockets.emit('color_change', {r:139, g:0, b:255});
    });

    socket.on('pink', function(data) {
        //console.log('Pink event heard');
        console.log('Pink event heard from player#' + playerId[socket.id]);
        playerColour[socket.id] = {r:255, g:105, b:180};
        console.log(playerColour);
        socketIO.sockets.emit('color_change', {r:255, g:105, b:180});
    });

});

//finally, start server
server.listen(LISTEN_PORT);
console.log('listening to port: ' + LISTEN_PORT);
