import { IsDefined, IsNumber, IsPositive } from 'class-validator';

export class OrderItem {
	description?: string;

	@IsDefined({ message: 'Name is required.' })
	name: string;

	@IsDefined({ message: 'Price is required.' })
	@IsPositive({ message: 'Price must be a positive number.' })
	@IsNumber(
		{ maxDecimalPlaces: 2 },
		{
			message:
				'Price must be in a valid number format and can only have maximum 2 decimal places.'
		}
	)
	price: number;

	@IsDefined({ message: 'Quantity is required.' })
	@IsPositive({ message: 'Quantity must be a positive number.' })
	@IsNumber(
		{ maxDecimalPlaces: 0 },
		{
			message:
				'Quantity must be in a valid number format and cannot have decimal places.'
		}
	)
	quantity: number;

	get total(): number {
		return this.quantity * this.price;
	}

	constructor(orderItem?: OrderItem) {
		if (orderItem != null) {
			Object.assign(this, orderItem);
		}
	}
}
