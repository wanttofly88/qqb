define(['dispatcher', 'popup/popup.store'], function(dispatcher, popupStore) {
	"use strict";

	var elementProto = Object.create(HTMLButtonElement.prototype);

	elementProto.handleClick = function() {
		dispatcher.dispatch({
			type: 'popup-close'
		});
	}

	elementProto.createdCallback = function() {
		this.handleClick = this.handleClick.bind(this);
	}
	elementProto.attachedCallback = function() {
		this.addEventListener('click', this.handleClick);
	}
	elementProto.detachedCallback = function() {
		this.removeEventListener('click', this.handleClick);
	}

	document.registerElement('popup-close', {
		extends: 'button',
		prototype: elementProto
	});
});