define(['dispatcher', 'utils'], function(dispatcher, utils) {
	'use strict';

	var eventEmitter = new utils.EventEmitter();

	var items = {}
	var total = 0;
	var price = 0;

	var _recount = function() {
		total = 0;
		price = 0;

		for (var id in items) {
			if (!items.hasOwnProperty(id)) return;

			total++;
			price += items[id].price;
		}
	}

	var _handleEvent = function(e) {
		if (e.type === 'cart-set') {
			items = e.items;
			_recount();

			eventEmitter.dispatch();
		}
	}

	var getData = function() {
		return {
			items: items,
			total: total,
			price: price
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