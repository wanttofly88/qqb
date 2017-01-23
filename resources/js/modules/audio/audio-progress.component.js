define([
	'dispatcher',
	'audio/audio-data.store'
], function(
	dispatcher,
	dataStore
) {
	"use strict";

	var elementProto = function() {
		var handleStore = function() {
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

		var createdCallback = function() {
			this._handleStore = handleStore.bind(this);
		}
		var attachedCallback = function() {
			this._mnElement = document.getElementsByClassName('mn')[0];
			this._scElement = document.getElementsByClassName('sc')[0];
			this._msElement = document.getElementsByClassName('ms')[0];

			dataStore.eventEmitter.subscribe(this._handleStore);
		}
		var detachedCallback = function() {
			dataStore.eventEmitter.unsubscribe(this._handleStore);
		}


		return {
			createdCallback: createdCallback,
			attachedCallback: attachedCallback,
			detachedCallback: detachedCallback
		}
	}();

	Object.setPrototypeOf(elementProto, HTMLElement.prototype);
	document.registerElement('audio-progress', {
		prototype: elementProto
	});
});