define(['dispatcher', 'popup/popup.store'], function(dispatcher, popupStore) {
	"use strict";

	var elementProto = Object.create(HTMLButtonElement.prototype);

	elementProto.handleStore = function() {
		var active = popupStore.getData().active;
		if (active === this._id) {
			this.classList.add('active');
		} else {
			this.classList.remove('active');
		}
	}
	elementProto.handleClick = function() {
		dispatcher.dispatch({
			type: 'popup-toggle',
			id: this._id
		});
	}

	elementProto.createdCallback = function() {
		this.handleClick = this.handleClick.bind(this);
		this.handleStore = this.handleStore.bind(this);
	}
	elementProto.attachedCallback = function() {
		this._id = this.getAttribute('data-id');
		this.addEventListener('click', this.handleClick);
		popupStore.eventEmitter.subscribe(this.handleStore);
	}
	elementProto.detachedCallback = function() {
		this.removeEventListener('click', this.handleClick);
		popupStore.eventEmitter.unsubscribe(this.handleStore);
	}

	document.registerElement('popup-toggle', {
		extends: 'button',
		prototype: elementProto
	});

	return elementProto;
});