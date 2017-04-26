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

	elementProto.handleClick = function() {
		var index;
		var storeItems = slideStore.getData().items;
		var dataElement;
		var id;
		var productId;
		var cartData;
		var found = false;
		var self = this;

		if (!storeItems.hasOwnProperty(this._parentId)) return;

		this.classList.add('show-cart');
		setTimeout(function() {
			self.classList.remove('show-cart');
		}, 2000);

		index = storeItems[this._parentId].index;

		dataElement = this._sections[index].querySelector('button[is="buy-album"]');
		productId = dataElement.getAttribute('data-productId');

		dispatcher.dispatch({
			type: 'cart-add',
			id: productId
		});
	}

	elementProto.createdCallback = function() {
		this.handleClick = this.handleClick.bind(this);
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
	}

	elementProto.detachedCallback = function() {
		this.removeEventListener('click', this.handleClick);
	}

	document.registerElement('buy-album-fixed', {
		extends: 'button',
		prototype: elementProto
	});
});