import * as admin from 'firebase-admin';
import { Order } from './models/order';
import { parseValidationError } from './models/validation/validation-error';

export class OrderService {
	async checkout(order: Order): Promise<any> {
		try {
			const model = new Order(order);
			model.checkoutDate = new Date().toISOString();
			model.assembleDate = null;

			await model.validate();

			const id = await this.saveOrder(model);
			return Promise.resolve(id);
		} catch (err) {
			console.log(`OrderService.checkout error: ${err}`);
			throw parseValidationError(err);
		}
	}

	private async saveOrder(order: Order): Promise<any> {
		const doc = admin.firestore().collection('order2').doc();
		const data = {
			cash: order.cash,
			change: order.change,
			checkoutDate: order.checkoutDate,
			checkoutDuration: order.checkoutDuration,
			itemCount: order.itemCount,
			createDate: order.createDate,
			date: order.date,
			discount: order.discountAmount,
			discountPercentage: order.discountPercentage,
			discountedTotal: order.discountedTotal,
			total: order.total
		} as any;

		if (order.assembleDate != null) {
			data.assembleDate = order.assembleDate;
		}

		if (order.assembleDuration != null) {
			data.assembleDuration = order.assembleDuration;
		}

		if (order.items != null) {
			data.items = [];
			for (const item of order.items) {
				const dataItem = {
					name: item.name,
					quantity: item.quantity,
					price: item.price,
					total: item.total
				} as any;

				if (item.description != null) {
					dataItem.description = item.description;
				}

				data.items.push(dataItem);
			}
		}

		const result = await doc.set(data);
		return Promise.resolve(doc.id);
	}
}
