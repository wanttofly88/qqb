define([
	'dispatcher',
	'audio/audio-player.store',
	'audio/audio-data.store'
], function(
	dispatcher,
	audioStore,
	dataStore
) {
	"use strict";

	var crossFadeDuration = 0.3;

	var elementProto = Object.create(HTMLElement.prototype);

	elementProto.handleStore = function() {
		var time = dataStore.getData().time;
		var duration = dataStore.getData().duration;
		var total;
		var coef;

		var songData = audioStore.getData();

		if (!songData.song && !songData.paused && this._active) {
			this._active = false;
			this.style.display = 'none';
		} else if ((songData.song || songData.paused) && !this._active) {
			this._active = true;
			this.style.display = 'block';
		}

		if (songData.song && songData.song.name === '__ambient__') {
			this._ac.style.transform = 'scaleX(0)';
		} else {
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
	}

	elementProto.handleClick = function(e) {
		var duration = dataStore.getData().duration;

		var x = e.clientX;
		var w = this.clientWidth;
		var coef = x/w;

		dispatcher.dispatch({
			type: 'audio-goto',
			time: duration*coef
		});
	}

	elementProto.createdCallback = function() {
		this.handleStore = this.handleStore.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this._active = true;
	}
	elementProto.attachedCallback = function() {
		this._ac = document.getElementsByClassName('ac')[0];

		this.handleStore();
		this.addEventListener('click', this.handleClick);
		dataStore.eventEmitter.subscribe(this.handleStore);
	}
	elementProto.detachedCallback = function() {
		this.removeEventListener('click', this.handleClick);
		dataStore.eventEmitter.unsubscribe(this.handleStore);
	}

	document.registerElement('audio-progressbar', {
		prototype: elementProto
	});
});