import { getVariables } from './variables.js'
import { getActions } from './actions.js'
import { getPresets } from './presets.js'
import { getFeedbacks } from './feedbacks.js'

const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')

const { playerRestClient, playerHub, initRestClient, initSignalRClient } = require('./playerWebAPIClient')
//const requestInterval = 1000

class ModuleInstance extends InstanceBase {
	pendingPreviewRequests = []
	previewTimers = {}

	pendingPlaybackInfoRequests = []
	playbackInfoTimers = {}

	validPlaybackRates = [
		-5.0, -4.0, -3.0, -2.0, -1.0, -0.9, -0.8, -0.7, -0.6, -0.5, -0.4, -0.3, -0.2, -0.1, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6,
		0.7, 0.8, 0.9, 1.0, 2.0, 3.0, 4.0, 5.0,
	]

	constructor(internal) {
		super(internal)
	}

	async init(config) {
		this.updateStatus(InstanceStatus.Connecting)

		this.initState()
		this.config = config
		this.state.token = config.token

		this.updateModuleState()
		initRestClient(this.state, config, this)
		initSignalRClient(this.state, config, this)

		if (!config.token) {
			this.log('debug', 'No token found. Trying to login with credentials...')
			playerRestClient.login()
		} else {
			this.log('debug', 'Token found. Checking if it is valid...')
			playerRestClient.getCurrentUserInfo()
		}
	}

	async destroy() {
		this.log('debug', 'destroy')
		this.removeAllPlaybackInfoTimers()
		this.removeAllPreviewTimers()
		playerHub.stopSignalRClient()
	}

