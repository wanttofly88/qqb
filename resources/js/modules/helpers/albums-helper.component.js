define([
	'dispatcher',
	'popup/popup.store',
	'slide-scroll/slide-scroll.store',
	'audio/audio-player.store'
], function(
	dispatcher,
	popupStore,
	slideStore,
	playerStore
) {
	"use strict";

	var elementProto = function() {
		var createdCallback = function() {

		}
		var attachedCallback = function() {
			var pw = document.getElementsByClassName('page-wrapper')[0];
			pw.setAttribute('data-scheme', 'dark');
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
	document.registerElement('albums-helper', {
		prototype: elementProto
	});
});