import { combineRgb } from '@companion-module/base'

export function getPresets() {
	let presets = {}

	const colorWhite = combineRgb(255, 255, 255)
	const colorGray = combineRgb(72, 72, 72)
	const colorBlack = combineRgb(0, 0, 0)
	const colorRed = combineRgb(244, 67, 54)
	const colorGreen = combineRgb(46, 125, 50)
	const colorOrange = combineRgb(245, 124, 0)
	const colorYellow = combineRgb(204, 204, 0)

	presets['playAllPlayers'] = {
		type: 'button',
		category: 'Global',
		name: 'Play All',
		style: {
			text: 'Play\\nAll',
			size: 18,
			color: colorWhite,
			bgcolor: colorBlack,
		},
		steps: [
			{
				down: [
					{
						actionId: 'play_all_players',
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['pauseAllPlayers'] = {
		type: 'button',
		category: 'Global',
		name: 'Pause All',
		style: {
			text: 'Pause\\nAll',
			size: 18,
			color: colorWhite,
			bgcolor: colorBlack,
		},
		steps: [
			{
				down: [
					{
						actionId: 'pause_all_players',
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['stopAllPlayers'] = {
		type: 'button',
		category: 'Global',
		name: 'Stop All',
		style: {
			text: 'Stop\\nAll',
			size: 18,
			color: colorWhite,
			bgcolor: colorBlack,
		},
		steps: [
			{
				down: [
					{
						actionId: 'stop_all_players',
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	this.state?.playerlist.items?.forEach((player) => {
		if (!player) return

		presets[`player-${player.id}`] = {
			category: 'Player',
			name: player.name,
			type: 'text',
			text: '',
		}

		presets[`play-${player.id}`] = {
			type: 'button',
			category: 'Player',
			name: `Play ${player.name}`,
			style: {
				text: 'Play',
				size: 18,
				color: colorWhite,
				bgcolor: colorBlack,
			},
			steps: [
				{
					down: [
						{
							actionId: 'play',
							options: {
								playerId: player.id,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets[`pause-${player.id}`] = {
			type: 'button',
			category: 'Player',
			name: `Pause ${player.name}`,
			style: {
				text: 'Pause',
				size: 18,
				color: colorWhite,
				bgcolor: colorBlack,
			},
			steps: [
				{
					down: [
						{
							actionId: 'pause',
							options: {
								playerId: player.id,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets[`stop-${player.id}`] = {
			type: 'button',
			category: 'Player',
			name: `Stop ${player.name}`,
			style: {
				text: 'Stop',
				size: 18,
				color: colorWhite,
				bgcolor: colorBlack,
			},
			steps: [
				{
					down: [
						{
							actionId: 'stop',
							options: {
								playerId: player.id,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets[`player-preview-${player.id}`] = {
			type: 'button',
			category: 'Player',
			name: `Preview ${player.name}`,
			style: {
				text: `$(metus-player:player-${player.id}-clip-remaining-time)`,
				size: 14,
				color: colorWhite,
				bgcolor: colorBlack,
				show_topbar: false,
				alignment: 'center:bottom',
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'player-preview',
					options: {
						id: player.id,
						showBottomBar: true,
						fgPlaying: colorWhite,
						bgPlaying: colorBlack,
						fgStopped: colorWhite,
						bgStopped: colorRed,
						fgPaused: colorWhite,
						bgPaused: colorOrange,
					},
				},
			],
		}

		presets[`go-to-start-${player.id}`] = {
			type: 'button',
			category: 'Player',
			name: `Go to Start ${player.name}`,
			style: {
				text: 'Go to\\nStart',
				size: 18,
				color: colorWhite,
				bgcolor: colorBlack,
			},
			steps: [
				{
					down: [
						{
							actionId: 'go_to_start',
							options: {
								playerId: player.id,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets[`go-to-end-${player.id}`] = {
			type: 'button',
			category: 'Player',
			name: `Go to End ${player.name}`,
			style: {
				text: 'Go to\\nEnd',
				size: 18,
				color: colorWhite,
				bgcolor: colorBlack,
			},
			steps: [
				{
					down: [
						{
							actionId: 'go_to_end',
							options: {
								playerId: player.id,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets[`previous-frame-${player.id}`] = {
			type: 'button',
			category: 'Player',
			name: `Previous Frame ${player.name}`,
			style: {
				text: 'Previous\\nFrame',
				size: 14,
				color: colorWhite,
				bgcolor: colorBlack,
			},
			steps: [
				{
					down: [
						{
							actionId: 'previous_frame',
							options: {
								playerId: player.id,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets[`next-frame-${player.id}`] = {
			type: 'button',
			category: 'Player',
			name: `Next Frame ${player.name}`,
			style: {
				text: 'Next\\nFrame',
				size: 14,
				color: colorWhite,
				bgcolor: colorBlack,
			},
			steps: [
				{
					down: [
						{
							actionId: 'next_frame',
							options: {
								playerId: player.id,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets[`seek-by-10-backward-${player.id}`] = {
			type: 'button',
			category: 'Player',
			name: `Seek 10 sec. Backward ${player.name}`,
			style: {
				text: 'Backward\\n10 sec.',
				size: 14,
				color: colorWhite,
				bgcolor: colorBlack,
			},
			steps: [
				{
					down: [
						{
							actionId: 'seek_by',
							options: {
								playerId: player.id,
								seconds: -10,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets[`seek-by-10-forward-${player.id}`] = {
			type: 'button',
			category: 'Player',
			name: `Seek 10 sec. Forward ${player.name}`,
			style: {
				text: 'Forward\\n10 sec.',
				size: 14,
				color: colorWhite,
				bgcolor: colorBlack,
			},
			steps: [
				{
					down: [
						{
							actionId: 'seek_by',
							options: {
								playerId: player.id,
								seconds: 10,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets[`set-playback-rate-to-minus-1-${player.id}`] = {
			type: 'button',
			category: 'Player',
			name: `Set Playback Rate to -1 ${player.name}`,
			style: {
				text: 'Playback\\nRate\\n-1',
				size: 14,
				color: colorWhite,
				bgcolor: colorBlack,
			},
			steps: [
				{
					down: [
						{
							actionId: 'set_playback_rate',
							options: {
								playerId: player.id,
								rate: -1,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets[`set-playback-rate-to-1-${player.id}`] = {
			type: 'button',
			category: 'Player',
			name: `Set Playback Rate to 1 ${player.name}`,
			style: {
				text: 'Playback\\nRate\\n1',
				size: 14,
				color: colorWhite,
				bgcolor: colorBlack,
			},
			steps: [
				{
					down: [
						{
							actionId: 'set_playback_rate',
							options: {
								playerId: player.id,
								rate: 1,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets[`decrease-playback-rate-${player.id}`] = {
			type: 'button',
			category: 'Player',
			name: `Decrease Playback Rate of ${player.name}`,
			style: {
				text: 'Decrease\\nPlayback\\nRate',
				size: 14,
				color: colorWhite,
				bgcolor: colorBlack,
			},
			steps: [
				{
					down: [
						{
							actionId: 'decrease_playback_rate',
							options: {
								playerId: player.id,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets[`increase-playback-rate-${player.id}`] = {
			type: 'button',
			category: 'Player',
			name: `Increase Playback Rate of ${player.name}`,
			style: {
				text: 'Increase\\nPlayback\\nRate',
				size: 14,
				color: colorWhite,
				bgcolor: colorBlack,
			},
			steps: [
				{
					down: [
						{
							actionId: 'increase_playback_rate',
							options: {
								playerId: player.id,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}
	})

	return presets
}
