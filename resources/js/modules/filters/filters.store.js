define(['dispatcher', 'utils'], function(dispatcher, utils) {
	'use strict';

	var eventEmitter = new utils.EventEmitter();

	var items = {}

	var _handleEvent = function(e) {
		if (e.type === 'filters-add') {
			if (items.hasOwnProperty(e.id)) {
				console.warn('filter with id ' + e.id + ' already exists');
			} else {
				items[e.id] = {
					id: e.id,
					filters: e.filters
				}
			}
		}

		if (e.type === 'filters-toggle') {
			if (!items.hasOwnProperty(e.id)) return;

			items[e.id].filters[e.name].active = !items[e.id].filters[e.name].active;
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

	_init();

	return {
		eventEmitter: eventEmitter,
		getData: getData
	}
});