import { api } from '@rocket.chat/core-services';
import { broker } from '@rocket.chat/network-broker';
import type { Document } from 'mongodb';
import polka from 'polka';

import { registerServiceModels } from '../../../../apps/meteor/ee/server/lib/registerServiceModels';
import { Collections, getCollection, getConnection } from '../../../../apps/meteor/ee/server/services/mongo';

const PORT = process.env.PORT || 3033;

(async () => {
	const db = await getConnection();

	const trash = await getCollection<Document>(Collections.Trash);

	registerServiceModels(db, trash);

	api.setBroker(broker);

	// need to import service after models are registered
	const { Account } = await import('./Account');

	api.registerService(new Account());

	await api.start();

	polka()
		.get('/health', async function (_req, res) {
			try {
				await api.nodeList();
				res.end('ok');
			} catch (err) {
				console.error('Service not healthy', err);

				res.writeHead(500);
				res.end('not healthy');
			}
		})
		.listen(PORT);
})();
