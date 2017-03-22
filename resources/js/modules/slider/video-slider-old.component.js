define([
	'dispatcher',
	'slide-scroll/slide-scroll.store'
], function(
	dispatcher,
	slideStore
) {
	"use strict";

	var elementProto = Object.create(HTMLElement.prototype);

	elementProto.handleStore = function() {
		var storeData = slideStore.getData().items;
		var index;
		var self = this;

		if (!storeData.hasOwnProperty(this._id)) return;

		index = storeData[this._id].index;
		if (index === this._index) return;

		this._index = index;

		Array.prototype.forEach.call(this._slides, function(slide, index) {
			if (index > self._index) {
				slide.classList.add('to-bottom');
				slide.classList.remove('to-top');
			} else if (index < self._index) {
				slide.classList.add('to-top');
				slide.classList.remove('to-bottom');
			} else {
				slide.classList.remove('to-top');
				slide.classList.remove('to-bottom');
			}
		});
	}

	elementProto.createdCallback = function() {
		this.handleStore = this.handleStore.bind(this);
	}
	elementProto.attachedCallback = function() {
		this._slides = this.getElementsByClassName('slide');
		this._id = this.getAttribute('data-id');
		this._z = 1;
		this._index = 0;

		Array.prototype.forEach.call(this._slides, function(slide, index) {
			if (index === 0) {
			} else {
				slide.classList.add('inactive');
			}
		});

		this.handleStore();
		slideStore.eventEmitter.subscribe(this.handleStore);
	}
	elementProto.detachedCallback = function() {
		slideStore.eventEmitter.unsubscribe(this.handleStore);
	}

	Object.setPrototypeOf(elementProto, HTMLElement.prototype);
	document.registerElement('video-slider', {
		prototype: elementProto
	});
});