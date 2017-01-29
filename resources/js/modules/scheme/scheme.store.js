define(['dispatcher', 'utils'], function(dispatcher, utils) {
	'use strict';

	var eventEmitter = new utils.EventEmitter();

	var baseScheme = 'bright';
	var popupState = 'inactive';
	var scheme = 'bright';

	var _setScheme = function() {
		if (popupState === 'active') {
			scheme = 'dark';
		} else {
			scheme = baseScheme;
		}
	}

	var _handleEvent = function(e) {
		if (e.type === 'scheme-color-change') {
			if (baseScheme === e.scheme) return;
			baseScheme = e.scheme;
			_setScheme();

			eventEmitter.dispatch();
		}
		if (e.type === 'scheme-popup-change') {
			if (e.popupState === e.state) return;
			popupState = e.state;
			_setScheme();

			eventEmitter.dispatch();
		}
	}

	var getData = function() {
		return {
			baseScheme: baseScheme,
			popupState: popupState,
			scheme: scheme
		}
	}

	var _init = function() {
		dispatcher.subscribe(_handleEvent);
	}

	_init();

	return {
		eventEmitter: eventEmitter,
		getData: getData
	}
});