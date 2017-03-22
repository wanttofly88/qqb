define(['dispatcher', 'cart/cart.store'], function(dispatcher, cartStore) {
	"use strict";

	var elementProto = Object.create(HTMLElement.prototype);

	elementProto.handleClick = function() {
		dispatcher.dispatch({
			type: 'cart-add',
			id: this._id
		});
	}

	elementProto.createdCallback = function() {
		this.handleClick = this.handleClick.bind(this);
	}
	elementProto.attachedCallback = function() {
		this._id = this.getAttribute('data-product-id');
		this.addEventListener('click', this.handleClick);
	}
	elementProto.detachedCallback = function() {
		this.removeEventListener('click', this.handleClick);
	}

	Object.setPrototypeOf(elementProto, HTMLElement.prototype);
	document.registerElement('license-component', {
		prototype: elementProto
	});
});