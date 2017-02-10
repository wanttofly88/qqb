define(['dispatcher', 'router/router.store'], function(dispatcher, store) {
	"use strict";

	var elementProto = function() {
		var handleClick = function(e) {
			var href = store.getData().page.href;
			var self = this;

			e.preventDefault();
			if (href === this._href) return;

			dispatcher.dispatch({
				type: 'route',
				href: self._href,
				transitionData: {
					animation: 'normal',
					element: self
				}
			});
		}
		var handleStore = function() {
			var href = store.getData().page.href;

			if (href === this._href) {
				this.classList.add('active');
			} else {
				this.classList.remove('active');
			}
		}

		var createdCallback = function() {
			this._handleClick = handleClick.bind(this);
			this._handleStore = handleStore.bind(this);
		}
		var attachedCallback = function() {
			this._href = this.href;

			if (this._href.indexOf('index') !== -1) {
				this._href = this.href.split('index')[0];
			}

			this._handleStore();
	
			this.addEventListener('click', this._handleClick);
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

	Object.setPrototypeOf(elementProto, HTMLAnchorElement.prototype);
	document.registerElement('inner-link', {
		extends: 'a',
		prototype: elementProto
	});
});