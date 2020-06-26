import { Order } from './models/order';
import { DayRepository } from './repositories/day-repository';
import { OrderRepository } from './repositories/order-repository';
import * as moment from 'moment';
import { isNotEmptyObject } from 'class-validator';
import { ServiceError, serviceError } from '../errors/service-error';

export class OrderService {
	readonly dayRepo = new DayRepository();
	readonly orderRepo = new OrderRepository();

	async fetch(date: string): Promise<Order[]> {
		try {
			if (!moment(date, 'YYYY-MM-DD').isValid()) {
				throw new ServiceError('Date must be in a "YYYY-MM-DD" format.', {
					statusCode: 400
				});
			}

			return await this.orderRepo.fetch(date);
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

			return await this.orderRepo.get(date, orderNumber);
		} catch (err) {
			console.log(`OrderService.list error: ${err}`);
			throw serviceError(err);
		}
	}

	async post(data: any): Promise<Order> {
		try {
			// insert anything except assembleDate
			data.assembleDate = null;

			const model = new Order(data);
			await model.validate();

			const ref = await this.orderRepo.get(model.date, model.orderNumber);
			if (ref != null) {
				throw new ServiceError(
					`Order with Date: "${model.date}" and OrderNumber: "${model.orderNumber} " already exists.`,
					{ statusCode: 403 }
				);
			}

			// create order
			await this.orderRepo.save(model);

			// update day
			const day = await this.dayRepo.get(model.date);
			day.add(model);
			await this.dayRepo.save(day);

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

			const model = await this.orderRepo.get(date, orderNumber);
			if (model == null) {
				throw new ServiceError(
					`Could not find order on Date: "${date}" with OrderNumber: "${orderNumber}".`,
					{ statusCode: 404 }
				);
			}

			// update only assembleDate
			model.json({ assembleDate: data.assembleDate });
			await model.validate();
			await this.orderRepo.save(model);

			// update day
			const day = await this.dayRepo.get(date);
			day.update(model);
			await this.dayRepo.save(day);
		} catch (err) {
			console.log(`OrderService.put error: ${err}`);
			throw serviceError(err);
		}
	}
}
