define(['dispatcher', 'popup/popup.store'], function(dispatcher, popupStore) {
	"use strict";

	var _preventTouchScroll = function(e) {
		e.stopPropagation();
	}

	var elementProto = Object.create(HTMLElement.prototype);

	elementProto.open = function() {
		var overflow;
		var inner;
		var pw = document.getElementsByClassName('page-wrapper')[0];
		var dw2;
		var diff = 0;

		this._active = true;

		this.classList.add('active');

		overflow = this.getElementsByClassName('popup-outer')[0];
		inner = this.getElementsByClassName('popup-cell')[0];

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
			pw.style.paddingRight = diff + 'px';
		}

	}

	elementProto.close = function() {
		var overflow;
		var inner;
		var pw = document.getElementsByClassName('page-wrapper')[0];
		var dw2;
		var diff = 0;

		this._active = false;

		this.classList.remove('active');

		overflow = this.getElementsByClassName('popup-outer')[0];
		inner = this.getElementsByClassName('popup-cell')[0];

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
			pw.style.paddingRight = diff + 'px';
		}

	}
	elementProto.handleStore = function() {
		var active = popupStore.getData().active;
		var body = document.getElementsByTagName('body')[0];
		var pw = document.getElementsByClassName('page-wrapper')[0];

		if (!this._active && active === this._id) {
			this._dw1 = document.documentElement.clientWidth;

			this.open();

		} else if (this._active && active !== this._id) {
			this._dw1 = document.documentElement.clientWidth;

			this.close();
		}
	}

	elementProto.createdCallback = function() {
		this.open  = this.open.bind(this);
		this.close = this.close.bind(this);
		this.handleStore = this.handleStore.bind(this);
		this._dw1 = 0;
	}
	elementProto.attachedCallback = function() {
		this._id = this.getAttribute('data-id');
		this._active = false;

		popupStore.eventEmitter.subscribe(this.handleStore);
	}
	elementProto.detachedCallback = function() {
		popupStore.eventEmitter.unsubscribe(this.handleStore);
	}

	document.registerElement('popup-component', {
		prototype: elementProto
	});
});