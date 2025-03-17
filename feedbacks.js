import { combineRgb } from '@companion-module/base'
import { HorizontalAlign, Jimp, loadFont } from 'jimp'
import { convertRGBAtoARGB, getTotalSeconds } from './utils'
import { SANS_8_WHITE } from 'jimp/fonts'

export function getFeedbacks() {
	const feedbacks = {}

	const colorWhite = combineRgb(255, 255, 255)
	const colorGray = combineRgb(72, 72, 72)
	const colorBlack = combineRgb(0, 0, 0)
	const colorRed = combineRgb(244, 67, 54)
	const colorGreen = combineRgb(46, 125, 50)
	const colorOrange = combineRgb(245, 124, 0)
	const colorYellow = combineRgb(204, 204, 0)

	feedbacks['player-preview'] = {
		type: 'advanced',
		name: 'Player Preview',
		description: 'Shows player preview.',
		options: [
			{
				type: 'dropdown',
				label: 'Player',
				id: 'id',
				choices: this.generatePlayerListActionChoices(),
			},
			{
				type: 'checkbox',
				label: 'Show bottom bar',
				id: 'showBottomBar',
				default: true,
			},
			{
				type: 'colorpicker',
				label: 'Playing foreground color',
				id: 'fgPlaying',
				default: colorWhite,
			},
			{
				type: 'colorpicker',
				label: 'Playing background color',
				id: 'bgPlaying',
				default: colorRed,
			},
			{
				type: 'colorpicker',
				label: 'Stopped foreground color',
				id: 'fgStopped',
				default: colorWhite,
			},
			{
				type: 'colorpicker',
				label: 'Stopped background color',
				id: 'bgStopped',
				default: colorBlack,
			},
			{
				type: 'colorpicker',
				label: 'Paused foreground color',
				id: 'fgPaused',
				default: colorWhite,
			},
			{
				type: 'colorpicker',
				label: 'Paused background color',
				id: 'bgPaused',
				default: colorOrange,
			},
		],
		callback: async (feedback, context) => {
			const id = feedback.options.id
			if (!id) return {}

			let player = this.getPlayerById(id)
			if (!player || !player.playbackInfo) return {}

			let base64Image = player.preview
			if (!base64Image) return {}

			const imageBuffer = Buffer.from(base64Image, 'base64')
			const image = await Jimp.read(imageBuffer)

			const targetWidth = feedback?.image?.width ?? 72
			const targetHeight = feedback?.image?.height ?? 72

			image.resize({ w: targetWidth, h: targetHeight })

			if (feedback.options.showBottomBar) {
				let backgroundColor
				switch (player.playbackInfo.playbackStatus) {
					case 'Playing':
						backgroundColor = feedback.options.bgPlaying
						break
					case 'Stopped':
						backgroundColor = feedback.options.bgStopped
						break
					case 'Paused':
						backgroundColor = feedback.options.bgPaused
						break
					default:
						backgroundColor = colorBlack
				}

				// backgroundColor is rgb, convert it to rgba.
				const barColor = (255 + (backgroundColor << 8)) >>> 0

				// draw bottom bar.
				const barHeight = 18
				image.scan((x, y, idx) => {
					if (y > targetHeight - barHeight) image.setPixelColor(barColor, x, y)
				})
			}

			// blink when less then 10 seconds left.
			let remainingTimeAlertLimit = 10
			let remainingSeconds = getTotalSeconds(player.playbackInfo.clipRemainingTime)
			if (remainingSeconds && remainingSeconds <= remainingTimeAlertLimit) {
				let currentSeconds = new Date().getSeconds()
				if (currentSeconds % 2 === 0) {
					let alertColor = feedback.options.bgStopped
					// backgroundColor is rgb, convert it to rgba.
					const barColor = (255 + (alertColor << 8)) >>> 0

					// draw bottom bar.
					const barHeight = 18
					image.scan((x, y, idx) => {
						if (y > targetHeight - barHeight) image.setPixelColor(barColor, x, y)
					})
				}
			}

			const finalBuffer = Buffer.alloc(targetWidth * targetHeight * 4)
			image.scan((x, y, idx) => {
				const color = image.getPixelColor(x, y)

				// color data is rgba. convert it to argb.
				const argb = convertRGBAtoARGB(color)
				finalBuffer.writeUInt32BE(argb, idx)
			})

			let textColor
			switch (player.playbackInfo.playbackStatus) {
				case 'Playing':
					textColor = feedback.options.fgPlaying
					break
				case 'Stopped':
					textColor = feedback.options.fgStopped
					break
				case 'Paused':
					textColor = feedback.options.fgPaused
					break
				default:
					textColor = colorWhite
			}

			return {
				imageBuffer: finalBuffer,
				color: textColor,
			}
		},
	}

	return feedbacks
}

function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max)
}

function generateGraphImage(graph, targetWidth, targetHeight, color) {
	const finalBuffer = Buffer.alloc(targetWidth * targetHeight * 4)
	const fillColor = 255 * Math.pow(2, 24) + color

	let pointsNeeded = targetWidth - graph.length
	while (pointsNeeded > 0) {
		for (let i = 0; i < graph.length; i++) {
			if (i == graph.length - 1) break

			const diff = Math.abs(graph[i + 1] - graph[i])
			if (diff < 10 || i == graph.length - 2) {
				const half = (graph[i + 1] + graph[i]) / 2
				graph.splice(i + 1, 0, half)
				pointsNeeded--
				i++
			}
			if (pointsNeeded <= 0) break
		}
	}

	const graphLength = graph.length

	for (let x = targetWidth - 1; x >= 0; x--) {
		const graphIndex = x
		if (graphIndex >= graphLength) continue

		const data = graph[graphIndex]
		const pointY = clamp(targetHeight - Math.round((data / 100) * targetHeight), 0, targetHeight - 1)

		for (let y = targetHeight - 1; y > pointY; y--) {
			const bufferIndex = y * targetWidth + x
			finalBuffer.writeUInt32BE(fillColor, bufferIndex * 4)
		}
	}

	return finalBuffer
}
