define([
	'dispatcher',
	'popup/popup-toggle.component',
	'slide-scroll/slide-scroll.store',
], function(
	dispatcher,
	togglePrototype,
	slideStore
) {
	"use strict";

	var elementProto = Object.create(togglePrototype);

	elementProto.handleSlide = function() {
		var index;
		var storeItems = slideStore.getData().items;
		var dataElement;

		if (!storeItems.hasOwnProperty(this._parentId)) return;

		index = storeItems[this._parentId].index;

		dataElement = this._sections[index].getElementsByClassName('data-toggle')[0];
		this._id = dataElement.getAttribute('data-id');
		this.setAttribute('data-id', this._id);
	}

	elementProto.createdCallback = function() {
		togglePrototype.createdCallback.apply(this);

		this.handleSlide = this.handleSlide.bind(this);
	}
	elementProto.attachedCallback = function() {
		var parent  = document.getElementsByTagName('slide-scroll')[0];
		var sections = parent.getElementsByTagName('section');

		this._parentId = parent.getAttribute('data-id');
		this._sections = sections;

		togglePrototype.attachedCallback.apply(this);

		this.handleSlide();
		slideStore.eventEmitter.subscribe(this.handleSlide);
	}

	elementProto.detachedCallback = function() {
		togglePrototype.detachedCallback.apply(this);

		slideStore.eventEmitter.unsubscribe(this.handleSlide);
	}

	document.registerElement('buy-fixed', {
		extends: 'button',
		prototype: elementProto
	});
});