define(['dispatcher'], function(dispatcher) {
	"use strict";

	var elementProto = Object.create(HTMLButtonElement.prototype);

	elementProto.handleClick = function() {
		var popup = this.getAttribute('data-popup');
		dispatcher.dispatch({
			type: 'popup-open',
			id: popup
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

	document.registerElement('video-play', {
		extends: 'button',
		prototype: elementProto
	});
});