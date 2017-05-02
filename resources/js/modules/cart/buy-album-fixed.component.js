define([
	'dispatcher',
	'slide-scroll/slide-scroll.store',
	'cart/cart.store'
], function(
	dispatcher,
	slideStore,
	cartStore
) {
	"use strict";

	var elementProto = Object.create(HTMLButtonElement.prototype);

	elementProto.getProductId = function() {
		var index;
		var dataElement;
		var storeItems = slideStore.getData().items;

		if (!storeItems.hasOwnProperty(this._parentId)) return null;
		index = storeItems[this._parentId].index;

		dataElement = this._sections[index].querySelector('button[is="buy-album"]');
		return dataElement.getAttribute('data-productId');
	}

	elementProto.handleClick = function() {
		var cartData;
		var self = this;
		var productId = this.getProductId();

		if (!productId) return;

		this.classList.add('show-cart');
		setTimeout(function() {
			self.classList.remove('show-cart');
		}, 2000);

		console.log(productId);

		dispatcher.dispatch({
			type: 'cart-add',
			id: productId
		});
	}

	elementProto.handleCart = function() {
		var items = cartStore.getData().items;
		var found = false;
		var self = this;
		var productId = this.getProductId();

		if (!productId) return;

		items.forEach(function(item) {
			if (item.id === productId) {
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
		this.handleClick = this.handleClick.bind(this);
		this.handleCart = this.handleCart.bind(this);
		this.getProductId = this.getProductId.bind(this);
	}
	elementProto.attachedCallback = function() {
		var parent  = document.getElementsByTagName('slide-scroll')[0];
		var sections = parent.getElementsByTagName('section');

		var span = document.createElement('span');

		span.innerHTML = this.innerHTML;
		span.className = 'text';

		this.innerHTML = '';
		this.appendChild(span);

		span = document.createElement('span');
		span.innerHTML = 'Added';
		span.className = 'added';
		this.appendChild(span);


		this._parentId = parent.getAttribute('data-id');
		this._sections = sections;

		this.addEventListener('click', this.handleClick);

		this.handleCart();
		cartStore.eventEmitter.subscribe(this.handleCart);
		slideStore.eventEmitter.subscribe(this.handleCart);
	}

	elementProto.detachedCallback = function() {
		this.removeEventListener('click', this.handleClick);
		cartStore.eventEmitter.unsubscribe(this.handleCart);
		slideStore.eventEmitter.unsubscribe(this.handleCart);
	}

	document.registerElement('buy-album-fixed', {
		extends: 'button',
		prototype: elementProto
	});
});