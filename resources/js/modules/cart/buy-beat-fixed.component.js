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

	elementProto.getId = function() {
		var index;
		var storeItems = slideStore.getData().items;
		var dataElement;

		if (!storeItems.hasOwnProperty(this._parentId)) return {
			popupId: null,
			productId: null
		};

		index = storeItems[this._parentId].index;
		dataElement = this._sections[index].querySelector('button[is="buy-beat"]');

		return {
			popupId: dataElement.getAttribute('data-popupId'),
			productId: dataElement.getAttribute('data-productId')
		}

	}

	elementProto.handleClick = function() {
		var self = this;
		var data = this.getId();

		if (this._disabled) return;

		dispatcher.dispatch({
			type: 'popup-open',
			id: data.popupId
		});
	}

	elementProto.handleCart = function() {
		var items = cartStore.getData().items;
		var found = false;
		var self = this;
		var data = this.getId();
		var products = data.productId;

		if (products) {
			products = products.split('||');
		} else {
			products = [];
		}

		items.forEach(function(item) {
			if (products.indexOf(item.id) !== -1) {
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
		this.getId = this.getId.bind(this);
	}
	elementProto.attachedCallback = function() {
		var parent  = document.getElementsByTagName('slide-scroll')[0];
		var sections = parent.getElementsByTagName('section');

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

	document.registerElement('buy-beat-fixed', {
		extends: 'button',
		prototype: elementProto
	});
});