const mongoose = require('mongoose');

const MessageSchema = mongoose.Schema({
	text: {
		type: String,
		required: [true, 'Ingrese un mensaje'],
	},
	received: {
		type: Boolean,
		default: false,
	},
});

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;
