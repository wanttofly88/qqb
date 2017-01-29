define([
	'dispatcher',
	'audio/audio-player.store'
], function(
	dispatcher,
	playerStore
) {
	"use strict";

	var elementProto = function() {
		var handleStore = function() {
			var song = playerStore.getData().song;

			if (song) {
				this.innerHTML = '[Pause]';
			} else {
				this.innerHTML = '[Play]';
			}
		}

		var handleClick = function() {
			var song = playerStore.getData().song;

			if (song) {
				dispatcher.dispatch({
					type: 'audio-stop'
				});
			} else {
				dispatcher.dispatch({
					type: 'audio-play'
				});
			}
		}

		var createdCallback = function() {
			this._handleClick = handleClick.bind(this);
			this._handleStore = handleStore.bind(this);
		}
		var attachedCallback = function() {
			this.addEventListener('click', this._handleClick);
			playerStore.eventEmitter.subscribe(this._handleStore);
		}
		var detachedCallback = function() {
			this.removeEventListener('click', this._handleClick);
			playerStore.eventEmitter.unsubscribe(this._handleStore);
		}


		return {
			createdCallback: createdCallback,
			attachedCallback: attachedCallback,
			detachedCallback: detachedCallback
		}
	}();

	Object.setPrototypeOf(elementProto, HTMLButtonElement.prototype);
	document.registerElement('audio-pause', {
		extends: 'button',
		prototype: elementProto
	});});