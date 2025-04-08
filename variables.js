import { timeToString } from './utils'

export function getVariables() {
	const variables = []

	this.state?.playerlist.items?.forEach((player) => {
		if (!player) return

		let playerName = this.validName(player.name)

		variables.push({
			variableId: `player-${player.id}-name`,
			name: `Name of player ${player.name}`,
		})

		variables.push({
			variableId: `player-${player.id}-url`,
			name: `URL of player ${player.name}`,
		})

		this.setVariableValues({
			[`player-${player.id}-name`]: player.name,
			[`player-${player.id}-url`]: player.url,
		})

		if (player.status) {
			variables.push({
				variableId: `player-${player.id}-status`,
				name: `Status of player ${player.name}`,
			})

			this.setVariableValues({
				[`player-${player.id}-status`]: player.status,
			})
		}

		if (player.playbackInfo) {
			variables.push({
				variableId: `player-${player.id}-playback-status`,
				name: `Playback status of player ${player.name}`,
			})

			variables.push({
				variableId: `player-${player.id}-clip-position`,
				name: `Clip position of player ${player.name}`,
			})

			variables.push({
				variableId: `player-${player.id}-clip-duration`,
				name: `Clip duration of player ${player.name}`,
			})

			variables.push({
				variableId: `player-${player.id}-clip-remaining-time`,
				name: `Clip remaining time of player ${player.name}`,
			})

			variables.push({
				variableId: `player-${player.id}-playlist-position`,
				name: `Playlist position of player ${player.name}`,
			})

			variables.push({
				variableId: `player-${player.id}-playlist-duration`,
				name: `Playlist duration of player ${player.name}`,
			})

			variables.push({
				variableId: `player-${player.id}-playlist-remaining-time`,
				name: `Playlist remaining time of player ${player.name}`,
			})

			variables.push({
				variableId: `player-${player.id}-current-clip`,
				name: `Current clip of player ${player.name}`,
			})

			variables.push({
				variableId: `player-${player.id}-current-clip-index`,
				name: `Current clip index of player ${player.name}`,
			})

			variables.push({
				variableId: `player-${player.id}-playback-rate`,
				name: `Playback rate of player ${player.name}`,
			})

			variables.push({
				variableId: `player-${player.id}-clip-progress`,
				name: `Clip progress of player ${player.name}`,
			})

			variables.push({
				variableId: `player-${player.id}-playlist-progress`,
				name: `Playlist progress of player ${player.name}`,
			})

			this.setVariableValues({
				[`player-${player.id}-playback-status`]: player.playbackInfo.playbackStatus,
				[`player-${player.id}-clip-position`]: timeToString(player.playbackInfo.clipPosition),
				[`player-${player.id}-clip-duration`]: timeToString(player.playbackInfo.clipDuration),
				[`player-${player.id}-clip-remaining-time`]: timeToString(player.playbackInfo.clipRemainingTime),
				[`player-${player.id}-playlist-position`]: timeToString(player.playbackInfo.playlistPosition),
				[`player-${player.id}-playlist-duration`]: timeToString(player.playbackInfo.playlistDuration),
				[`player-${player.id}-playlist-remaining-time`]: timeToString(player.playbackInfo.playlistRemainingTime),
				[`player-${player.id}-current-clip`]: player.playbackInfo.currentClip,
				[`player-${player.id}-current-clip-index`]: player.playbackInfo.currentClipIndex,
				[`player-${player.id}-playback-rate`]: player.playbackInfo.playbackRate,
				[`player-${player.id}-clip-progress`]: player.playbackInfo.clipProgress,
				[`player-${player.id}-playlist-progress`]: player.playbackInfo.playlistProgress,
			})
		}

		if (player.playlist) {
			variables.push({
				variableId: `player-${player.id}-clip-count`,
				name: `Clip count of player ${player.name}`,
			})

			this.setVariableValues({
				[`player-${player.id}-clip-count`]: player.playlist.clipCount,
			})
		}
	})

	return variables
}
