define(['dispatcher', 'cart/cart.store'], function(dispatcher, cartStore) {
	"use strict";

	var elementProto = Object.create(HTMLElement.prototype);

	var parsePrice = function(num) {
		var str = num.toString().split('.');
		if (str[0].length >= 5) {
			str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, '$1 ');
		}
		if (str[1] && str[1].length === 1) {
			str[1] = str[1] + '0';
		} else if (!str[1]) {
			str[1] = '00';
		}
		return str.join('.');
	}

	elementProto.handleCart = function() {
		var price = cartStore.getData().price;
		this.innerHTML = parsePrice(price) + ' $';
	}

	elementProto.createdCallback = function() {
		this.handleCart = this.handleCart.bind(this);
	}
	elementProto.attachedCallback = function() {
		this.handleCart();
		cartStore.eventEmitter.subscribe(this.handleCart);
	}
	elementProto.detachedCallback = function() {
		cartStore.eventEmitter.unsubscribe(this.handleCart);
	}

	document.registerElement('cart-price', {
		prototype: elementProto
	});
});