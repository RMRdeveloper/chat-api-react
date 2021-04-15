require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const mongoose = require('mongoose');
const socketIO = require('socket.io');
const Message = require('./models/Message.js');
const PORT = process.env.PORT || 8080;

let readyDB = false;
mongoose
	.connect(
		`mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.w7rpo.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`,
		{
			useNewUrlParser: true,
			useUnifiedTopology: true,
		}
	)
	.then((res) => {
		console.log('CONECTADO A LA DB');
		readyDB = true;
	})
	.catch((err) => {
		console.log('CONEXIÓN FALLIDA');
	});

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

io.on('connection', (socket) => {
	console.log('CONECTADO');
	let timeReadyDB = setInterval(() => {
		if (readyDB === true) {
			socket.emit('dbStatus', true);
			consultMessages();
			clearInterval(timeReadyDB);
		}
	}, 1000);
	const consultMessages = async () => {
		try {
			const messages = await Message.find();
			if (messages.length > 0) {
				socket.emit('receivedMessages', messages);
				socket.emit('executeScroll');
			}
		} catch (error) {
			console.log(error);
		}
	};
	socket.on('sendMessage', async (message) => {
		try {
			const newMessage = await Message.create(
				{
					text: message.text,
				},
				(err, msg) => {
					if (err) {
						return console.log(err);
					} else {
						console.log('MENSAJE ENVIADO');
					}
				}
			);
			const messages = await Message.find();
			socket.emit('receivedMessages', messages);
			socket.broadcast.emit('receivedMessages', messages);
			socket.emit('executeScroll');
		} catch (error) {
			return console.log(error);
		}
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
