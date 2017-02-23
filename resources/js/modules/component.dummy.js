define(['dispatcher'], function(dispatcher) {
	"use strict";

	var elementProto = Object.create(HTMLElement.prototype);

	elementProto.createdCallback = function() {
	}
	elementProto.attachedCallback = function() {
	}
	elementProto.detachedCallback = function() {
	}

	Object.setPrototypeOf(elementProto, HTMLElement.prototype);
	document.registerElement('blog-post', {
		prototype: elementProto
	});
});