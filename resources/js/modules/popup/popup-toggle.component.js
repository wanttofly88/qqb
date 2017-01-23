define(['dispatcher', 'popup/popup.store'], function(dispatcher, popupStore) {
	"use strict";

	var elementProto = function() {
		var handleStore = function() {
			var active = popupStore.getData().active;
			if (active === this._id) {
				this.classList.add('active');
			} else {
				this.classList.remove('active');
			}
		}
		var handleClick = function() {
			dispatcher.dispatch({
				type: 'popup-toggle',
				id: this._id
			});
		}

		var createdCallback = function() {
			this._handleClick = handleClick.bind(this);
			this._handleStore = handleStore.bind(this);
		}
		var attachedCallback = function() {
			this._id = this.getAttribute('data-id');
			if (!this._id) {
				console.warn('data-id attribute is missing');
			}

			this.addEventListener('click', this._handleClick);
			popupStore.eventEmitter.subscribe(this._handleStore);
		}
		var detachedCallback = function() {
			this.removeEventListener('click', this._handleClick);
			popupStore.eventEmitter.unsubscribe(this._handleStore);
		}

		return {
			createdCallback: createdCallback,
			attachedCallback: attachedCallback,
			detachedCallback: detachedCallback
		}
	}();

	Object.setPrototypeOf(elementProto, HTMLButtonElement.prototype);
	document.registerElement('popup-toggle', {
		extends: 'button',
		prototype: elementProto
	});
});