	async configUpdated(config) {
		this.log('debug', 'Configuration changed. Reinitializing...')

		this.removeAllPlaybackInfoTimers()
		this.removeAllPreviewTimers()

		setTimeout(() => {
			this.config = config
			this.state.token = config.token

			this.init(config)
		}, 2000)
	}

	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'webAPIUrl',
				label: 'PlayerWeb API URL',
				width: 12,
			},
			{
				type: 'textinput',
				id: 'userName',
				label: 'User Name',
				width: 6,
			},
			{
				type: 'textinput',
				id: 'password',
				label: 'Password',
				width: 6,
			},
			{
				type: 'static-text',
				id: 'tokenInfo',
				label: '',
				width: 12,
				value: 'Token will be set automatically. Just enter your credentials and save your configuration.',
			},
			{
				type: 'textinput',
				id: 'token',
				label: 'Token',
				width: 12,
			},
			{
				type: 'textinput',
				id: 'requestInterval',
				label: 'Request interval in milliseconds. Lower values may impact performance.',
				width: 6,
				default: 1000,
				regex: Regex.NUMBER,
			},
		]
	}

	updateActions() {
		const actions = getActions.bind(this)()
		this.setActionDefinitions(actions)
	}

	updatePresets() {
		const presets = getPresets.bind(this)()
		this.setPresetDefinitions(presets)
	}

	updateFeedbacks() {
		const feedbacks = getFeedbacks.bind(this)()
		this.setFeedbackDefinitions(feedbacks)
	}

	updateVariableDefinitions() {
		const variables = getVariables.bind(this)()
		this.setVariableDefinitions(variables)
	}

	initState() {
		this.state = {
			isConnected: false,
			isAuthenticated: false,
			user: null,
			token: null,
			playerlist: {
				status: 'idle',
				items: null,
				errorMessage: null,
			},
		}
	}

	async initAPI() {
		playerHub.startSignalRClient().then(async () => {
			let version = await playerHub.getVersion()
			this.log('info', 'PlayerWEB API version: ' + version)

			await playerRestClient.loadPlayerlist()
		})
	}

	updateModuleState() {
		this.updateVariableDefinitions()
		this.updateActions()
		this.updateFeedbacks()
		this.checkFeedbacks()
		this.updatePresets()
	}

	updateVariablesAndFeedbacks() {
		this.updateVariableDefinitions()
		this.updateFeedbacks()
		this.checkFeedbacks()
	}

	validName(name) {
		try {
			return name.replace(/[\W]/gi, '_')
		} catch (error) {
			this.log('debug', `Unable to generate validName for ${name}: ${error}`)
			return name
		}
	}

	defineVariable(variableId, name, value) {
		this.setVariableDefinitions([
			{
				variableId: variableId,
				name: name,
			},
		])

		this.setVariableValues({
			[variableId]: value,
		})
	}

	async playAllPlayers() {
		await playerHub.playAllPlayers()
	}

	async pauseAllPlayers() {
		await playerHub.pauseAllPlayers()
	}

	async stopAllPlayers() {
		await playerHub.stopAllPlayers()
	}

	async play(id) {
		await playerHub.play(id)
	}

	async pause(id) {
		await playerHub.pause(id)
	}

	async stop(id) {
		await playerHub.stop(id)
	}

	async getPreview(id) {
		await playerHub.getPreview(id)
	}

	async getPlaybackInfo(id) {
		await playerHub.getPlaybackInfo(id)
	}

	async goToStart(id) {
		await playerHub.goToStart(id)
	}

	async goToEnd(id) {
		await playerHub.goToEnd(id)
	}

	async nextFrame(id) {
		await playerHub.nextFrame(id)
	}

	async previousFrame(id) {
		await playerHub.previousFrame(id)
	}

	async seekBy(id, seconds) {
		await playerHub.seekBy(id, seconds)
	}

	async setPlaybackRate(id, rate) {
		await playerHub.setPlaybackRate(id, rate)
	}

	async increasePlaybackRate(id) {
		let player = this.getPlayerById(id)
		if (!player) return

		let playbackRateIndex = this.findCurrentPlaybackRateIndex(player)
		if (playbackRateIndex == -1) return

		let newIndex = playbackRateIndex + 1
		if (newIndex >= this.validPlaybackRates.length) return

		let newRate = this.validPlaybackRates[newIndex]
		await this.setPlaybackRate(player.id, newRate)
	}

	async decreasePlaybackRate(id) {
		let player = this.getPlayerById(id)
		if (!player) return

		let playbackRateIndex = this.findCurrentPlaybackRateIndex(player)
		if (playbackRateIndex == -1) return

		let newIndex = playbackRateIndex - 1
		if (newIndex < 0) return

		let newRate = this.validPlaybackRates[newIndex]
		await this.setPlaybackRate(player.id, newRate)
	}

	findCurrentPlaybackRateIndex(player) {
		if (!player.playbackInfo) return -1

		let currentPlaybackRate = player.playbackInfo.playbackRate
		return this.validPlaybackRates.findIndex((x) => x == currentPlaybackRate)
	}

	getPlayerById(id) {
		if (!this.state.playerlist.items) return null

		return this.state.playerlist.items.find((x) => x.id == id)
	}

	generatePlayerListActionChoices() {
		return this.state.playerlist && this.state.playerlist.items
			? this.state.playerlist.items.map((player) => {
					return {
						id: player.id,
						label: player.name,
					}
				})
			: []
	}

	generatePlaybackRatesActionChoices() {
		return this.validPlaybackRates.map((item) => {
			return {
				id: item,
				label: item,
			}
		})
	}

	getPlayerPreview(id) {
		this.getPreview(id).then(() => {
			let key = 'player-' + id
			this.removePreviewTimer(id)
			this.previewTimers[key] = setTimeout(() => this.getPlayerPreview(id), this.config.requestInterval)
		})
	}

	removePreviewTimer(id) {
		let key = 'player-' + id
		if (this.previewTimers[key]) {
			let timer = this.previewTimers[key]
			clearTimeout(timer)
			delete this.previewTimers[key]
		}
	}

	removeAllPreviewTimers(id) {
		for (let key in this.previewTimers) {
			clearTimeout(this.previewTimers[key])
		}
		this.previewTimers = {}
	}

	addPreviewRequest(id) {
		const exists = this.pendingPreviewRequests.some((x) => x === id)
		if (exists) return

		this.pendingPreviewRequests.push(id)
	}

	processPreviewRequest() {
		for (let i = this.pendingPreviewRequests.length - 1; i >= 0; i--) {
			const id = this.pendingPreviewRequests[i]

			let player = this.getPlayerById(id)
			if (!player) continue

			this.pendingPreviewRequests.splice(i, 1)
			this.subscribeFeedbacks('player-preview')
		}
	}

	getPlaylist(id) {
		playerHub.getPlaylist(id)
	}

	getPlayerPlaybackInfo(id) {
		this.getPlaybackInfo(id).then(() => {
			let key = 'player-' + id
			this.removePlaybackInfoTimer(id)
			this.playbackInfoTimers[key] = setTimeout(() => this.getPlayerPlaybackInfo(id), this.config.requestInterval)
		})
	}

	removePlaybackInfoTimer(id) {
		let key = 'player-' + id
		if (this.playbackInfoTimers[key]) {
			let timer = this.playbackInfoTimers[key]
			clearTimeout(timer)
			delete this.playbackInfoTimers[key]
		}
	}

	removeAllPlaybackInfoTimers() {
		for (let key in this.playbackInfoTimers) {
			clearTimeout(this.playbackInfoTimers[key])
		}
		this.playbackInfoTimers = {}
	}

	addPlaybackInfoRequest(id) {
		const exists = this.pendingPlaybackInfoRequests.some((x) => x === id)
		if (exists) return

		this.pendingPlaybackInfoRequests.push(id)
	}

	processPlaybackInfoRequest() {
		for (let i = this.pendingPlaybackInfoRequests.length - 1; i >= 0; i--) {
			const id = this.pendingPlaybackInfoRequests[i]

			let player = this.getPlayerById(id)
			if (!player) continue

			this.pendingPlaybackInfoRequests.splice(i, 1)
			this.subscribeFeedbacks('player-preview')
		}
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
