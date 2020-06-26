import { Order } from './models/order';
import { OrderRepository } from './repositories/order-repository';
import * as moment from 'moment';
import { isNotEmptyObject } from 'class-validator';
import { ServiceError, serviceError } from '../errors/service-error';

export class OrderService {
	readonly repo = new OrderRepository();

	async fetch(date: string): Promise<Order[]> {
		try {
			if (!moment(date, 'YYYY-MM-DD').isValid()) {
				throw new ServiceError('Date must be in a "YYYY-MM-DD" format.', {
					statusCode: 400
				});
			}

			return await this.repo.fetch(date);
		} catch (err) {
			console.log(`OrderService.list error: ${err}`);
			throw serviceError(err);
		}
	}

	async get(date: string, orderNumber: any): Promise<Order> {
		try {
			if (!moment(date, 'YYYY-MM-DD').isValid()) {
				throw new ServiceError('Date must be in a "YYYY-MM-DD" format.', {
					statusCode: 400
				});
			}

			return await this.repo.get(date, orderNumber);
		} catch (err) {
			console.log(`OrderService.list error: ${err}`);
			throw serviceError(err);
		}
	}

	async post(data: any): Promise<Order> {
		try {
			// Insert anything except assembleDate
			data.assembleDate = null;

			const model = new Order(data);
			await model.validate();

			await this.repo.save(model);
			return model;
		} catch (err) {
			console.log(`OrderService.post error: ${err}`);
			throw serviceError(err);
		}
	}

	async put(date: string, orderNumber: any, data: any): Promise<void> {
		try {
			if (!moment(date, 'YYYY-MM-DD').isValid()) {
				throw new ServiceError('Date must be in a "YYYY-MM-DD" format.', {
					statusCode: 400
				});
			}

			if (!isNotEmptyObject(data)) {
				throw new ServiceError('Nothing to update.', { statusCode: 400 });
			}

			const model = await this.repo.get(date, orderNumber);

			// Update only assembleDate
			model.json({ assembleDate: data.assembleDate });

			await model.validate();

			await this.repo.save(model);
		} catch (err) {
			console.log(`OrderService.put error: ${err}`);
			throw serviceError(err);
		}
	}
}
