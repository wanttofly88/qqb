define(['dispatcher'], function(dispatcher) {
	"use strict";

	var elementProto = Object.create(HTMLElement.prototype);

	elementProto.handleClick = function() {
		var self = this;
		if (!this._productId) return;

		this.classList.add('show-cart');
		setTimeout(function() {
			self.classList.remove('show-cart');
		}, 2000);

		dispatcher.dispatch({
			type: 'cart-add',
			id: this._productId
		});
	}

	elementProto.createdCallback = function() {
		this._productId = null;
		this.handleClick = this.handleClick.bind(this);
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
		this.addEventListener('click', this.handleClick);
	}
	elementProto.detachedCallback = function() {
		this.removeEventListener('click', this.handleClick);
	}

	document.registerElement('buy-album', {
		extends: 'button',
		prototype: elementProto
	});
});