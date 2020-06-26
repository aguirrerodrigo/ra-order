import { Model } from './model';
import { IsDefined, IsNumber, IsPositive, validate } from 'class-validator';

export class OrderItem extends Model {
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

	constructor(data: any = null) {
		super();

		this.json(data);
	}

	json(data: any = null): any {
		if (data != null) {
			this.map(
				{
					description: null,
					name: null,
					price: null,
					quantity: null
				},
				data
			);
		}

		return this.map({
			description: null,
			name: null,
			price: null,
			quantity: null,
			total: null
		});
	}
}
