define(['dispatcher', 'utils'], function(dispatcher, utils) {
	'use strict';

	var eventEmitter = new utils.EventEmitter();
	var status = 'none';

	var _handleEvent = function(e) {
		if (e.type === 'preload-starting') {
			status = 'starting';
			eventEmitter.dispatch();
		}
		if (e.type === 'preload-finishing') {
			status = 'finishing';
			eventEmitter.dispatch();
		}
		if (e.type === 'preload-complete') {
			status = 'complete';
			eventEmitter.dispatch();
		}
	}

	var getData = function() {
		return {
			status: status
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