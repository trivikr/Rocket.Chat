export class RocketletMessageBridge {
	constructor(orch) {
		this.orch = orch;
	}

	create(message, rocketletId) {
		console.log(`The Rocketlet ${ rocketletId } is creating a new message.`);

		let msg = this.orch.getConverters().get('messages').convertRocketletMessage(message);

		Meteor.runAsUser(msg.u._id, () => {
			msg = Meteor.call('sendMessage', msg);
		});

		return msg._id;
	}

	getById(messageId, rocketletId) {
		console.log(`The Rocketlet ${ rocketletId } is getting the message: "${ messageId }"`);

		return this.orch.getConverters().get('messages').convertById(messageId);
	}

	update(message, rocketletId) {
		console.log(`The Rocketlet ${ rocketletId } is updating a message.`);

		if (!message.editor) {
			throw new Error('Invalid editor assigned to the message for the update.');
		}

		if (!message.id || !RocketChat.models.Messages.findOneById(message.id)) {
			throw new Error('A message must exist to update.');
		}

		const msg = this.orch.getConverters().get('messages').convertRocketletMessage(message);
		const editor = RocketChat.models.Users.findOneById(message.editor.id);

		RocketChat.updateMessage(msg, editor);
	}
}
