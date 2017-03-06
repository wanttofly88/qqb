define([
	'dispatcher',
	'scheme/scheme.store',
	'preloader/preloader.store',
	'audio/audio-player.store',
], function(
	dispatcher,
	schemeStore,
	preloaderStore,
	playerStore

) {
	"use strict";

	var elementProto = Object.create(HTMLElement.prototype);

	elementProto.handlePreloader = function() {
		var complete = preloaderStore.getData().complete;
		var self = this;
		var playerData = playerStore.getData();
		var paused = playerStore.getData().paused;

		if (!complete) return;

		if (playerData.index === 0 && playerData.song === null) { // ambient
			return;
		}

		dispatcher.dispatch({
			type: 'audio-unset-playlist'
		});

		if ((Modernizr && !Modernizr.touchevents) || !paused) {
			dispatcher.dispatch({
				type: 'audio-play',
				index:  0,
			});
		} else {
			dispatcher.dispatch({
				type: 'audio-load',
				index:  0,
			});
		}
	}

	elementProto.createdCallback = function() {
		this.handlePreloader = this.handlePreloader.bind(this);
	}
	elementProto.attachedCallback = function() {
		dispatcher.dispatch({
			type: 'scheme-color-change',
			scheme: 'dark'
		});
		this.handlePreloader();
		preloaderStore.eventEmitter.subscribe(this.handlePreloader);
	}
	elementProto.detachedCallback = function() {
		preloaderStore.eventEmitter.unsubscribe(this.handlePreloader);
	}

	document.registerElement('albums-helper', {
		prototype: elementProto
	});
});