define([
	'dispatcher',
	'popup/popup.store',
	'slide-scroll/slide-scroll.store',
	'audio/audio-player.store',
	'preloader/preloader.store'
], function(
	dispatcher,
	popupStore,
	slideStore,
	playerStore,
	preloaderStore
) {
	"use strict";

	var elementProto = Object.create(HTMLElement.prototype);

	// elementProto.handlePopupStore = function() {
	// 	var active = popupStore.getData().active;
	// 	var pw = document.getElementsByClassName('page-wrapper')[0];

	// 	if (active) {
	// 		dispatcher.dispatch({
	// 			type: 'scheme-popup-change',
	// 			state: 'active'
	// 		});
	// 	}
	// 	if (!active) {
	// 		dispatcher.dispatch({
	// 			type: 'scheme-popup-change',
	// 			state: 'inactive'
	// 		});
	// 	}
	// }

	elementProto.handleSlideStore = function() {
		var preloadComplete = preloaderStore.getData().complete;
		var storeData = slideStore.getData().items['beat-slides'];
		var paused = playerStore.getData().paused;

		if (!preloadComplete) return;
		if (!storeData) {
			console.warn('beat-slides data is missing in slide-scroll.store');
			return;
		}

		if (storeData.index === this._songIndex) return;
		this._songIndex = storeData.index;

		if ((Modernizr && !Modernizr.touchevents) || !paused) {
			dispatcher.dispatch({
				type: 'audio-play',
				index: storeData.index,
				id: 'beats'
			});
		} else {
			dispatcher.dispatch({
				type: 'audio-load',
				index: storeData.index,
				id: 'beats'
			});
		}
	}

	elementProto.handlePlayerStore = function() {
		var song = playerStore.getData().song;
		
		if (!song) return;
		if (song.index === this._songIndex) return;

		this._songIndex = song.index;

		dispatcher.dispatch({
			type: 'slide-scroll-to',
			index: this._songIndex,
			id: 'beat-slides'
		});
	}

	elementProto.handlePreloader = function() {
		var complete = preloaderStore.getData().complete;
		var self = this;
		if (!complete) return;

		// self.handlePopupStore();
		self.handleSlideStore();
		self.handlePlayerStore();
	}

	elementProto.createdCallback = function() {
		this._songIndex = null;
		// this.handlePopupStore = this.handlePopupStore.bind(this);
		this.handleSlideStore = this.handleSlideStore.bind(this);
		this.handlePlayerStore = this.handlePlayerStore.bind(this);
		this.handlePreloader = this.handlePreloader.bind(this);
	}
	elementProto.attachedCallback = function() {
		this._songIndex = null;

		dispatcher.dispatch({
			type: 'scheme-color-change',
			scheme: 'bright'
		});

		dispatcher.dispatch({
			type: 'load-playlist',
			id: 'beats'
		});

		this.handlePreloader();

		preloaderStore.eventEmitter.subscribe(this.handlePreloader);
		popupStore.eventEmitter.subscribe(this.handlePopupStore);
		slideStore.eventEmitter.subscribe(this.handleSlideStore);
		playerStore.eventEmitter.subscribe(this.handlePlayerStore);
	}
	elementProto.detachedCallback = function() {
		preloaderStore.eventEmitter.unsubscribe(this.handlePreloader);
		popupStore.eventEmitter.unsubscribe(this.handlePopupStore);
		slideStore.eventEmitter.unsubscribe(this.handleSlideStore);
		playerStore.eventEmitter.unsubscribe(this.handlePlayerStore);

		dispatcher.dispatch({
			type: 'audio-unset-playlist',
			id: 'beats'
		});
	}

	document.registerElement('beats-helper', {
		prototype: elementProto
	});
});