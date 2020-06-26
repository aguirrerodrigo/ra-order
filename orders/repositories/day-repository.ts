import { Day, Pos } from '../models/day';
import * as moment from 'moment';
import * as admin from 'firebase-admin';

export class DayRepository {
	async get(date: string): Promise<Day> {
		date = moment(date).format('YYYY-MM-DD');

		let result: Day;
		const doc = admin.firestore().doc(`dates/${date}`);
		const snapshot = await doc.get();
		if (!snapshot.exists) {
			result = new Day();
			result.date = date;
		} else {
			result = this.model(date, snapshot.data());
		}

		return Promise.resolve(result);
	}

	async save(day: Day): Promise<void> {
		const doc = admin.firestore().doc(`dates/${day.date}`);

		await doc.set(this.data(day));
	}

	private model(date: string, data: any): Day {
		const day = new Day();
		day.date = date;
		day.orderCount = data.orderCount || day.itemCount;
		day.itemCount = data.itemCount || day.itemCount;
		day.checkoutDuration = data.checkoutDuration;
		day.itemCheckoutPerMin =
			data.itemCheckoutPerMin || day.itemCheckoutPerMin;
		day.assembleDuration = data.assembleDuration;
		day.itemAssemblePerMin =
			data.itemAssemblePerMin || day.itemCheckoutPerMin;
		day.firstOrderDate = data.firstOrderDate;
		day.lastOrderDate = data.lastOrderDate;

		if (data.pos != null) {
			for (const key in data.pos) {
				if (data.pos.hasOwnProperty(key)) {
					const model = new Pos();
					model.checkoutDuration = data.pos[key].checkoutDuration;
					model.itemCheckoutPerMin =
						data.pos[key].itemcheckoutPerMin || model.itemCheckoutPerMin;
					model.itemCount = data.pos[key].itemCount || model.itemCount;
					model.orderCount = data.pos[key].orderCount || model.orderCount;
					day.pos.set(key, model);
				}
			}
		}

		if (data.items != null) {
			for (const key in data.items) {
				if (data.items.hasOwnProperty(key)) {
					day.items.set(key, data.items[key]);
				}
			}
		}

		return day;
	}

	private data(day: Day): any {
		const data = {
			orderCount: day.orderCount,
			itemCount: day.itemCount,
			checkoutDuration: day.checkoutDuration,
			itemCheckoutPerMin: day.itemCheckoutPerMin,
			firstOrderDate: moment(day.firstOrderDate).format()
		} as any;

		if (day.assembleDuration != null) {
			data.assembleDuration = day.assembleDuration;
			data.itemAssemblePerMin = day.itemAssemblePerMin;
		}

		if (day.lastOrderDate != null) {
			data.lastOrderDate = moment(day.lastOrderDate).format();
		}

		if (day.pos.size > 0) {
			data.pos = {};
			for (const [key, pos] of day.pos) {
				data.pos[key] = {
					orderCount: pos.orderCount,
					itemCount: pos.itemCount,
					checkoutDuration: pos.checkoutDuration,
					itemCheckoutPerMin: pos.itemCheckoutPerMin
				};
			}
		}

		if (day.items.size > 0) {
			data.items = {};
			for (const [key, count] of day.items) {
				data.items[key] = count;
			}
		}

		return data;
	}
}
