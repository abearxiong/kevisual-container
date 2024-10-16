export const isString = (value: any, keys: string[]) => {
	for (let i = 0; i < keys.length; i++) {
		const item = keys[i];
		if (typeof value[item] === 'string') return true;
	}
	return false;
};
