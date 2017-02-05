define(['dispatcher', 'utils'], function(dispatcher, utils) {
	'use strict';

	var eventEmitter = new utils.EventEmitter();
	var elements = [];

	var _handleEvent = function(e) {
		if (e.type === 'page-preview-change') {
			elements = e.elements;
		}
	}

	var getData = function() {
		return {
			elements: elements
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