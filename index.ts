/* tslint:disable */

import { OrderService } from './orders/order-service';
import * as admin from 'firebase-admin';
import express = require('express');
const firebaseAccount = require('./auth/firebase.json');
import { environment } from './environments/environment';

admin.initializeApp({
	credential: admin.credential.cert(firebaseAccount),
	databaseURL: environment.project.databaseURL,
	projectId: environment.project.projectId,
	storageBucket: environment.project.storageBucket
});

const orderService = new OrderService();
const app = express();
app.use(express.json());

app.get('/', (req, res): void => {
	res.send('Express running.');
});

app.post(
	'/api/orders',
	async (req, res): Promise<void> => {
		try {
			const id = await orderService.checkout(req.body);

			res.send({ id });
		} catch (err) {
			res.send(err);
			res.status(500);
		}
	}
);

app.listen(4201);

console.log('Express running on port 4201: http://localhost:4201/');
