define([
	'dispatcher',
	'resize/resize.store'
], function(
	dispatcher, 
	resizeStore
) {
	"use strict";

	var elementProto = function() {
		var createdCallback = function() {

		}
		var attachedCallback = function() {
			this._svg = this.classList.toggle('svg')[0];
			
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
	document.registerElement('page-preview', {
		prototype: elementProto
	});
});