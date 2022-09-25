export function loadObj(txt, { color, reverseWinding }){

	const positions = [];
	const normals = [];
	const uvs = [];
	const triangles = [];
	const colors = [];

	const lines = txt.split("\n");

	for(const line of lines){
		const normalizedLine = line.trim();
		if(!normalizedLine || normalizedLine.startsWith("#")) continue;
		const parts = normalizedLine.split(/\s+/g);
		const values = parts.slice(1).map(x => parseFloat(x));
		switch(parts[0]){
			case "v": {
				positions.push(...values);
				colors.push(...color);
				break;
			}
			case "c": { //custom extension
				if(!color){
					colors.push(...values);
				}
				break;
			}
			case "vt": {
				uvs.push(...values);
				break;
			}
			case "vn": {
				normals.push(...values);
				break;
			}
			case "f": {
				const oneBasedIndicies = values.map(x => x - 1);
				triangles.push(
					...(reverseWinding ? oneBasedIndicies.reverse() : oneBasedIndicies )
				);
				break;
			}
		}
	}

	return {
		positions,
		uvs,
		normals,
		triangles,
		colors
	};
}