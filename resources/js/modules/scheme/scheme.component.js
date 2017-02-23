define(['dispatcher', 'scheme/scheme.store'], function(dispatcher, store) {
	"use strict";

	var elementProto = Object.create(HTMLDivElement.prototype);

	elementProto.handleStore = function() {
		var storeData = store.getData();

		if (storeData.scheme !== this.scheme) {
			this.scheme = storeData.scheme;
			this.setAttribute('data-scheme', this.scheme);
		}
		if (storeData.popupState !== this.popupState) {
			this.popupState = storeData.popupState;
			this.setAttribute('data-popup', this.popupState);
		}
	}

	elementProto.createdCallback = function() {
		this.popupState = null;
		this.scheme = null;
		this.handleStore = this.handleStore.bind(this);
	}
	elementProto.attachedCallback = function() {
		this.popupState = this.getAttribute('data-popup');
		this.scheme = this.getAttribute('data-scheme');

		this.handleStore();
		store.eventEmitter.subscribe(this.handleStore);
	}
	elementProto.detachedCallback = function() {
		store.eventEmitter.unsubscribe(this.handleStore);
	}

	document.registerElement('scheme-component', {
		extends: 'div',
		prototype: elementProto
	});
});