define([
	'dispatcher',
	'audio/audio-player.store'
], function(
	dispatcher,
	playerStore
) {
	"use strict";

	var elementProto = Object.create(HTMLButtonElement.prototype);

	elementProto.handleStore = function() {
		var paused = playerStore.getData().paused;

		if (!paused) {
			this.innerHTML = '[Pause]';
		} else {
			this.innerHTML = '[Play]';
		}
	}

	elementProto.handleClick = function() {
		var paused = playerStore.getData().paused;
		if (!paused) {
			dispatcher.dispatch({
				type: 'audio-stop'
			});
		} else {
			dispatcher.dispatch({
				type: 'audio-play'
			});
		}
	}

	elementProto.createdCallback = function() {
		this.handleClick = this.handleClick.bind(this);
		this.handleStore = this.handleStore.bind(this);
	}
	elementProto.attachedCallback = function() {
		this.addEventListener('click', this.handleClick);
		playerStore.eventEmitter.subscribe(this.handleStore);
	}
	elementProto.detachedCallback = function() {
		this.removeEventListener('click', this.handleClick);
		playerStore.eventEmitter.unsubscribe(this.handleStore);
	}

	document.registerElement('audio-pause', {
		extends: 'button',
		prototype: elementProto
	});
});