import { Model } from './model';
import { IsPositive, IsDefined, IsNumber, IsIn } from 'class-validator';

export class Discount extends Model {
	@IsDefined({ message: 'Value is required.' })
	@IsPositive({ message: 'Value must be a positive number.' })
	@IsNumber(
		{ maxDecimalPlaces: 2 },
		{
			message:
				'Value must be in a valid number format and can only have maximum 2 decimal places.'
		}
	)
	value: number;

	@IsDefined({ message: 'Type is required.' })
	@IsIn(['amount', 'percentage'], {
		message: 'Type must be one of the following: ["amount", "percentage"]'
	})
	type: 'amount' | 'percentage' = 'amount';

	constructor(data: any = null) {
		super();

		this.json(data);
	}

	json(data: any = null): any {
		if (data != null) {
			this.map(
				{
					value: null,
					type: null
				},
				data
			);
		}

		return this.map({
			value: null,
			type: null
		});
	}
}
