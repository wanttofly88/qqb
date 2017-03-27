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

		index = storeItems[this._parentId].index;

		dataElement = this._sections[index].querySelector('button[is="buy-btn"]');
		id = dataElement.getAttribute('data-popupId');
		productId = dataElement.getAttribute('data-productId');

		// cartData = cartStore.getData().items;

		// if (!cartData) return;

		// cartData.forEach(function(item) {
		// 	if (item.id === productId) found = true;
		// });

		// if (found) {
			// dispatcher.dispatch({
			// 	type: 'popup-open',
			// 	id: 'cart-popup'
			// });
		// } else {
			dispatcher.dispatch({
				type: 'popup-open',
				id: id
			});
		// }
	}

	elementProto.createdCallback = function() {
		this.handleClick = this.handleClick.bind(this);
	}
	elementProto.attachedCallback = function() {
		var parent  = document.getElementsByTagName('slide-scroll')[0];
		var sections = parent.getElementsByTagName('section');

		this._parentId = parent.getAttribute('data-id');
		this._sections = sections;

		this.addEventListener('click', this.handleClick);
	}

	elementProto.detachedCallback = function() {
		this.removeEventListener('click', this.handleClick);
	}

	document.registerElement('buy-fixed-btn', {
		extends: 'button',
		prototype: elementProto
	});
});