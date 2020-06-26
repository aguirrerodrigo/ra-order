import { Model } from './model';
import { OrderItem } from './order-item';
import { Discount } from './discount';
import {
	IsPositive,
	IsNumber,
	IsDateString,
	ValidateNested,
	IsOptional,
	IsDefined
} from 'class-validator';
import * as moment from 'moment';
import { ValidationError } from '../../errors/validation-error';

export class Order extends Model {
	@IsDefined({ message: 'OrderNumber is required.' })
	orderNumber: any;

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
		return moment(this.checkoutDate).format('YYYY-MM-DD');
	}

	@IsOptional()
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

	constructor(data: any = null) {
		super();

		this.json(data);
	}

	json(data: any = null): any {
		if (data != null) {
			this.setJson(data);
		}

		return this.getJson();
	}

	private getJson(): any {
		const data = this.map({
			orderNumber: null,
			itemCount: null,
			total: null,
			discountAmount: null,
			discountPercentage: null,
			discountedTotal: null,
			change: null,
			cash: null,
			createDate: null,
			checkoutDate: null,
			checkoutDuration: null,
			date: null,
			assembleDuration: null
		});

		if (this.items != null) {
			data.items = [];
			for (const item of this.items) {
				data.items.push(item.json());
			}
		}

		if (this.discount != null) {
			data.discount = this.discount.json();
		}

		return data;
	}

	private setJson(data: any): void {
		if (data != null) {
			this.map(
				{
					orderNumber: null,
					cash: null,
					createDate: null,
					checkoutDate: null,
					assembleDate: null
				},
				data
			);

			if (Array.isArray(data.items)) {
				this.items = [];
				for (const item of data.items) {
					this.items.push(new OrderItem(item));
				}
			}

			if (data.discount != null) {
				this.discount = new Discount(data.discount);
			}
		}
	}

	async validate(): Promise<void> {
		await super.validate();

		if (this.change < 0) {
			throw new ValidationError('Not enough cash.');
		}
	}
}
