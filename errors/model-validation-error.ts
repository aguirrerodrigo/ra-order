import { PropertyValidationError } from './property-validation-error';

export class ModelValidationError extends Error {
	readonly statusCode = 400;

	constructor(public model: string, public errors: PropertyValidationError[]) {
		super(`Invalid ${model}, see errors for details.`);
	}

	get(): any {
		return {
			model: this.model,
			message: this.message,
			errors: this.errors
		};
	}
}
