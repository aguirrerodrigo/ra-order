import { IsPositive, IsDefined, IsNumber, IsIn } from 'class-validator';

export class Discount {
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

	constructor(discount?: Discount) {
		if (discount != null) {
			Object.assign(this, discount);
		}
	}
}
