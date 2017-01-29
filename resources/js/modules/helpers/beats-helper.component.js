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

	var elementProto = function() {
		var handlePopupStore = function() {
			var active = popupStore.getData().active;
			var pw = document.getElementsByClassName('page-wrapper')[0];

			if (active) {
				pw.setAttribute('data-scheme', 'dark');
			}
			if (!active) {
				pw.setAttribute('data-scheme', 'bright');
			}
		}

		var handleSlideStore = function() {
			var storeData = slideStore.getData().items['beat-slides'];
			if (!storeData) {
				console.warn('beat-slides data is missing in slide-scroll.store');
				return;
			}

			if (storeData.index === this._songIndex) return;
			this._songIndex = storeData.index;

			dispatcher.dispatch({
				type: 'audio-play',
				index: storeData.index,
				id: 'beats'
			});
		}

		var handlePlayerStore = function() {
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

		var handlePreloader = function() {
			var complete = preloaderStore.getData().complete;
			var self = this;
			if (!complete) return;

			setTimeout(function() {
				self._handlePopupStore();
				self._handleSlideStore();
				self._handlePlayerStore();
			}, 0);
		}

		var createdCallback = function() {
			this._songIndex = null;
			this._handleStore = handlePopupStore.bind(this);
			this._handlePopupStore = handlePopupStore.bind(this);
			this._handleSlideStore = handleSlideStore.bind(this);
			this._handlePlayerStore = handlePlayerStore.bind(this);
			this._handlePreloader = handlePreloader.bind(this);
		}
		var attachedCallback = function() {
			this._songIndex = null;

			dispatcher.dispatch({
				type: 'load-playlist',
				id: 'beats'
			});
			dispatcher.dispatch({
				type: 'audio-cache',
				index: 0,
				id: 'beats'
			});

			this._handlePreloader();

			preloaderStore.eventEmitter.subscribe(this._handlePreloader);
			popupStore.eventEmitter.subscribe(this._handlePopupStore);
			slideStore.eventEmitter.subscribe(this._handleSlideStore);
			playerStore.eventEmitter.subscribe(this._handlePlayerStore);
		}
		var detachedCallback = function() {
			preloaderStore.eventEmitter.unsubscribe(this._handlePreloader);
			popupStore.eventEmitter.unsubscribe(this._handlePopupStore);
			slideStore.eventEmitter.unsubscribe(this._handleSlideStore);
			playerStore.eventEmitter.unsubscribe(this._handlePlayerStore);

			dispatcher.dispatch({
				type: 'audio-unset-playlist',
				id: 'beats'
			});
		}


		return {
			createdCallback: createdCallback,
			attachedCallback: attachedCallback,
			detachedCallback: detachedCallback
		}
	}();

	Object.setPrototypeOf(elementProto, HTMLElement.prototype);
	document.registerElement('beats-helper', {
		prototype: elementProto
	});
});