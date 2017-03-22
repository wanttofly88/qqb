define(['dispatcher', 'popup/popup.store'], function(dispatcher, popupStore) {

	"use strict";

	var _handleStore = function() {
		var active = popupStore.getData().active;
		var body = document.getElementsByTagName('body')[0];
		var pw = document.getElementsByClassName('page-wrapper')[0];

		if (active) {
			dispatcher.dispatch({
				type: 'audio-low-freq'
			});
			dispatcher.dispatch({
				type: 'scheme-popup-change',
				state: 'active'
			});
			body.classList.add('prevent-scroll');
		} else {
			dispatcher.dispatch({
				type: 'audio-high-freq'
			});
			dispatcher.dispatch({
				type: 'scheme-popup-change',
				state: 'inactive'
			});
			body.classList.remove('prevent-scroll');
		}
	}

	var _init = function() {
		popupStore.eventEmitter.subscribe(_handleStore);
	}

	_init()
});