define(['dispatcher', 'utils'], function(dispatcher, utils) {
	'use strict';

	var active = false;

	var eventEmitter = new utils.EventEmitter();

	var _handleEvent = function(e) {
		if (e.type === 'popup-toggle') {
			if (active === e.id) {
				active = false;
			} else {
				active = e.id;
			}

			eventEmitter.dispatch({
				type: 'change'
			});
		}

		if (e.type === 'popup-open') {
			if (active === e.id) return;
			active = e.id;

			eventEmitter.dispatch({
				type: 'change'
			});
		}

		if (e.type === 'popup-close') {
			if (active === false) return;
			active = false;

			eventEmitter.dispatch({
				type: 'change'
			});
		}

		if (e.type === 'popup-close-all') {
			if (active === false) return;
			active = false;

			eventEmitter.dispatch({
				type: 'change'
			});
		}
			
	}

	var getData = function() {
		return {
			active: active
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