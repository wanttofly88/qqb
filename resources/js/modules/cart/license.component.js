define(['dispatcher', 'cart/cart.store'], function(dispatcher, cartStore) {
	"use strict";

	var elementProto = Object.create(HTMLElement.prototype);

	elementProto.handleClick = function() {
		if (this._active) return;
		dispatcher.dispatch({
			type: 'cart-add',
			id: this._id
		});

		this._active = true;
		this.classList.add('active');

		setTimeout(function() {
			dispatcher.dispatch({
				type: 'popup-close'
			});
		}, 200);
	}

	elementProto.handleCart = function() {
		var data = cartStore.getData().items;
		var found = false;
		var self = this;

		if (!data) return;

		data.forEach(function(item) {
			if (item.id === self._id) found = true;
		});

		if (found && !this._active) {
			this._active = true;
			this.classList.add('active');
		} else if (!found && this._active) {
			this._active = false;
			this.classList.remove('active');
		}
	}

	elementProto.createdCallback = function() {
		this._active = false;
		this.handleClick = this.handleClick.bind(this);
		this.handleCart = this.handleCart.bind(this);
	}
	elementProto.attachedCallback = function() {
		this._id = this.getAttribute('data-product-id');

		this.handleCart();
		this.addEventListener('click', this.handleClick);
		cartStore.eventEmitter.subscribe(this.handleCart);
	}
	elementProto.detachedCallback = function() {
		this.removeEventListener('click', this.handleClick);
		cartStore.eventEmitter.unsubscribe(this.handleCart);
	}

	Object.setPrototypeOf(elementProto, HTMLElement.prototype);
	document.registerElement('license-component', {
		prototype: elementProto
	});
});