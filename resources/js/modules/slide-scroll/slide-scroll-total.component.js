define(['dispatcher', 'slide-scroll/slide-scroll.store'], function(dispatcher, store) {
	"use strict";

	var elementProto = Object.create(HTMLElement.prototype);

	elementProto.handleStore = function() {
		var storeData = store.getData().items[this._id];
		if (!storeData) return;

		this.innerHTML = storeData.total;
	}
	elementProto.createdCallback = function() {
		this.handleStore = this.handleStore.bind(this);
	}
	elementProto.attachedCallback = function() {
		this._id = this.getAttribute('data-id');
		if (!this._id) {
			console.warn('data-id attribute is missing on slide-scroll-total');
		}
		store.eventEmitter.subscribe(this.handleStore);
		this.handleStore();
	}
	elementProto.detachedCallback = function() {
		store.eventEmitter.unsubscribe(this.handleStore);
	}

	document.registerElement('slide-scroll-total', {
		prototype: elementProto
	});
});