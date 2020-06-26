export function map(properties: any, target: any, source: any): void {
	for (const prop in properties) {
		if (properties.hasOwnProperty(prop)) {
			if (source[prop] != null) {
				properties[prop] = source[prop];
			}

			if (properties[prop] != null) {
				target[prop] = properties[prop];
			}
		}
	}
}
