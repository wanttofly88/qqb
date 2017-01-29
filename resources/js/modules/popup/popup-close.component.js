define(['dispatcher', 'popup/popup.store'], function(dispatcher, popupStore) {
	"use strict";

	var elementProto = function() {
		var handleClick = function() {
			dispatcher.dispatch({
				type: 'popup-close'
			});
		}

		var createdCallback = function() {
			this._handleClick = handleClick.bind(this);
		}
		var attachedCallback = function() {
			this.addEventListener('click', this._handleClick);
		}
		var detachedCallback = function() {
			this.removeEventListener('click', this._handleClick);
		}

		return {
			createdCallback: createdCallback,
			attachedCallback: attachedCallback,
			detachedCallback: detachedCallback
		}
	}();

	Object.setPrototypeOf(elementProto, HTMLButtonElement.prototype);
	document.registerElement('popup-close', {
		extends: 'button',
		prototype: elementProto
	});
});