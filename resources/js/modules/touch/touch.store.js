define(['dispatcher', 'utils'], function(dispatcher, utils) {
	'use strict';

	var eventEmitter = new utils.EventEmitter();
	var touch = false;

	var _handleEvent = function(e) {
		if (e.type === 'touch-set') {
			touch = e.touch;
		}
	}

	var getData = function() {
		return {
			touch: touch
		}
	}

	var _init = function() {

	}

	_init();

	return {
		eventEmitter: eventEmitter,
		getData: getData
	}
});