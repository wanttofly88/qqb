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
	document.registerElement('albums-helper', {
		prototype: elementProto
	});
});