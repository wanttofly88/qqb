define(['dispatcher', 'popup/popup.store'], function(dispatcher, popupStore) {

	"use strict";

	var audioPaused = false;
	var audioLowFreq = false;

	var _handleStore = function() {
		var active = popupStore.getData().active;
		var body = document.getElementsByTagName('body')[0];
		var pw = document.getElementsByClassName('page-wrapper')[0];
		var component;

		if (active) {
			component = document.querySelector('popup-component[data-id="' + active + '"');

			if (!component.classList.contains('video-popup') &&
				!component.classList.contains('merch-popup')) {
				audioLowFreq = true;
				dispatcher.dispatch({
					type: 'audio-low-freq'
				});
			}

			if (!component.classList.contains('no-fade')) {
				dispatcher.dispatch({
					type: 'scheme-popup-change',
					state: 'active'
				});
			}

			if (component.classList.contains('video-popup')) {
				audioPaused = true;
				dispatcher.dispatch({
					type: 'audio-stop'
				});
			}

			body.classList.add('prevent-scroll');
		} else {

			if (audioLowFreq) {
				audioLowFreq = false;
				dispatcher.dispatch({
					type: 'audio-high-freq'
				});
			}

			dispatcher.dispatch({
				type: 'scheme-popup-change',
				state: 'inactive'
			});


			if (audioPaused) {
				audioPaused = false;
				dispatcher.dispatch({
					type: 'audio-play'
				});
			}

			body.classList.remove('prevent-scroll');
		}
	}

	var _init = function() {
		popupStore.eventEmitter.subscribe(_handleStore);
	}

	_init()
});