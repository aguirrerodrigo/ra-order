export class ValidationError {
	property = '';
	errors: string[] = [];
	source?: any;
}

export function parseValidationError(error: any): ValidationError[] {
	const result: ValidationError[] = [];
	let childErrors: ValidationError[];
	const recurseChildErrors = (
		err: any,
		prevValueIsArray: boolean = false,
		prop: string = ''
	): void => {
		if (err.children != null && err.children.length > 0) {
			if (prop.length === 0) {
				prop = err.property;
			} else {
				prop += prevValueIsArray ? `[${err.property}]` : `.${err.property}`;
			}
			for (const child of err.children) {
				recurseChildErrors(
					child,
					Array.isArray(err.value) ||
						err.value instanceof Map ||
						err.value instanceof Set,
					prop
				);
			}
		} else {
			if (err.constraints != null) {
				const model = new ValidationError();
				model.property = prop + '.' + err.property;
				model.errors = [...Object.values(err.constraints)] as string[];
				childErrors.push(model);
			}
		}
	};

	// class-validator error
	if (Array.isArray(error)) {
		for (const err of error) {
			if (err.property != null) {
				if (err.constraints != null) {
					const model = new ValidationError();
					model.property = err.property;
					model.errors = [...Object.values(err.constraints)] as string[];
					result.push(model);
				} else if (err.children != null && err.children.length > 0) {
					childErrors = [];
					recurseChildErrors(err);

					for (const child of childErrors) {
						result.push(child);
					}
				}
			}
		}
	}

	// generic error
	else if (error.message != null) {
		const model = new ValidationError();
		model.errors.push(error.message);
		result.push(model);
	}

	// unkown error
	else {
		const model = new ValidationError();
		model.errors.push('Unknown error.');
		model.source = error;
	}

	return result;
}
