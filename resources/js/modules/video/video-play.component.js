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

	document.registerElement('video-play', {
		extends: 'button',
		prototype: elementProto
	});
});