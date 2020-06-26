import * as admin from 'firebase-admin';
import * as moment from 'moment';
import { Order } from '../models/order';
import { Discount } from '../models/discount';
import { OrderItem } from '../models/order-item';

export class OrderRepository {
	async fetch(date: string): Promise<Order[]> {
		const list: Order[] = [];

		const collection = await admin
			.firestore()
			.collection(`dates/${date}/orders`)
			.get();
		collection.forEach((document: any): void => {
			list.push(this.model(document.id, document.data()));
		});

		return list;
	}

	async save(order: Order): Promise<void> {
		const doc = admin
			.firestore()
			.doc(`dates/${order.date}/orders/${order.orderNumber}`);

		await doc.set(this.data(order));
	}

	async get(date: string, orderNumber: any): Promise<Order> {
		date = moment(date).format('YYYY-MM-DD');

		const doc = admin.firestore().doc(`dates/${date}/orders/${orderNumber}`);
		const snapshot = await doc.get();
		if (snapshot.exists) {
			return Promise.resolve(this.model(orderNumber, snapshot.data()));
		} else {
			return Promise.resolve(null);
		}
	}

	private data(order: Order): any {
		const data = {
			pos: order.pos,
			cash: order.cash,
			change: order.change,
			checkoutDate: moment(order.checkoutDate).format(),
			checkoutDuration: order.checkoutDuration,
			itemCount: order.itemCount,
			createDate: moment(order.createDate).format(),
			date: order.date,
			discount: order.discountAmount,
			discountPercentage: order.discountPercentage,
			discountedTotal: order.discountedTotal,
			total: order.total
		} as any;

		if (order.assembleDate != null) {
			data.assembleDate = moment(order.assembleDate).format();
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

		return data;
	}

	private model(orderNumber: any, data: any): Order {
		const order = new Order();
		order.pos = data.pos;
		order.cash = data.cash;
		order.checkoutDate = data.checkoutDate;
		order.createDate = data.createDate;
		order.orderNumber = orderNumber;

		if (data.discount != null) {
			order.discount = new Discount();
			if (data.discountPercentage > 0) {
				order.discount.type = 'percentage';
				order.discount.value = data.discountPercentage;
			} else {
				order.discount.type = 'amount';
				order.discount.value = data.discount;
			}
		}

		if (Array.isArray(data.items)) {
			order.items = [];
			for (const item of data.items) {
				const orderItem = new OrderItem();
				orderItem.description = item.description;
				orderItem.name = item.name;
				orderItem.price = item.price;
				orderItem.quantity = item.quantity;

				order.items.push(orderItem);
			}
		}

		return order;
	}
}
