define(['dispatcher', 'utils'], function(dispatcher, utils) {
	'use strict';

	var eventEmitter = new utils.EventEmitter();

	var page = {};

	var _handleEvent = function(e) {
		if (e.type === 'router-page-change') {
			if (page.href === e.href) return;

			page.href = e.href;
			eventEmitter.dispatch();
		}
	}

	var getData = function() {
		return {
			page: page
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