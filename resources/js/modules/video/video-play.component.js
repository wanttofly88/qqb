define(['dispatcher'], function(dispatcher) {
	"use strict";

	var elementProto = Object.create(HTMLButtonElement.prototype);

	elementProto.createdCallback = function() {
	}
	elementProto.attachedCallback = function() {
		var src = this.getAttribute('data-src');

		this.addEventListener('click', function(e) {
			dispatcher.dispatch({
				type: 'video-play',
				src: src
			});
		});
	}
	elementProto.detachedCallback = function() {
	}

	Object.setPrototypeOf(elementProto, HTMLElement.prototype);
	document.registerElement('video-play', {
		extends: 'button',
		prototype: elementProto
	});
});