import { ModelValidationError } from '../../errors/model-validation-error';
import { PropertyValidationError } from '../../errors/property-validation-error';
import { validateOrReject } from 'class-validator';

export abstract class Model {
	map(properties: any, data: any = null): any {
		if (data != null) {
			for (const prop in properties) {
				if (properties.hasOwnProperty(prop)) {
					if (data[prop] != null) {
						properties[prop] = data[prop];
					}

					if (properties[prop] != null) {
						this[prop] = properties[prop];
					}
				}
			}
		}

		const result = {};
		for (const prop in properties) {
			if (properties.hasOwnProperty(prop)) {
				let value = this[prop];
				if (value == null) {
					value = properties[prop];
				}

				if (value != null) {
					result[prop] = value;
				}
			}
		}
		return result;
	}

	abstract json(data?: any): any;

	async validate(): Promise<void> {
		try {
			await validateOrReject(this, {
				skipUndefinedProperties: true,
				skipNullProperties: true
			});
		} catch (err) {
			throw new ModelValidationError(
				this.constructor.name,
				this.parseValidationErrors(err)
			);
		}
	}

	private parseValidationErrors(error: any[]): PropertyValidationError[] {
		const result: PropertyValidationError[] = [];
		let childErrors: PropertyValidationError[];
		const recurseChildErrors = (
			err: any,
			prevValueIsArray: boolean = false,
			prop: string = ''
		): void => {
			if (err.children != null && err.children.length > 0) {
				if (prop.length === 0) {
					prop = err.property;
				} else {
					prop += prevValueIsArray
						? `[${err.property}]`
						: `.${err.property}`;
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
					childErrors.push({
						property: prop + '.' + err.property,
						errors: [...Object.values(err.constraints)] as string[]
					});
				}
			}
		};

		// class-validator error
		if (Array.isArray(error)) {
			for (const err of error) {
				if (err.property != null) {
					if (err.constraints != null) {
						result.push({
							property: err.property,
							errors: [...Object.values(err.constraints)] as string[]
						});
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

		return result;
	}
}
