define([
	'dispatcher',
	'cart/cart.store'
], function(
	dispatcher,
	cartStore
) {
	"use strict";

	var elementProto = Object.create(HTMLButtonElement.prototype);

	elementProto.handleCart = function() {
		var items = cartStore.getData().items;
		var found = false;
		var self = this;

		items.forEach(function(item) {
			if (self._products.indexOf(item.id) !== -1) {
				found = true;
			}
		});

		if (found) {
			this.classList.add('disabled');
			this._disabled = true;
		} else {
			this.classList.remove('disabled');
			this._disabled = false;
		}
	}

	elementProto.handleClick = function() {
		var self = this;
		if (this._disabled) return;

		dispatcher.dispatch({
			type: 'popup-open',
			id: self._popupId
		});
	}

	elementProto.createdCallback = function() {
		this._active = false;
		this.handleClick = this.handleClick.bind(this);
		this.handleCart = this.handleCart.bind(this);
	}
	elementProto.attachedCallback = function() {
		this._productId = this.getAttribute('data-productid');
		this._popupId = this.getAttribute('data-popupid');

		if (this._productId) {
			this._products = this._productId.split('||');
		} else {
			this._products = [];
		}

		this.addEventListener('click', this.handleClick);
		this.handleCart();
		cartStore.eventEmitter.subscribe(this.handleCart);
	}

	elementProto.detachedCallback = function() {
		this.removeEventListener('click', this.handleClick);
		cartStore.eventEmitter.unsubscribe(this.handleCart);
	}

	document.registerElement('buy-beat', {
		extends: 'button',
		prototype: elementProto
	});
});