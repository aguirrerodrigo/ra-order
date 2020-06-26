export class ValidationError extends Error {
	readonly statusCode = 400;

	constructor(public message: string) {
		super(message);
	}

	get(): any {
		return {
			message: this.message
		};
	}
}
