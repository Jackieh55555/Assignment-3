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

//websocket stuff
socketIO.on('connection', function(socket) {
    console.log('A player has connected to the game!', LISTEN_PORT);

    socket.on('disconnect', function(data) {
        console.log('Player has disconnected game');
    });

    //custom events
    //socket = one client
    //socketIO.sockets = all clients
    socket.on('red', function(data) {
        console.log('Red event heard');
        socketIO.sockets.emit('color_change', {r:255, g:0, b:0});
    });

    socket.on('orange', function(data) {
        console.log('Orange event heard');
        socketIO.sockets.emit('color_change', {r:255, g:127, b:80});
    });

    socket.on('yellow', function(data) {
        console.log('Yellow event heard');
        socketIO.sockets.emit('color_change', {r:255, g:255, b:0});
    });

    socket.on('green', function(data) {
        console.log('Green event heard');
        socketIO.sockets.emit('color_change', {r:0, g:128, b:0});
    });

    socket.on('blue', function(data) {
        console.log('Blue event heard');
        socketIO.sockets.emit('color_change', {r:0, g:191, b:255});
    });

    socket.on('purple', function(data) {
        console.log('Purple event heard');
        socketIO.sockets.emit('color_change', {r:139, g:0, b:255});
    });

    socket.on('pink', function(data) {
        console.log('Pink event heard');
        socketIO.sockets.emit('color_change', {r:255, g:105, b:180});
    });
});

//finally, start server
server.listen(LISTEN_PORT);
console.log('listening to port: ' + LISTEN_PORT);
