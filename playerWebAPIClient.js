const { InstanceStatus } = require('@companion-module/base')
const axios = require('axios')
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'

export let playerRestClient = {}
export let playerHub = {}

export function initSignalRClient(state, config, moduleInstance) {
	let connection = null
	let closedManually = false

	//#region methods

	playerHub.connectToPlayer = (id) => {
		return startedPromise.then(() => connection.invoke('ConnectToPlayer', id))
	}

	playerHub.playAllPlayers = () => {
		return startedPromise
			.then(() => connection.invoke('PlayAllPlayers'))
			.catch((error) => {
				console.error(error)
				throw error
			})
	}

	playerHub.pauseAllPlayers = () => {
		return startedPromise
			.then(() => connection.invoke('PauseAllPlayers'))
			.catch((error) => {
				console.error(error)
				throw error
			})
	}

	playerHub.stopAllPlayers = () => {
		return startedPromise
			.then(() => connection.invoke('StopAllPlayers'))
			.catch((error) => {
				console.error(error)
				throw error
			})
	}

	playerHub.play = (id) => {
		return startedPromise
			.then(() => connection.invoke('Play', id))
			.catch((error) => {
				console.error(error)
				throw error
			})
	}

	playerHub.pause = (id) => {
		return startedPromise
			.then(() => connection.invoke('Pause', id))
			.catch((error) => {
				console.error(error)
				throw error
			})
	}

	playerHub.stop = (id) => {
		return startedPromise
			.then(() => connection.invoke('Stop', id))
			.catch((error) => {
				console.error(error)
				throw error
			})
	}

	playerHub.getPreview = (playerId) => {
		return startedPromise
			.then(() => connection.invoke('GetPreview', playerId))
			.then((result) => {
				if (result) {
					playerRestClient.setPlayerPreview({
						playerId: playerId,
						preview: result,
					})
				}
			})
			.catch((error) => {
				console.error(error)
				throw error
			})
	}

	playerHub.getPlaybackInfo = (playerId) => {
		return startedPromise
			.then(() => connection.invoke('GetPlaybackInfo', playerId))
			.then((result) => {
				if (result) {
					playerRestClient.setPlaybackInfo({
						playerId: playerId,
						playbackInfo: result,
					})
				}
			})
			.catch((error) => {
				console.error(error)
				throw error
			})
	}

	playerHub.goToStart = (id) => {
		return startedPromise
			.then(() => connection.invoke('GoToStart', id))
			.catch((error) => {
				console.error(error)
				throw error
			})
	}

	playerHub.goToEnd = (id) => {
		return startedPromise
			.then(() => connection.invoke('GoToEnd', id))
			.catch((error) => {
				console.error(error)
				throw error
			})
	}

	playerHub.nextFrame = (id) => {
		return startedPromise
			.then(() => connection.invoke('NextFrame', id))
			.catch((error) => {
				console.error(error)
				throw error
			})
	}

	playerHub.previousFrame = (id) => {
		return startedPromise
			.then(() => connection.invoke('PreviousFrame', id))
			.catch((error) => {
				console.error(error)
				throw error
			})
	}

	playerHub.seekBy = (id, seconds) => {
		return startedPromise
			.then(() => connection.invoke('SeekBy', id, seconds))
			.catch((error) => {
				console.error(error)
				throw error
			})
	}

	playerHub.setPlaybackRate = (playerId, rate) => {
		return startedPromise
			.then(() => connection.invoke('SetPlaybackRate', playerId, rate))
			.catch((error) => {
				console.error(error)
				throw error
			})
	}

	playerHub.getPlaylist = (playerId) => {
		return startedPromise
			.then(() => connection.invoke('GetPlaylist', playerId))
			.then((result) => playerRestClient.setPlayerPlaylist(result))
			.catch((error) => {
				console.error(error)
				throw error
			})
	}

	playerHub.getVersion = () => {
		return startedPromise
			.then(() => {
				return connection.invoke('GetVersion')
			})
			.catch((error) => {
				throw error
			})
	}

	//#endregion

	let startedPromise = null

	function start() {
		moduleInstance.log('debug', 'Connecting to hub...')

		moduleInstance.updateStatus(InstanceStatus.Connecting)

		closedManually = false
		connection = buildConnection(state)
		setConnectionEvents(connection, state, playerHub)

		startedPromise = connection
			.start()
			.then(() => {
				state.isConnected = true

				moduleInstance.log('debug', 'Connected to hub.')
				moduleInstance.updateStatus(InstanceStatus.Ok)
				moduleInstance.updateModuleState()
			})
			.catch((err) => {
				moduleInstance.log('debug', err)

				state.isConnected = false

				if (err.statusCode === 401) {
					moduleInstance.updateStatus(InstanceStatus.AuthenticationFailure, 'Cannot login.')
				} else {
					moduleInstance.updateStatus(InstanceStatus.ConnectionFailure, 'Cannot connect to PlayerWeb API.')
					return new Promise((resolve, reject) => {
						setTimeout(() => start().then(resolve).catch(reject), 5000)
					})
				}
			})
		return startedPromise
	}

	function stop() {
		closedManually = true
		if (connection) connection.stop()
	}

	playerHub.startSignalRClient = () => start()
	playerHub.stopSignalRClient = () => stop()

	function buildConnection(state) {
		return new HubConnectionBuilder()
			.withUrl(config.webAPIUrl + '/playerhub', {
				accessTokenFactory: () => (state.token !== null ? state.token : ''),
			})
			.configureLogging(LogLevel.Information)
			.build()
	}

	//#region  events
	function setConnectionEvents(connection, state, playerHub) {
		connection.on('Connected', (result) => {
			playerRestClient.setPlayerStatus(result.playerId, 'connected')
		})

		connection.on('Connecting', (result) => {
			playerRestClient.setPlayerStatus(result.playerId, 'connecting')
		})

		connection.on('ConnectionClosed', (result) => {
			playerRestClient.setPlayerStatus(result.playerId, 'disconnected')
		})

		connection.on('ConnectionError', (result) => {
			playerRestClient.setPlayerStatus(result.playerId, 'disconnected')
		})

		connection.on('PlaylistUpdated', (result) => {
			playerRestClient.setPlayerPlaylist(result)
		})

		connection.on('OutputDeviceUpdated', (result) => {
			console.log('OutputDeviceUpdated')
			console.log(result)
		})

		connection.on('OutputFormatUpdated', (result) => {
			console.log('OutputFormatUpdated')
			console.log(result)
		})

		connection.on('PlaybackStateChanged', () => {})

		connection.on('PlaybackRateChanged', () => {})

		connection.on('PlayerRemoved', (id) => {
			playerRestClient.removePlayerFromStore(id)
		})

		connection.on('PlayerAdded', (player) => {
			playerRestClient.addPlayerToStore(player)
		})

		connection.on('PlayerUpdated', (player) => {
			playerRestClient.updatePlayerInTheStore(player)
		})

		connection.onclose(() => {
			moduleInstance.updateStatus(InstanceStatus.Disconnected)
			state.isConnected = false

			if (!closedManually) start()
		})
	}

	//#endregion
}

