export function arrayChunk(array, lengthPerChunk) {
	const result = [];
	let chunk = [array[0]];
	for (let i = 1; i < array.length; i++) {
		if (i % lengthPerChunk === 0) {
			result.push(chunk);
			chunk = [];
		}
		chunk.push(array[i]);
	}
	if (chunk.length > 0) result.push(chunk);
	return result;
}