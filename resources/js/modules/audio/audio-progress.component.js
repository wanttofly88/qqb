define([
	'dispatcher',
	'audio/audio-data.store'
], function(
	dispatcher,
	dataStore
) {
	"use strict";

	var elementProto = Object.create(HTMLElement.prototype);

	elementProto.handleStore = function() {
		var time = dataStore.getData().time;
		var minutes = Math.floor(time / 60);
		var seconds = Math.floor(time % 60);
		var milliseconds = (time - Math.floor(time)).toFixed(3);

		if (seconds < 10) {
			seconds = '0' + seconds;
		}
		if (minutes < 10) {
			minutes = '0' + minutes;
		}

		seconds = seconds + '.';
		minutes = minutes + '.';
		milliseconds = milliseconds.substring(2);

		this._mnElement.innerHTML = minutes;
		this._scElement.innerHTML = seconds;
		this._msElement.innerHTML = milliseconds;
	}

	elementProto.createdCallback = function() {
		this.handleStore = this.handleStore.bind(this);
	}
	elementProto.attachedCallback = function() {
		this._mnElement = document.getElementsByClassName('mn')[0];
		this._scElement = document.getElementsByClassName('sc')[0];
		this._msElement = document.getElementsByClassName('ms')[0];

		dataStore.eventEmitter.subscribe(this.handleStore);
	}
	elementProto.detachedCallback = function() {
		dataStore.eventEmitter.unsubscribe(this.handleStore);
	}

	document.registerElement('audio-progress', {
		prototype: elementProto
	});
});