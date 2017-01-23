define(['dispatcher'], function(dispatcher) {
	"use strict";

	var elementProto = function() {
		var createdCallback = function() {
		}
		var attachedCallback = function() {
		}
		var detachedCallback = function() {
		}


		return {
			createdCallback: createdCallback,
			attachedCallback: attachedCallback,
			detachedCallback: detachedCallback
		}
	}();

	Object.setPrototypeOf(elementProto, HTMLElement.prototype);
	document.registerElement('blog-post', {
		prototype: elementProto
	});
});