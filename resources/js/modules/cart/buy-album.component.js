define([
	'dispatcher',
	'cart/cart.store'
], function(
	dispatcher,
	cartStore
) {
	"use strict";

	var elementProto = Object.create(HTMLElement.prototype);

	elementProto.handleClick = function() {
		var self = this;
		if (!this._productId || this._disabled) return;

		this.classList.add('show-cart');
		setTimeout(function() {
			self.classList.remove('show-cart');
		}, 2000);

		dispatcher.dispatch({
			type: 'cart-add',
			id: this._productId
		});
	}

	elementProto.handleCart = function() {
		var items = cartStore.getData().items;
		var found = false;
		var self = this;

		items.forEach(function(item) {
			if (item.id === self._productId) {
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

	elementProto.createdCallback = function() {
		this._productId = null;
		this.handleClick = this.handleClick.bind(this);
		this.handleCart = this.handleCart.bind(this);
	}


	elementProto.attachedCallback = function() {
		var span = document.createElement('span');

		span.innerHTML = this.innerHTML;
		span.className = 'text';

		this.innerHTML = '';
		this.appendChild(span);

		span = document.createElement('span');
		span.innerHTML = 'Added';
		span.className = 'added';
		this.appendChild(span);


		this._productId = this.getAttribute('data-productId');
		this.addEventListener('click', this.handleClick);

		this.handleCart();
		cartStore.eventEmitter.subscribe(this.handleCart);
	}
	elementProto.detachedCallback = function() {
		this.removeEventListener('click', this.handleClick);
		cartStore.eventEmitter.unsubscribe(this.handleCart);
	}

	document.registerElement('buy-album', {
		extends: 'button',
		prototype: elementProto
	});
});