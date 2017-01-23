define([
	'dispatcher',
	'audio/audio-data.store'
], function(
	dispatcher,
	dataStore
) {
	"use strict";

	var crossFadeDuration = 0.5;

	var elementProto = function() {
		var handleStore = function() {
			var time = dataStore.getData().time;
			var duration = dataStore.getData().duration;
			var total;
			var coef;

			if (duration < crossFadeDuration) {
				duration = 0;
			}

			if (!duration) return;

			total = duration - crossFadeDuration;

			coef = time / total;
			if (coef > 1) {
				coef = 1;
			}

			this._ac.style.transform = 'scaleX(' + coef + ')';
		}

		var createdCallback = function() {
			this._handleStore = handleStore.bind(this);
		}
		var attachedCallback = function() {
			this._ac = document.getElementsByClassName('ac')[0];

			dataStore.eventEmitter.subscribe(this._handleStore);
		}
		var detachedCallback = function() {
			dataStore.eventEmitter.unsubscribe(this._handleStore);
		}


		return {
			createdCallback: createdCallback,
			attachedCallback: attachedCallback,
			detachedCallback: detachedCallback
		}
	}();

	Object.setPrototypeOf(elementProto, HTMLElement.prototype);
	document.registerElement('audio-progressbar', {
		prototype: elementProto
	});
});