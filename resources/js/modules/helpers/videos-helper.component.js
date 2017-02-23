define([
	'dispatcher',
	'scheme/scheme.store'
], function(
	dispatcher,
	schemeStore
) {
	"use strict";

	var elementProto = Object.create(HTMLElement.prototype);

	elementProto.createdCallback = function() {

	}
	elementProto.attachedCallback = function() {
		dispatcher.dispatch({
			type: 'scheme-color-change',
			scheme: 'dark'
		});
	}
	elementProto.detachedCallback = function() {

	}

	document.registerElement('videos-helper', {
		prototype: elementProto
	});
});