define([
	'dispatcher',
	'scheme/scheme.store',
	'preloader/preloader.store',
	'audio/audio-player.store',
	'slide-scroll/slide-scroll.store',
], function(
	dispatcher,
	schemeStore,
	preloaderStore,
	playerStore,
	slideStore
) {
	"use strict";

	var elementProto = Object.create(HTMLElement.prototype);

	elementProto.handlePreloader = function() {
		var complete = preloaderStore.getData().complete;
		var self = this;
		var playerData = playerStore.getData();
		var paused = playerStore.getData().paused;

		if (!complete) return;

		if (playerData.index === 0 && playerData.song.name === '__ambient__') { // ambient
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

	elementProto.handleSlides = function() {
		var storeData = slideStore.getData().items['video-slides'];
		if (!storeData) {
			console.warn('beat-slides data is missing in slide-scroll.store');
			return;
		}

		if (this._slideIndex === storeData.index) return;
		this._slideIndex = storeData.index;

		dispatcher.dispatch({
			type: 'slider:to',
			index: this._slideIndex,
			id: 'video-slides'
		});
	}

	elementProto.createdCallback = function() {
		this.handlePreloader = this.handlePreloader.bind(this);
		this.handleSlides = this.handleSlides.bind(this);
		this._slideIndex = 0;
	}
	elementProto.attachedCallback = function() {
		dispatcher.dispatch({
			type: 'scheme-color-change',
			scheme: 'dark'
		});
		preloaderStore.eventEmitter.subscribe(this.handlePreloader);
		slideStore.eventEmitter.subscribe(this.handleSlides);
	}
	elementProto.detachedCallback = function() {
		preloaderStore.eventEmitter.unsubscribe(this.handlePreloader);
		slideStore.eventEmitter.unsubscribe(this.handleSlides);

	}

	document.registerElement('videos-helper', {
		prototype: elementProto
	});
});