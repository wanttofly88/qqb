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
			this._active = true;
		} else if (!found && this._active) {
			this._active = false;
		}
	}

	elementProto.handleClick = function() {
		var self = this;

		// this.classList.add('show-cart');
		// setTimeout(function() {
		// 	self.classList.remove('show-cart');
		// }, 2000);

		dispatcher.dispatch({
			type: 'popup-open',
			id: self._popupId
		});
	}

	elementProto.createdCallback = function() {
		this._active = false;
		this.handleClick = this.handleClick.bind(this);
	}
	elementProto.attachedCallback = function() {
		this._productId = this.getAttribute('data-productid');
		this._popupId = this.getAttribute('data-popupid');

		this.addEventListener('click', this.handleClick);
	}

	elementProto.detachedCallback = function() {
		this.removeEventListener('click', this.handleClick);
	}

	document.registerElement('buy-beat', {
		extends: 'button',
		prototype: elementProto
	});
});