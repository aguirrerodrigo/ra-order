import { OrderItem } from './order-item';
import { Discount } from './discount';
import {
	IsDefined,
	IsPositive,
	IsNumber,
	IsDateString,
	validateOrReject,
	ValidateNested
} from 'class-validator';
import * as moment from 'moment';

export class Order {
	@ValidateNested()
	items?: OrderItem[];

	get itemCount(): number {
		let count = 0;
		if (this.items != null) {
			for (const item of this.items) {
				count += item.quantity;
			}
		}

		return count;
	}

	get total(): number {
		let total = 0;
		if (this.items != null) {
			for (const item of this.items) {
				total += item.price * item.quantity;
			}
		}

		return total;
	}

	@ValidateNested()
	discount?: Discount;

	get discountAmount(): number {
		if (this.discount == null) {
			return null;
		} else {
			if (this.discount.type === 'amount') {
				return -this.discount.value;
			} else if (this.discount.type === 'percentage') {
				return -((this.discount.value / 100) * this.total);
			} else {
				return null;
			}
		}
	}

	get discountPercentage(): number {
		if (this.discount == null) {
			return null;
		} else {
			if (this.discount.type === 'percentage') {
				return this.discount.value;
			} else {
				return null;
			}
		}
	}

	get discountedTotal(): number {
		return this.total - (this.discountAmount ? this.discountAmount : 0);
	}

	get change(): number {
		return this.cash - this.discountedTotal;
	}

	@IsDefined({ message: 'Cash is required.' })
	@IsPositive({ message: 'Cash must be a positive number.' })
	@IsNumber(
		{ maxDecimalPlaces: 2 },
		{
			message:
				'Cash must be in a valid number format and can only have maximum 2 decimal places.'
		}
	)
	cash: number;

	@IsDefined({ message: 'CreateDate is required.' })
	@IsDateString({ message: 'CreateDate must be in a valid date format.' })
	createDate: string;

	@IsDefined({ message: 'CheckoutDate is required.' })
	@IsDateString({ message: 'CheckoutDate must be in a valid date format.' })
	checkoutDate: string;

	get checkoutDuration(): string {
		return moment
			.utc(moment(this.checkoutDate).diff(moment(this.createDate)))
			.format('HH:mm:ss');
	}

	get date(): string {
		return moment.utc(this.checkoutDate).format('YYYY-MM-DD');
	}

	@IsDateString({ message: 'AssembledDate must be in a valid date format.' })
	assembleDate?: string;

	get assembleDuration(): string {
		if (this.assembleDate != null) {
			return moment
				.utc(moment(this.assembleDate).diff(moment(this.checkoutDate)))
				.format('HH:mm:ss');
		} else {
			return null;
		}
	}

	constructor(order?: Order) {
		if (order != null) {
			Object.assign(this, order);
			if (order.items != null) {
				this.items = [];
				for (const item of order.items) {
					this.items.push(new OrderItem(item));
				}
			}

			if (order.discount != null) {
				this.discount = new Discount(order.discount);
			}
		}
	}

	async validate(): Promise<void> {
		await validateOrReject(this, {
			skipUndefinedProperties: true,
			skipNullProperties: true
		});

		if (this.change < 0) {
			throw Error('Not enough cash.');
		}
	}
}
