define(['dispatcher', 'scheme/scheme.store'], function(dispatcher, store) {
	"use strict";

	var elementProto = function() {
		var handleStore = function() {
			var storeData = store.getData();

			if (storeData.scheme !== this._scheme) {
				this._scheme = storeData.scheme;
				this.setAttribute('data-scheme', this._scheme);
			}
			if (storeData.popupState !== this._popupState) {
				this._popupState = storeData.popupState;
				this.setAttribute('data-popup', this._popupState);
			}
		}

		var createdCallback = function() {
			this._popupState = null;
			this._scheme = null;
			this._handleStore = handleStore.bind(this);
		}
		var attachedCallback = function() {
			this._popupState = this.getAttribute('data-popup');
			this._scheme = this.getAttribute('data-scheme');

			this._handleStore();
			store.eventEmitter.subscribe(this._handleStore);
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

	Object.setPrototypeOf(elementProto, HTMLDivElement.prototype);
	document.registerElement('scheme-component', {
		extends: 'div',
		prototype: elementProto
	});
});