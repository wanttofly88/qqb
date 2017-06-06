define([
	'dispatcher',
	'cart/cart.store'
], function(
	dispatcher,
	cartStore
) {
	"use strict";

	var elementProto = Object.create(HTMLButtonElement.prototype);

	elementProto.handleStore = function() {
		var storeData = cartStore.getData();

		if (!storeData.total) {
			this.classList.add('disabled');
			this._inactive = true;
		} else {
			this.classList.remove('disabled');
			this._inactive = false;
		}
	}
	elementProto.handleClick = function() {
		if (this._inactive) return;

		dispatcher.dispatch({
			type: 'cart-submit'
		});
	}

	elementProto.createdCallback = function() {
		this.handleStore = this.handleStore.bind(this);
		this.handleClick = this.handleClick.bind(this);
	}
	elementProto.attachedCallback = function() {
		this.addEventListener('click', this.handleClick);
		this.handleStore();
		cartStore.eventEmitter.subscribe(this.handleStore);
	}
	elementProto.detachedCallback = function() {
		cartStore.eventEmitter.unsubscribe(this.handleStore);
	}

	document.registerElement('cart-checkout', {
		extends: 'button',
		prototype: elementProto
	});
});