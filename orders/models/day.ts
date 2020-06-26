import { Model } from './model';
import { Order } from './order';
import { map } from './map';
import * as moment from 'moment';

export class Day extends Model {
	date: string;
	orderCount = 0;
	itemCount = 0;
	checkoutDuration: string;
	itemCheckoutPerMin = 0;
	assembleDuration: string;
	itemAssemblePerMin = 0;
	pos = new Map<string, Pos>();
	items = new Map<string, number>();
	firstOrderDate: string;
	lastOrderDate?: string;

	constructor(data: any = null) {
		super();

		this.json(data);
	}

	json(data: any = null): any {
		this.setJson(data);
		return this.getJson();
	}

	private setJson(data: any): void {
		if (data != null) {
			this.map({
				date: null,
				orderCount: null,
				itemCount: null,
				itemCheckoutPerMin: null,
				itemAssemblePerMin: null,
				firstOrderDate: null,
				lastOrderDate: null
			});

			if (data.pos != null) {
				this.pos.clear();
				for (const pos of data.pos) {
					if (pos != null && pos.name != null) {
						const model = {} as Pos;
						map(
							{
								orderCount: null,
								itemCount: null,
								itemCheckoutPerMin: null
							},
							model,
							data.pos[pos]
						);
						this.pos.set(pos.name, model);
					}
				}
			}

			if (data.items != null) {
				this.items.clear();
				for (const item of data.items) {
					if (item != null && item.name != null) {
						this.items.set(item.name, item.count || 0);
					}
				}
			}
		}
	}

	private getJson(): any {
		const result = this.map({
			date: null,
			orderCount: null,
			itemCount: null,
			itemCheckoutPerMin: null,
			itemAssemblePerMin: null,
			firstOrderDate: null,
			lastOrderDate: null
		});

		if (this.pos != null) {
			result.pos = [];
			for (const [key, pos] of this.pos) {
				const data = {};
				map(
					{
						name: key,
						orderCount: null,
						itemCount: null,
						itemCheckoutPerMin: null
					},
					data,
					pos
				);
				result.pos.push(data);
			}
		}

		if (this.items != null) {
			result.items = [];
			for (const [name, count] of this.items) {
				result.items.push({ name, count });
			}
		}

		return result;
	}

	add(order: Order): void {
		this.orderCount++;
		this.itemCount += order.itemCount;

		const checkoutDuration = moment
			.duration(this.checkoutDuration)
			.add(order.checkoutDuration);
		this.checkoutDuration = moment
			.utc(checkoutDuration.asMilliseconds())
			.format('HH:mm:ss');
		this.itemCheckoutPerMin = this.itemCount / checkoutDuration.asMinutes();

		let pos: Pos;
		if (this.pos.has(order.pos)) {
			pos = this.pos.get(order.pos);
		} else {
			pos = new Pos();
			this.pos.set(order.pos, pos);
		}
		pos.orderCount++;
		pos.itemCount += order.itemCount;
		const posCheckoutDuration = moment
			.duration(pos.checkoutDuration)
			.add(order.checkoutDuration);
		pos.checkoutDuration = moment
			.utc(posCheckoutDuration.asMilliseconds())
			.format('HH:mm:ss');
		pos.itemCheckoutPerMin = pos.itemCount / posCheckoutDuration.asMinutes();

		if (order.items != null) {
			for (const item of order.items) {
				let count: number;
				if (this.items.has(item.name)) {
					count = this.items.get(item.name) + item.quantity;
				} else {
					count = item.quantity;
				}
				this.items.set(item.name, count);
			}
		}

		if (
			this.firstOrderDate == null ||
			moment(order.createDate) < moment(this.firstOrderDate)
		) {
			this.firstOrderDate = order.createDate;
		}
	}

	update(order: Order): void {
		if (order.assembleDuration != null) {
			this.assembleDuration = moment
				.utc(
					moment
						.duration(this.assembleDuration)
						.add(order.assembleDuration)
						.asMilliseconds()
				)
				.format('HH:mm:ss');
		}

		if (order.itemAssemblePerMinute != null) {
			this.itemAssemblePerMin =
				this.itemAssemblePerMin +
				(order.itemAssemblePerMinute - this.itemAssemblePerMin) /
					this.itemCount;
		}

		if (order.assembleDate != null) {
			if (
				this.lastOrderDate == null ||
				moment(order.assembleDate) > moment(this.lastOrderDate)
			) {
				this.lastOrderDate = order.assembleDate;
			}
		}
	}
}

export class Pos {
	orderCount = 0;
	itemCount = 0;
	checkoutDuration: string;
	itemCheckoutPerMin = 0;
}
