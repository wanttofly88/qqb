define(['audio/audio.dispatcher', 'utils'], function(dispatcher, utils) {
	'use strict';

	var eventEmitter = new utils.EventEmitter();

	var time = 0;
	var duration = 0;
	var song = null;
	var audioData = null;

	var _handleEvent = function(e) {
		if (e.type === 'audio-data-changed') {
			time = e.time;
			duration = e.duration;
			audioData = e.audioData;
			eventEmitter.dispatch();
		}
	}

	var getData = function() {
		return {
			time: time,
			duration: duration,
			song: song,
			audioData: audioData
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