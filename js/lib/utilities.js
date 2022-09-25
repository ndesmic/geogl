export function downloadUrl(url, fileName) {
	const link = document.createElement("a");
	link.href = url;
	link.download = fileName;
	link.click();
}
export function downloadBlob(blob, fileName) {
	const url = URL.createObjectURL(blob);
	downloadUrl(url, fileName);
	URL.revokeObjectURL(url);
}