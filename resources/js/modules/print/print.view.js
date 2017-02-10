define(['dispatcher'], function(dispatcher) {
	var initialized = false;

	var items = [];

	var _add = function(container) {
		var item;
		var view = container.getAttribute('data-view');

		var active = false;

		var models = container.querySelectorAll('.print-model');
		var modelItems = [];

		var _addModel = function(model, id) {
			var lines = model.querySelectorAll('.print-line');
			var lineItems = [];

			var _addLine = function(line) {
				lineItems.push({
					value: line.innerHTML
				});
			}

			if (model.classList.contains('active')) {
				active = id;
			}

			for (var i = 0; i <= lines.length - 1; i++) {
				_addLine(lines[i]);
			}

			modelItems.push({
				id: id,
				lines: lineItems
			});
		}

		if (!models || !models.length) {
			console.warn('print models are not specified');
			return;
		}
		if (!view) {
			console.warn('view is not specified');
			return;
		}

		for (var i = 0; i <= models.length - 1; i++) {
			_addModel(models[i], i);
		}

		item = {
			active: active,
			view: view,
			models: modelItems
		}

		items.push(item);
	}

	var _handleEvent = function(e) {
		var viewId;
		var item;

		if (e.type === 'print-view-change') {
			viewId = e.viewId;

			item = getDataById(viewId);
			if (!item) {
				console.warn('no data for id "' + viewId + '" was found');
			}

			item.active = e.number;

			eventEmitter.dispatch({
				type: 'change'
			});
		}
	}

	var _init = function() {
		var containers = document.querySelectorAll('.print-container');

		for (var i = 0; i <= containers.length - 1; i++) {
			_add(containers[i]);
		}

		dispatcher.subscribe(_handleEvent);
	}

	var eventEmitter = function() {
		var _handlers = [];

		var dispatch = function(event) {
			for (var i = _handlers.length - 1; i >= 0; i--) {
				_handlers[i](event);
			}
		}
		var subscribe = function(handler) {
			_handlers.push(handler);
		}
		var unsubscribe = function(handler) {
			for (var i = 0; i <= _handlers.length - 1; i++) {
				if (_handlers[i] == handler) {
					_handlers.splice(i--, 1);
				}
			}
		}

		return {
			dispatch: dispatch,
			subscribe: subscribe,
			unsubscribe: unsubscribe
		}
	}();

	var getData = function() {
		return items;
	}

	var getDataById = function(id) {
		var result = false;
		for (var i = items.length - 1; i >= 0; i--) {
			if(items[i].view === id) {
				result = items[i];
			}
		}

		return result;
	}

	if (!initialized) {
		initialized = true;
		_init();
	}

	return {
		eventEmitter: eventEmitter,
		getData: getData,
		getDataById: getDataById
	}
});