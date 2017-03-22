define(['dispatcher', 'cart/cart.store'], function(dispatcher, store) {
	"use strict";

	var elementProto = Object.create(HTMLElement.prototype);

	elementProto.handleStore = function() {
		var total = store.getData().total;
		this.innerHTML = '[+' + total + ']';

		if (this._total !== null && this._total !== total) {

		}

		this._total = total;
	}

	elementProto.handleClick = function() {
		dispatcher.dispatch({
			type: 'popup-toggle',
			id: 'cart-popup'
		});
	}

	elementProto.createdCallback = function() {
		this.handleStore = this.handleStore.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this._total = null;
	}
	elementProto.attachedCallback = function() {
		this.addEventListener('click', this.handleClick);
		store.eventEmitter.subscribe(this.handleStore);
	}
	elementProto.detachedCallback = function() {
		this.removeEventListener('click', this.handleClick);
		store.eventEmitter.unsubscribe(this.handleStore);
	}

	document.registerElement('cart-total', {
		extends: 'button',
		prototype: elementProto
	});
});