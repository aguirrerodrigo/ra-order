import { ModelValidationError } from '../../errors/model-validation-error';
import { PropertyValidationError } from '../../errors/property-validation-error';
import { validateOrReject } from 'class-validator';
import { map } from './map';

export abstract class Model {
	map(properties: any, data: any = null): any {
		if (data != null) {
			map(properties, this, data);
		}

		const result = {};
		map(properties, result, this);
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
