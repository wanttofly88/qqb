define(['dispatcher', 'slide-scroll/slide-scroll.store'], function(dispatcher, store) {
	"use strict";

	var elementProto = function() {
		var handleStore = function() {
			var storeData = store.getData().items[this._id];
			if (!storeData) return;

			this.innerHTML = storeData.total;
		}
		var createdCallback = function() {
			this._handleStore = handleStore.bind(this);
		}
		var attachedCallback = function() {
			this._id = this.getAttribute('data-id');
			if (!this._id) {
				console.warn('data-id attribute is missing on slide-scroll-total');
			}
			store.eventEmitter.subscribe(this._handleStore);
			this._handleStore();
		}
		var detachedCallback = function() {
			store.eventEmitter.unsubscribe(this._handleStore);
		}


		return {
			createdCallback: createdCallback,
			attachedCallback: attachedCallback,
			detachedCallback: detachedCallback
		}
	}();

	Object.setPrototypeOf(elementProto, HTMLElement.prototype);
	document.registerElement('slide-scroll-total', {
		prototype: elementProto
	});
});