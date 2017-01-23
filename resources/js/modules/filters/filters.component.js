define([
	'dispatcher',
	'filters/filters.store'
], function(
	dispatcher,
	filtersStore
) {
	'use strict';

	var elementProto = function() {
		var handleStore = function() {
			var storeData = filtersStore.getData().items[this._id];

			for (var name in this._items) {
				if (this._items[name].active && !storeData.filters[this._items[name].name].active) {
					this._items[name].active = false;
					this._items[name].element.classList.remove('active');
				} else if (!this._items[name].active && storeData.filters[this._items[name].name].active) {
					this._items[name].active = true;
					this._items[name].element.classList.add('active');
				}
			}
		}

		var createdCallback = function() {
			this._items = {}
			this._handleStore = handleStore.bind(this);
		}
		var attachedCallback = function() {
			var elements;
			var items = {};
			var filters = {};
			var self = this;

			this._id = this.getAttribute('data-id');
			if (!this._id) {
				console.warn('data-id attribute is missing on filters component');
				return;
			}

			elements = this.getElementsByClassName('item');

			Array.prototype.forEach.call(elements, function(element) {
				var filterName = element.getAttribute('data-filter');
				var active = element.classList.contains('active');

				element.addEventListener('click', function(e) {
					dispatcher.dispatch({
						type: 'filters-toggle',
						id: self._id,
						name: filterName
					});
				});

				self._items[filterName] = {
					name: filterName,
					element: element,
					active: active
				}

				filters[filterName] = {
					name: filterName,
					active: active
				}
			});

			dispatcher.dispatch({
				type: 'filters-add',
				id: this._id,
				filters: filters
			});

			filtersStore.eventEmitter.subscribe(this._handleStore);
		}
		var detachedCallback = function() {
			dispatcher.dispatch({
				type: 'filters-remove',
				id: this._id
			});

			filtersStore.eventEmitter.unsubscribe(this._handleStore);
		}


		return {
			createdCallback: createdCallback,
			attachedCallback: attachedCallback,
			detachedCallback: detachedCallback
		}
	}();

	Object.setPrototypeOf(elementProto, HTMLElement.prototype);
	document.registerElement('filters-component', {
		prototype: elementProto
	});
});