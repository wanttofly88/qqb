define([
	'dispatcher',
	'scheme/scheme.store'
], function(
	dispatcher,
	schemeStore
) {
	"use strict";

	var elementProto = function() {
		var createdCallback = function() {

		}
		var attachedCallback = function() {
			dispatcher.dispatch({
				type: 'scheme-color-change',
				scheme: 'dark'
			});
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
	document.registerElement('videos-helper', {
		prototype: elementProto
	});
});