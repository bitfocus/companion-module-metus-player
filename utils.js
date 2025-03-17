import numeral from 'numeral'

export function convertRGBAtoARGB(color) {
	const r = (color & 0xff000000) >>> 8
	const g = (color & 0x00ff0000) >>> 8
	const b = (color & 0x0000ff00) >>> 8
	const a = (color & 0x000000ff) << 24

	return (a | r | g | b) >>> 0
}

export function timeToString(time) {
	if (!time) return ''

	let hour = numeral(time.hour).format('00')
	let minute = numeral(time.minute).format('00')
	let second = numeral(time.second).format('00')

	var result = hour + ':' + minute + ':' + second

	return result
}

export function getTotalSeconds(time) {
	if (!time) return null

	return time.hour * 3600 + time.minute * 60 + time.second
}
