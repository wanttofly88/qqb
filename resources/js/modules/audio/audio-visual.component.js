define([
	'dispatcher',
	'audio/audio-data.store'
], function(
	dispatcher,
	audioStore
) {
	"use strict";

	var elementProto = Object.create(HTMLElement.prototype);

	elementProto.getAverageFreq = function(array, start, end) {
		var i;
		var summ = 0;
		var avg;
		for (var i = start; i < end; i++) {
			summ += array[i];
		}

		return Math.min((summ/(end - start))/256, 1);
	}

	elementProto.audioHandler = function() {
		var data;
		var length;
		var data = audioStore.getData();
		var freqData;
		var num = this._number;
		var self = this;
		var step;

		if (!this.active || !data.audioData) return;

		freqData = data.audioData;
		length = freqData.length;
		step = Math.round(length/(num + 1)); // last portion is kinda lame

		this._bars.forEach(function(bar, index) {
			var avg = self.getAverageFreq(freqData, step*index, step*(index + 1));
			bar.element.style.transform = 'scaleY(' + avg + ')';
		});
	}
	elementProto.start = function() {
		this.classList.add('active');
		this.active = true;
	}
	elementProto.stop = function() {
		this.classList.remove('active');
		this.active = false;
	}
	elementProto.createBar = function(i) {
		var element =  document.createElement('div');
		element.className = 'bar';
		element.style.left = Math.floor(i*this._w/this._number) + 'px';
		this._bars.push({
			element: element
		});
		this.appendChild(element);
	}

	elementProto.createdCallback = function() {
		this.audioHandler = this.audioHandler.bind(this);
		this.createBar = this.createBar.bind(this);
		this.start = this.start.bind(this);
		this.stop = this.stop.bind(this);
	}
	elementProto.attachedCallback = function() {
		var i;

		this.active = false;
		this._number = this.getAttribute('data-number') || 3;
		this._bars = [];
		this._w = this.clientWidth;

		for (i = 0; i < this._number; i++) {
			this.createBar(i);
		}

		audioStore.eventEmitter.subscribe(this.audioHandler);
	}
	elementProto.detachedCallback = function() {
		audioStore.eventEmitter.unsubscribe(this.audioHandler);
	}

	document.registerElement('audio-visual', {
		prototype: elementProto
	});
});