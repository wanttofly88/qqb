define(['dispatcher', 'scheme/scheme.store'], function(dispatcher, store) {
	"use strict";

	var elementProto = function() {
		var createdCallback = function() {
			this._scheme = null;
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

	Object.setPrototypeOf(elementProto, HTMLDivElement.prototype);
	document.registerElement('scheme-component', {
		extends: 'div',
		prototype: elementProto
	});
});