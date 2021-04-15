require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const socketIO = require('socket.io');
const PORT = process.env.PORT || 8080;

const server = http.createServer(app);
const io = socketIO(server, {
	timeout: 60000,
	reconnection: true,
	reconnectionDelay: 5000,
	reconnectionDelayMax: 60000,
	cors: {
		origin: '*',
		methods: ['*'],
	},
});

let usersConnected = 0;
io.on('connection', (socket) => {
	usersConnected++;
	console.log('CONECTADO');
	socket.emit('userConnected', usersConnected);
	socket.on('sendMessage', (message) => {
		socket.broadcast.emit('sendNewMessage', message);
	});
	socket.on('disconnect', () => {
		console.log('DESCONECTADO');
	});
});

app.use((err, req, res, next) => {
	if (err) {
		res.status(500).send('OCURRIÓ UN ERROR EN EL SERVIDOR');
		console.log(err.stack);
		return next(err);
	}
});

server.listen(PORT, () => console.log(`CORRIENDO EN ${PORT} ...`));
