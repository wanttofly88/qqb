define([
	'dispatcher'
], function(
	dispatcher
) {
	"use strict";

	var elementProto = Object.create(HTMLButtonElement.prototype);

	elementProto.handleClick = function() {
		var self = this;

		if (!this._active || !this._productId) return;

		this.classList.add('show-cart');
		setTimeout(function() {
			self.classList.remove('show-cart');
		}, 2000);


		dispatcher.dispatch({
			type: 'cart-add',
			id: this._productId
		});
	}
	elementProto.handleSizes = function() {
		var productId;

		this._productId = this._sizes.getSelected();

		if (this._productId) {
			this._active = true;
			this.classList.remove('disabled');
		} else {
			this._active = false;
			this.classList.add('disabled');
		}
	}

	elementProto.createdCallback = function() {
		this._productId = null;
		this.handleClick = this.handleClick.bind(this);
		this.handleSizes = this.handleSizes.bind(this);
	}
	elementProto.attachedCallback = function() {
		var span = document.createElement('span');

		span.innerHTML = this.innerHTML;
		span.className = 'text';

		this.innerHTML = '';
		this.appendChild(span);

		span = document.createElement('span');
		span.innerHTML = 'Added';
		span.className = 'added';
		this.appendChild(span);

		this._productId = this.getAttribute('data-productId');
		this._sizes = this.parentNode.getElementsByTagName('merch-sizes')[0];

		this.addEventListener('click', this.handleClick);
		this._sizes.addEventListener('size-select', this.handleSizes);
	}

	elementProto.detachedCallback = function() {
		this.removeEventListener('click', this.handleClick);
		this._sizes.removeEventListener('size-select', this.handleSizes);
	}

	document.registerElement('buy-merch-btn', {
		extends: 'button',
		prototype: elementProto
	});
});