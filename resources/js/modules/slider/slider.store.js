define(['dispatcher', 'utils'], function(dispatcher, utils) {
	'use strict';

	var eventEmitter = new utils.EventEmitter();
	var items = {};

	var _handleEvent = function(e) {
		if (e.type === 'slider:add') {
			items[e.id] = {
				id: e.id,
				total: e.total || 0,
				index: e.index || 0,
				continuous: e.continuous || false
			}
		}
		if (e.type === 'slider:remove') {
			delete items[e.id];
		}
		if (e.type === 'slider:next') {
			if (!items.hasOwnProperty(e.id)) return;

			items[e.id].index++;
			if (items[e.id].continuous) {
				if (items[e.id].index > items[e.id].total) items[e.id].index = 0;
			} else {
				if (items[e.id].index > items[e.id].total) items[e.id].index = items[e.id].total;
			}

			eventEmitter.dispatch();
		}
		if (e.type === 'slider:prev') {
			if (!items.hasOwnProperty(e.id)) return;

			items[e.id].index--;
			if (items[e.id].continuous) {
				if (items[e.id].index < 0) items[e.id].index = items[e.id].total;
			} else {
				if (items[e.id].index < 0) items[e.id].index = 0;
			}

			eventEmitter.dispatch();
		}
		if (e.type === 'slider:to') {
			if (!items.hasOwnProperty(e.id)) return;

			if (items[e.id].index !== e.index) {
				if (e.index > (items[e.id].total || e.index < 0)) {
					// console.warn('no slide width index ' + e.index + ' for slider width id ' + e.id);
					return
				}
				items[e.id].index = e.index;
				eventEmitter.dispatch();
			}
		}
	}

	var _init = function() {
		dispatcher.subscribe(_handleEvent);
	}

	var getData = function() {
		return items;
	}

	_init();

	return {
		subscribe: eventEmitter.subscribe.bind(eventEmitter),
		unsubscribe: eventEmitter.unsubscribe.bind(eventEmitter),
		getData: getData
	}
});