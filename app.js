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

app.get('/competitive', function(req,res) {
    res.sendFile(__dirname + '/public/competitive.html');
});


// Array for available Colors, playerId, player selected Color, etc
let nextPlayerId = 0;
let numberPlayersInGame = 0;
let playerId = {};
let playerColor = {};

let numberCompetitivePlayersInGame = 0;
let competitivePlayerId = {};

let Colors = {
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
let mixedColor = {r:255, r:255, r:255};


//websocket stuff
socketIO.on('connection', function(socket) {
    nextPlayerId++;
    numberPlayersInGame++;
    playerId[socket.id] = nextPlayerId;
    socket.emit('player_id', playerId[socket.id]);
    console.log('player#' + playerId[socket.id] + ' (socket.id=' + socket.id + ') has joined the game! => Total=' + numberPlayersInGame);
    console.log(playerId);

    socket.on('disconnect', function(data) {
        numberPlayersInGame--;
        console.log('player#' + playerId[socket.id] + ' (socket.id=' + socket.id + ') has left the game! => Total=' + numberPlayersInGame);
        delete playerId[socket.id];
        delete playerColor[socket.id];
        console.log(playerId);
    });


    //custom events
    //socket = one client
    //socketIO.sockets = all clients

    socket.on('color_selected', function(data) {
        console.log('collaborate: player#' + playerId[socket.id] + ' selected Color ' + data);
        playerColor[socket.id] = Colors[data];
        console.log('# of players selected Colors are: ' + Object.keys(playerColor).length)
        console.log(playerColor);

        //Mixing Colors from Colors selected by all players 
        let r = 0;
        let g = 0;
        let b = 0;
        let numColorsToMix = 0;

        const list = Object.keys(playerColor);
        list.forEach(player => {
            r = r + playerColor[player].r;
            g = g + playerColor[player].g;
            b = b + playerColor[player].b;
            numColorsToMix++;
        });
        console.log('Sum of Colors (' + numColorsToMix + '): r=' + r + ', g=' + g + ', b=' + b);
        
        r = parseInt(r / numColorsToMix);
        g = parseInt(g / numColorsToMix);
        b = parseInt(b / numColorsToMix);
        console.log('Mixed Color   (' + numColorsToMix + '): r=' + r + ', g=' + g + ', b=' + b);

        //Send to all players
        socketIO.sockets.emit('Color_change', {r, g, b});
        socketIO.sockets.emit('players_count', numColorsToMix);
    });

    // Competitive section:
    socket.on('color_selected_competitive', function(data) {
        console.log('competitive: player#' + competitivePlayerId[socket.id] + ' selected Color ' + data);
        //playerColor[socket.id] = Colors[data];
        //console.log('# of players selected Colors are: ' + Object.keys(playerColor).length)
        //console.log(playerColor);
 
        //Send to all players
        //socketIO.sockets.emit('Color_change', {r, g, b});
        //socketIO.sockets.emit('players_count', numColorsToMix);
    });

    socket.on('competitive_game', function(data) {
        if (data == 'join') {
            competitivePlayerId[socket.id] = playerId[socket.id];
            numberCompetitivePlayersInGame++;
            console.log('player#' + competitivePlayerId[socket.id] + ' (socket.id=' + socket.id + ') has joined the competitive game! => Total=' + numberCompetitivePlayersInGame);
            console.log(competitivePlayerId);        
            socketIO.sockets.emit('players_count', numberCompetitivePlayersInGame);
        } else if (data == 'start') {
            console.log('player#' + competitivePlayerId[socket.id] + ' (socket.id=' + socket.id + ') has started the competitive game! => Total=' + numberCompetitivePlayersInGame);
            console.log(competitivePlayerId);
            socketIO.sockets.emit('players_count', numberCompetitivePlayersInGame);     
        }
    });
});

//finally, start server
server.listen(LISTEN_PORT);
console.log('listening to port: ' + LISTEN_PORT);
