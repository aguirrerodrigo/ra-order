import { isNumber } from 'class-validator';
import { ModelValidationError } from './model-validation-error';
import { ValidationError } from './validation-error';

export class ServiceError extends Error {
	statusCode = 500;
	source?: any;

	constructor(
		public message: string,
		options?: { statusCode?: number; source?: any }
	) {
		super(message);

		if (options != null) {
			if (isNumber(options.statusCode)) {
				this.statusCode = options.statusCode;
			}

			this.source = options.source;
		}
	}

	get(): any {
		return {
			message: this.message,
			source: this.source
		};
	}
}

export function serviceError(error: any): any {
	const knownType = (err: any): boolean => {
		return (
			err instanceof ModelValidationError ||
			err instanceof ServiceError ||
			err instanceof ValidationError
		);
	};

	if (knownType(error)) {
		return error;
	} else {
		return new ServiceError(error.message || 'Unknown error.', {
			source: error
		});
	}
}
