define(['dispatcher', 'utils'], function(dispatcher, utils) {
	'use strict';

	var complete = false;
	var eventEmitter = new utils.EventEmitter();

	var _handleEvent = function(e) {
		if (e.type === 'preload-complete') {
			complete = true;
			eventEmitter.dispatch();
		}
	}

	var getData = function() {
		return {
			complete: complete
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