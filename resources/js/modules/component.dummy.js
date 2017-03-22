define(['dispatcher'], function(dispatcher) {
	"use strict";

	var elementProto = Object.create(HTMLElement.prototype);

	elementProto.createdCallback = function() {
	}
	elementProto.attachedCallback = function() {
	}
	elementProto.detachedCallback = function() {
	}

	document.registerElement('blog-post', {
		prototype: elementProto
	});
});