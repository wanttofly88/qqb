define(['dispatcher', 'popup/popup.store'], function(dispatcher, popupStore) {
	"use strict";

	var elementProto = Object.create(HTMLButtonElement.prototype);

	elementProto.handleClick = function() {
		var storeData = popupStore.getData();
		if (!storeData.active) {
			dispatcher.dispatch({
				type: 'popup-toggle',
				id: 'menu-popup'
			});
		} else {
			dispatcher.dispatch({
				type: 'popup-close'
			});
		}
	}
	elementProto.handleStore = function() {
		var storeData = popupStore.getData();
		if (storeData.active) {
			this.classList.add('active');
		} else {
			this.classList.remove('active');
		}
	}

	elementProto.createdCallback = function() {
		this.handleClick = this.handleClick.bind(this);
		this.handleStore = this.handleStore.bind(this);
	}
	elementProto.attachedCallback = function() {
		this.addEventListener('click', this.handleClick);
		this.handleStore();
		popupStore.eventEmitter.subscribe(this.handleStore);
	}
	elementProto.detachedCallback = function() {
		this.removeEventListener('click', this.handleClick);
		popupStore.eventEmitter.unsubscribe(this.handleStore);
	}

	document.registerElement('menu-toggle', {
		extends: 'button',
		prototype: elementProto
	});
});