export function initRestClient(state, config, moduleInstance) {
	axios.interceptors.request.use((setting) => {
		if (state.token) setting.headers['Authorization'] = 'Bearer ' + state.token

		return setting
	})

	playerRestClient.login = () => {
		axios
			.post(config.webAPIUrl + '/users/login', {
				userName: config.userName,
				password: config.password,
			})
			.then(async (res) => {
				moduleInstance.log('debug', 'User logged in.')

				let token = res.data.token.token
				config.token = token
				state.token = token
				state.isAuthenticated = true

				moduleInstance.saveConfig(config)
				await moduleInstance.initAPI()
			})
			.catch((err) => {
				state.isAuthenticated = false

				if (err && err.response && err.response.status && err.response.status == 400) {
					moduleInstance.log('debug', 'Cannot login.')
					moduleInstance.updateStatus(InstanceStatus.AuthenticationFailure, 'Cannot login.')
				} else {
					moduleInstance.log('debug', 'Cannot connect to PlayerWeb API.')
					moduleInstance.updateStatus(InstanceStatus.ConnectionFailure, 'Cannot connect to PlayerWeb API.')
				}
			})
	}

	playerRestClient.getCurrentUserInfo = () => {
		axios
			.get(config.webAPIUrl + '/users/getcurrentuserinfo')
			.then(async (res) => {
				moduleInstance.log('debug', 'Token is valid.')
				await moduleInstance.initAPI()
			})
			.catch((err) => {
				moduleInstance.log('debug', 'Invalid token.')

				moduleInstance.updateStatus(InstanceStatus.AuthenticationFailure, 'Invalid token.')
				config.token = null
				state.token = null

				moduleInstance.log('debug', 'Reinitializing...')

				moduleInstance.saveConfig(config)
				moduleInstance.init(config)
			})
	}

	playerRestClient.setPlayerlistStatus = (status) => {
		state.playerlist.status = status
	}

	playerRestClient.loadPlayerlist = () => {
		playerRestClient.setPlayerlistStatus('loading')

		axios
			.get(config.webAPIUrl + '/players')
			.then(async (res) => {
				moduleInstance.log('debug', 'Player list received.')
				console.log(res.data)

				let items = res.data.map((obj) => ({
					...obj,
					status: 'disconnected',
					preview: null,
				}))

				state.playerlist.items = items

				playerRestClient.setPlayerlistStatus('loaded')

				items.forEach((player) => {
					playerRestClient.retryPlayerConnection(player.id)
				})

				moduleInstance.updateModuleState()
			})
			.catch((err) => {
				moduleInstance.log('error', 'Cannot get player list.')
				moduleInstance.log('error', JSON.stringify(err))
			})
	}

	playerRestClient.setPlayerStatus = (id, status) => {
		if (state.playerlist.items === null) return

		let players = state.playerlist.items.filter((x) => x.id == id)

		players.forEach((player) => {
			player.status = status
		})

		// Start preview and playback timers
		if (status === 'connected') {
			moduleInstance.getPlayerPlaybackInfo(id)
			moduleInstance.getPlayerPreview(id)
			moduleInstance.getPlaylist(id)
		}

		moduleInstance.updateModuleState()
	}

	playerRestClient.setPlayerPlaylist = (payload) => {
		if (state.playerlist.items == null) return

		let players = state.playerlist.items.filter((x) => x.id == payload.playerId)

		players.forEach((player) => {
			if (payload.playlistInfo) player.playlist = payload.playlistInfo
		})
	}

	playerRestClient.removePlayerFromStore = (id) => {
		if (state.playerlist.items == null) return

		let index = state.playerlist.items.findIndex(function (i) {
			return i.id === id
		})

		if (index < 0) return

		state.playerlist.items.splice(index, 1)

		moduleInstance.updateModuleState()
	}

	playerRestClient.addPlayerToStore = (player) => {
		if (state.playerlist.items == null) {
			state.playerlist.items = []
		}

		let index = state.playerlist.items.findIndex(function (i) {
			return i.id === player.id
		})

		if (index >= 0) return

		state.playerlist.items.push(player)

		moduleInstance.updateModuleState()
	}

	playerRestClient.updatePlayerInTheStore = (player) => {
		if (state.playerlist.items == null) return

		let currentPlayer = state.playerlist.items.find((x) => x.id == player.id)
		if (!currentPlayer) return

		let index = state.playerlist.items.findIndex((x) => x.id == player.id)
		if (index < 0) return

		let item = {
			...currentPlayer,
			...player,
		}

		state.playerlist.items[index] = item

		moduleInstance.updateModuleState()
	}

	playerRestClient.retryPlayerConnection = (id) => {
		moduleInstance.log('debug', 'Connecting to player with id ' + id)

		if (state.playerlist === null || state.playerlist.items === null) return

		let player = state.playerlist.items.find((x) => x.id === id)
		if (!player) return

		if (player.status === 'connecting' || player.status === 'connected') return

		playerRestClient.setPlayerStatus(id, 'connecting')

		playerHub
			.connectToPlayer(player.id)
			.then((result) => {
				let status = ''
				switch (result.status) {
					case 0:
						status = 'connected'
						break
					case 1:
						status = 'connecting'
						break
					case 2:
						status = 'disconnected'
						break
					default:
						status = 'n/a'
						break
				}

				moduleInstance.log('debug', 'Player with id ' + player.id + ' status: ' + status)
				playerRestClient.setPlayerStatus(result.playerId, status)
			})
			.catch((error) => {
				playerRestClient.setPlayerStatus(id, 'disconnected')
				moduleInstance.log('error', error)
			})
	}

	playerRestClient.setPlayerPreview = (payload) => {
		if (state.playerlist.items == null) return

		let players = state.playerlist.items.filter((x) => x.id == payload.playerId)

		players.forEach((player) => {
			if (payload.preview) player.preview = payload.preview
		})

		// TODO: test
		//moduleInstance.updateModuleState()
	}

	playerRestClient.setPlaybackInfo = (payload) => {
		if (state.playerlist.items == null) return

		let players = state.playerlist.items.filter((x) => x.id == payload.playerId)

		players.forEach((player) => {
			if (payload.playbackInfo) player.playbackInfo = payload.playbackInfo
		})

		// TODO: test
		moduleInstance.updateVariablesAndFeedbacks()
	}
}
