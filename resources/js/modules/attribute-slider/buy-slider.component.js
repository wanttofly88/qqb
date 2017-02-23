define([
	'dispatcher',
	'slide-scroll/slide-scroll.store'
], function(
	dispatcher,
	slideStore
) {
	"use strict";

	var elementProto = Object.create(HTMLButtonElement.prototype);

	elementProto.handleClick = function(e) {
	}
	elementProto.handleSlide = function() {
		var index;
		var storeItems = slideStore.getData().items;
		var productId;

		if (!storeItems[this._parentId]) {
			console.warn('object with id ' + this._parentId + ' is missing in store');
			return;
		};

		index = slideStore.getData().items[this._parentId].index;

		productId = this._idData[index];
		if (!productId) return;

		this.setAttribute('data-product-id', productId);
	}

	elementProto.createdCallback = function() {
		this.handleClick = this.handleClick.bind(this);
		this.handleSlide = this.handleSlide.bind(this);
	}
	elementProto.attachedCallback = function() {
		var self = this;
		var parent  = document.getElementsByTagName('slide-scroll')[0];
		var sections = parent.getElementsByTagName('section');

		this._id = this.getAttribute('data-id');
		this._parentId = parent.getAttribute('data-id');
		self._idData = [];

		Array.prototype.forEach.call(sections, function(section, index) {
			var idData = section.querySelector('.data-product[data-id="' + self._id + '"]');

			if (idData) {
				self._idData[index] = idData.getAttribute('data-product-id');;
			}
		});

		this.handleSlide();
		this.addEventListener('click', this.handleClick);
		slideStore.eventEmitter.subscribe(this.handleSlide);
	}
	elementProto.detachedCallback = function() {
		slideStore.eventEmitter.unsubscribe(this.handleSlide);
	}

	document.registerElement('buy-slider', {
		extends: 'button',
		prototype: elementProto
	});
});