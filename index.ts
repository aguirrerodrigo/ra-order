/* tslint:disable */

import { OrderService } from './orders/order-service';
import * as admin from 'firebase-admin';
import * as express from 'express';
import { environment } from './environments/environment';
const firebaseAccount = require('./auth/firebase.json');

admin.initializeApp({
	credential: admin.credential.cert(firebaseAccount),
	databaseURL: environment.project.databaseURL,
	projectId: environment.project.projectId,
	storageBucket: environment.project.storageBucket
});

const orderService = new OrderService();
const app = express();
app.use(express.json());

// HOME
app.get('/', (req, res): void => {
	res.send('Express running.');
});

// FETCH
app.get(
	'/api/orders/:date',
	async (req, res): Promise<void> => {
		try {
			const result = [];
			const orders = await orderService.fetch(req.params.date);
			for (const order of orders) {
				result.push(order.json());
			}

			res.status(200).send(result);
		} catch (err) {
			res.status(err.statusCode || 500).send(err.get ? err.get() : err);
		}
	}
);

// GET
app.get(
	'/api/orders/:date/:orderNumber',
	async (req, res): Promise<void> => {
		try {
			const order = await orderService.get(
				req.params.date,
				req.params.orderNumber
			);

			res.status(200).send(order.json());
		} catch (err) {
			res.status(err.statusCode || 500).send(err.get ? err.get() : err);
		}
	}
);

// POST
app.post(
	'/api/orders',
	async (req, res): Promise<void> => {
		try {
			const order = await orderService.post(req.body);

			res.status(201)
				.header(
					'Location',
					`${req.protocol}://${req.get('host')}/api/orders/${order.date}/${
						order.orderNumber
					}`
				)
				.send();
		} catch (err) {
			res.status(err.statusCode || 500).send(err.get ? err.get() : err);
		}
	}
);

// PUT
app.put(
	'/api/orders/:date/:orderNumber',
	async (req, res): Promise<void> => {
		try {
			await orderService.put(
				req.params.date,
				req.params.orderNumber,
				req.body
			);

			res.status(204).send();
		} catch (err) {
			res.status(err.statusCode || 500).send(err.get ? err.get() : err);
		}
	}
);

app.listen(4201);
console.log('Express running on port 4201: http://localhost:4201/');
