export function getActions() {
	let actions = {}

	actions['play_all_players'] = {
		name: 'Play All',
		options: [],
		callback: async (action) => {
			await this.playAllPlayers()
		},
	}

	actions['pause_all_players'] = {
		name: 'Pause All',
		options: [],
		callback: async (action) => {
			await this.pauseAllPlayers()
		},
	}

	actions['stop_all_players'] = {
		name: 'Stop All',
		options: [],
		callback: async (action) => {
			await this.stopAllPlayers()
		},
	}

	actions['play'] = {
		name: 'Play',
		options: [
			{
				type: 'dropdown',
				label: 'Player',
				id: 'playerId',
				choices: this.generatePlayerListActionChoices(),
			},
		],
		callback: async (action) => {
			await this.play(action.options.playerId)
		},
	}

	actions['pause'] = {
		name: 'Pause',
		options: [
			{
				type: 'dropdown',
				label: 'Player',
				id: 'playerId',
				choices: this.generatePlayerListActionChoices(),
			},
		],
		callback: async (action) => {
			await this.pause(action.options.playerId)
		},
	}

	actions['stop'] = {
		name: 'Stop',
		options: [
			{
				type: 'dropdown',
				label: 'Player',
				id: 'playerId',
				choices: this.generatePlayerListActionChoices(),
			},
		],
		callback: async (action) => {
			await this.stop(action.options.playerId)
		},
	}

	actions['go_to_start'] = {
		name: 'Go to Start',
		options: [
			{
				type: 'dropdown',
				label: 'Player',
				id: 'playerId',
				choices: this.generatePlayerListActionChoices(),
			},
		],
		callback: async (action) => {
			await this.goToStart(action.options.playerId)
		},
	}

	actions['go_to_end'] = {
		name: 'Go to End',
		options: [
			{
				type: 'dropdown',
				label: 'Player',
				id: 'playerId',
				choices: this.generatePlayerListActionChoices(),
			},
		],
		callback: async (action) => {
			await this.goToEnd(action.options.playerId)
		},
	}

	actions['next_frame'] = {
		name: 'Next Frame',
		options: [
			{
				type: 'dropdown',
				label: 'Player',
				id: 'playerId',
				choices: this.generatePlayerListActionChoices(),
			},
		],
		callback: async (action) => {
			await this.nextFrame(action.options.playerId)
		},
	}

	actions['previous_frame'] = {
		name: 'Previous Frame',
		options: [
			{
				type: 'dropdown',
				label: 'Player',
				id: 'playerId',
				choices: this.generatePlayerListActionChoices(),
			},
		],
		callback: async (action) => {
			await this.previousFrame(action.options.playerId)
		},
	}

	actions['seek_by'] = {
		name: 'Seek By',
		options: [
			{
				type: 'dropdown',
				label: 'Player',
				id: 'playerId',
				choices: this.generatePlayerListActionChoices(),
			},
			{
				type: 'textinput',
				label: 'Seconds',
				id: 'seconds',
				default: '10',
			},
		],
		callback: async (action) => {
			await this.seekBy(action.options.playerId, action.options.seconds)
		},
	}

	actions['set_playback_rate'] = {
		name: 'Set Playback Rate',
		options: [
			{
				type: 'dropdown',
				label: 'Player',
				id: 'playerId',
				choices: this.generatePlayerListActionChoices(),
			},
			{
				type: 'dropdown',
				label: 'Rate',
				id: 'rate',
				choices: this.generatePlaybackRatesActionChoices(),
				default: '1',
			},
		],
		callback: async (action) => {
			await this.setPlaybackRate(action.options.playerId, action.options.rate)
		},
	}

	actions['increase_playback_rate'] = {
		name: 'Increase Playback Rate',
		options: [
			{
				type: 'dropdown',
				label: 'Player',
				id: 'playerId',
				choices: this.generatePlayerListActionChoices(),
			},
		],
		callback: async (action) => {
			await this.increasePlaybackRate(action.options.playerId)
		},
	}

	actions['decrease_playback_rate'] = {
		name: 'Decrease Playback Rate',
		options: [
			{
				type: 'dropdown',
				label: 'Player',
				id: 'playerId',
				choices: this.generatePlayerListActionChoices(),
			},
		],
		callback: async (action) => {
			await this.decreasePlaybackRate(action.options.playerId)
		},
	}

	return actions
}
