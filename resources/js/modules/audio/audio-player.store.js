define(['dispatcher', 'utils'], function(dispatcher, utils) {
	'use strict';

	var eventEmitter = new utils.EventEmitter();

	var song = null;
	var playlistId = null;
	var playlist = null;
	var index = null;
	var paused = false;

	var _handleEvent = function(e) {
		if (e.type === 'audio-song-changed') {
			if (e.song === song) return;
			if (e.playlistId && e.playlistId !== playlistId) {
				console.log('audio error. wrong playlist id specified');
				return;
			}

			song = e.song;

			if (song) {
				index = song.index;
			} else {
				index = null;
			}

			paused = e.paused;

			eventEmitter.dispatch();
		}
		if (e.type === 'audio-set-playlist') {

			if (playlistId === e.id) return;

			playlist = e.playlist;
			playlistId = e.id;
			eventEmitter.dispatch();
		}
		if (e.type === 'audio-unset-playlist') {
			if (e.id && playlistId !== e.id) return;

			playlist = null;
			playlistId = null;

			eventEmitter.dispatch();
		}
	}

	var getData = function() {
		return {
			song: song,
			playlistId: playlistId,
			playlist: playlist,
			index: index,
			paused: paused
		}
	}

	var _init = function() {
		dispatcher.subscribe(_handleEvent);
	}

	_init();

	return {
		eventEmitter: eventEmitter,
		getData: getData
	}
});