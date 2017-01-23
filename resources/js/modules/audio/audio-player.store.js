define(['dispatcher', 'utils'], function(dispatcher, utils) {
	'use strict';

	var eventEmitter = new utils.EventEmitter();

	var song = null;
	var playlistId = null;
	var playlist = null;
	var index = false;

	var _handleEvent = function(e) {
		if (e.type === 'audio-song-changed') {
			if (e.song.index === index) return;
			if (e.playlistId && e.playlistId !== playlistId) {
				console.log('audio error. wrong playlist id specified');
				return;
			}

			song = e.song;
			index = song.index;

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
			index: index
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