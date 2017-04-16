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
		var data = cartStore.getData().items;
		var found = false;
		var self = this;

		if (!data) return;

		data.forEach(function(item) {
			if (item.id === self._productId) found = true;
		});

		if (found && !this._active) {
			// this.innerHTML = '[Cart]';
			this._active = true;
		} else if (!found && this._active) {
			// this.innerHTML = '[Buy]';
			this._active = false;
		}
	}

	elementProto.handleClick = function() {
		// var self = this;

		// if (this._active) {
		// 	dispatcher.dispatch({
		// 		type: 'popup-open',
		// 		id: 'cart-popup'
		// 	});
		// } else {
			dispatcher.dispatch({
				type: 'popup-open',
				id: self._popupId
			});
		// }
	}

	elementProto.createdCallback = function() {
		this._active = false;
		this.handleClick = this.handleClick.bind(this);
		// this.handleCart = this.handleCart.bind(this);
	}
	elementProto.attachedCallback = function() {
		this._productId = this.getAttribute('data-productId');
		this._popupId = this.getAttribute('data-popupId');

		// this.handleCart();
		this.addEventListener('click', this.handleClick);
		// cartStore.eventEmitter.subscribe(this.handleCart);
	}

	elementProto.detachedCallback = function() {
		this.removeEventListener('click', this.handleClick);
		// cartStore.eventEmitter.unsubscribe(this.handleCart);
	}

	document.registerElement('buy-btn', {
		extends: 'button',
		prototype: elementProto
	});
});