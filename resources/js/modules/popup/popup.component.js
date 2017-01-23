define(['dispatcher', 'popup/popup.store'], function(dispatcher, popupStore) {
	"use strict";

	var _preventTouchScroll = function(e) {
		e.stopPropagation();
	}

	var elementProto = function() {
		var open = function() {
			var overflow;
			var inner;
			var pw = document.getElementsByClassName('page-wrapper')[0];
			var dw2;
			var diff = 0;

			this._active = true;

			overflow = this.getElementsByClassName('popup-outer')[0];
			inner = this.getElementsByClassName('popup-cell')[0];

			this.classList.add('active');

			dw2 = document.documentElement.clientWidth;
			diff = dw2 - this._dw1;
			if (diff < 0) diff = 0;

			if (inner) {
				inner.style.paddingRight = diff + 'px';
			}
			if (overflow) {
				overflow.addEventListener('touchmove', _preventTouchScroll);
			}

			if (pw) {
				pw.style.marginRight = diff + 'px';
			}
		}
		var close = function() {
			var overflow;
			var inner;
			var pw = document.getElementsByClassName('page-wrapper')[0];
			var dw2;
			var diff = 0;

			this._active = false;

			overflow = this.getElementsByClassName('popup-outer')[0];
			inner = this.getElementsByClassName('popup-cell')[0];

			this.classList.remove('active');

			dw2 = document.documentElement.clientWidth;
			diff = dw2 - this._dw1;
			if (diff < 0) diff = 0;

			if (inner) {
				inner.style.paddingRight = '0px';
			}
			if (overflow) {
				overflow.removeEventListener('touchmove', _preventTouchScroll);
			}

			if (pw) {
				pw.style.marginRight = diff + 'px';
			}
		}
		var handleStore = function() {
			var active = popupStore.getData().active;
			var body = document.getElementsByTagName('body')[0];
			var pw = document.getElementsByClassName('page-wrapper')[0];

			this._dw1 = document.documentElement.clientWidth;

			if (active) {
				body.classList.add('prevent-scroll');
				pw.setAttribute('data-popup', 'active');

				dispatcher.dispatch({
					type: 'audio-low-freq'
				});
			} else {
				body.classList.remove('prevent-scroll');
				pw.setAttribute('data-popup', 'inactive');

				dispatcher.dispatch({
					type: 'audio-high-freq'
				});
			}

			if (!this._active && active === this._id) {
				this._open();
			} else if (this._active && active !== this._id) {
				this._close();
			}
		}

		var createdCallback = function() {
			this._open  = open.bind(this);
			this._close = close.bind(this);
			this._handleStore = handleStore.bind(this);
			this._dw1 = 0;
		}
		var attachedCallback = function() {
			this._id = this.getAttribute('data-id');
			this._active = false;

			popupStore.eventEmitter.subscribe(this._handleStore);
		}
		var detachedCallback = function() {
			popupStore.eventEmitter.unsubscribe(this._handleStore);
		}


		return {
			createdCallback: createdCallback,
			attachedCallback: attachedCallback,
			detachedCallback: detachedCallback
		}
	}();


	Object.setPrototypeOf(elementProto, HTMLElement.prototype);
	document.registerElement('popup-component', {
		prototype: elementProto
	});
});