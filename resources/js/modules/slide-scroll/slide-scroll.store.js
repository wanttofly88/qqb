define(['dispatcher', 'utils'], function(dispatcher, utils) {
	'use strict';

	var eventEmitter = new utils.EventEmitter();
	var items = {};

	var _handleEvent = function(e) {
		if (e.type === 'slide-scroll-add') {
			if (items.hasOwnProperty(e.id)) return;

			items[e.id] = {
				id: e.id,
				index: e.index,
				total: e.total
			}

			eventEmitter.dispatch();
		}

		if (e.type === 'slide-scroll-remove') {
			if (!items.hasOwnProperty(e.id)) return;
			delete items[e.id];
		}

		if (e.type === 'slide-scroll') {
			if (!items.hasOwnProperty(e.id)) return;

			if (e.direction === 'top') {
				if (items[e.id].index === 0) return;
				items[e.id].index--;
			}
			if (e.direction === 'bottom') {
				if (items[e.id].index === items[e.id].total - 1) return;
				items[e.id].index++;
			}

			eventEmitter.dispatch();
		}

		if (e.type === 'slide-scroll-to') {
			if (!items.hasOwnProperty(e.id)) return;
			if (items[e.id].index === e.index) return;

			if (e.index < 0) {
				if (items[e.id].index === 0) return;
				items[e.id].index = 0;
			} else if (e.index > items[e.id].total - 1) {
				if (items[e.id].index === items[e.id].total - 1) return;
				items[e.id].index = items[e.id].total - 1;
			} else {
				items[e.id].index = e.index;
			}

			eventEmitter.dispatch();
		}
	}

	var getData = function() {
		return {
			items: items
		}
	}

	var _init = function() {
		dispatcher.subscribe(_handleEvent);
	}

	var eventEmitter = new utils.EventEmitter();

	_init();

	return {
		eventEmitter: eventEmitter,
		getData: getData
	}
});