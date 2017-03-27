define(['dispatcher', 'utils', 'cart/cart.store'], function(dispatcher, utils, cartStore) {
	"use strict";

	var elementProto = Object.create(HTMLElement.prototype);

	elementProto.handleStore = function() {

	}

	elementProto.setFromJson = function(json) {
		var data = JSON.parse(json);
		var self = this;

		dispatcher.dispatch({
			type: 'cart-set',
			items: data
		});

		this._items = this._items.filter(function(item) {
			var exists = false;
			data.forEach(function(dataItem) {
				if (dataItem.id === item.id) exists = true;
			});

			if (!exists) {
				if (item.element) {
					self._inner.removeChild(item.element);
				}
				item.element.remove();
			}

			return exists;
		});


		this._items = data.map(function(dataItem) {
			var exists = false;
			var el;

			self._items.forEach(function(item) {
				if (dataItem.id === item.id) exists = item;
			});


			if (!exists) {
				el = document.createElement('cart-item');
				el.create(dataItem);

				self._inner.appendChild(el);

				return {
					id: dataItem.id,
					element: el
				}
			} else {
				return exists;
			}
		});

	}

	elementProto.handleDispatcher = function(e) {
		var self = this;
		if (e.type === 'cart-add') {
			// utils.http(this._route).put({
			// 	id: e.id
			// }).then(function(responce) {
			// 	self.setFromJson(responce);
			// }, function(responce) {

			// });

			utils.http('cart-testing-add.json').get()
			.then(function(responce) {
				self.setFromJson(responce);
			}, function(responce) {

			});
		}
		if (e.type === 'cart-remove') {
			// utils.http(this._route).delete({
			// 	id: e.id
			// }).then(function(responce) {
			// 	self.setFromJson(responce);
			// }, function(responce) {
				
			// })

			utils.http(this._route).get()
			.then(function(responce) {
				self.setFromJson(responce);
			}, function(responce) {

			});
		}
	}

	elementProto.updateCart = function() {
		var self = this;
		// utils.http(this._route).get()
		// .then(function(responce) {
		// 	self.setFromJson(responce);
		// }, function(responce) {

		// });

		utils.http(this._route).get()
		.then(function(responce) {
			self.setFromJson(responce);
		}, function(responce) {

		});
	}

	elementProto.createdCallback = function() {
		this.handleDispatcher = this.handleDispatcher.bind(this);
		this.setFromJson = this.setFromJson.bind(this);
		this.updateCart = this.updateCart.bind(this);
		this.handleStore = this.handleStore.bind(this);
		this.setFromJson = this.setFromJson.bind(this);
		this._items = [];
	}
	elementProto.attachedCallback = function() {
		this._route = this.getAttribute('data-route');
		this._inner = this.getElementsByClassName('items')[0];

		if (!this._route) {
			console.warn('data-route attribute is missing on cart-component');
			return;
		}

		this.updateCart();

		dispatcher.subscribe(this.handleDispatcher);
		cartStore.eventEmitter.subscribe(this.handleStore);
	}
	elementProto.detachedCallback = function() {
		dispatcher.unsubscribe(this.handleDispatcher);
		cartStore.eventEmitter.unsubscribe(this.handleStore);
	}

	document.registerElement('cart-component', {
		prototype: elementProto
	});
});