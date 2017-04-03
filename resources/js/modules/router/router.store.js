define(['dispatcher', 'utils'], function(dispatcher, utils) {
	'use strict';

	var eventEmitter = new utils.EventEmitter();
	var routing = false;
	var page = {};

	var _handleEvent = function(e) {
		if (e.type === 'router-page-change') {
			if (page.href === e.href) return;

			page.href = e.href;
			eventEmitter.dispatch();
		}
		if (e.type === 'transition-start') {
			routing = true;
		}
		if (e.type === 'transition-end') {
			routing = false;
		}
	}

	var getData = function() {
		return {
			page: page,
			routing: routing
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