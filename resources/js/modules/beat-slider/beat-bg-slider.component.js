define([
	'dispatcher',
	'slide-scroll/slide-scroll.store'
], function(
	dispatcher,
	store
) {
	"use strict";

	var elementProto = function() {
		var translate = function(element, position, speed) {
			element.style.transitionDuration = speed + 'ms';
			element.style.transform = 'translateY(' + position + '%) translateZ(0)';
		}

		var showSlide = function(slide, way) {
			var bg = slide.getElementsByClassName('bg')[0];

			slide.classList.remove('hidden');
			this._z = this._z + 1;

			if (way === 'bottom') {
				translate(slide, 100, 0);
				translate(bg, -92, 0);
			} else {
				translate(slide, -100, 0);
				translate(bg, 92, 0);
			}

			this._slides[this._index].style.zIndex = this._z;

			setTimeout(function() {
				translate(slide, 0, 800);
				translate(bg, 0, 800);
			}, 20);
		}

		var hideSlide = function(slide, way) {
			var bg = slide.getElementsByClassName('bg')[0];
			slide.classList.add('hidden');

			setTimeout(function() {
			if (way === 'bottom') {
				translate(bg, -10, 800);
			} else {
				translate(bg, 10, 800);
			}
			}, 20);
		}

		var handleStore = function() {
			var storeData = store.getData().items['beat-slides'];
			var index;
			var self = this;
			var way;

			if (!storeData) return;

			index = storeData.index;

			if (index === null) return;

			if (index === this._index) {
				return
			} else if (index < this._index) {
				way = 'top';
			} else if (index > this._index) {
				way = 'bottom';
			}

			this._index = index;

			if (!this._slides[this._index]) {
				console.warn('some slides are probably missing in beat-bg-slider');
				return;
			}

			this._showSlide(this._slides[this._index], way);
			this._hideSlide(this._slides[this._current], way)
			this._current = this._index;
		}

		var createdCallback = function() {
			this._index = 0;
			this._z = 1;
			this._handleStore = handleStore.bind(this);
			this._showSlide = showSlide.bind(this);
			this._hideSlide = hideSlide.bind(this);
		}
		var attachedCallback = function() {
			this._slides = this.getElementsByClassName('slide');
			this._current = 0;

			store.eventEmitter.subscribe(this._handleStore);
		}
		var detachedCallback = function() {
			store.eventEmitter.unsubscribe(this._handleStore);
		}

		return {
			createdCallback: createdCallback,
			attachedCallback: attachedCallback,
			detachedCallback: detachedCallback
		}
	}();

	Object.setPrototypeOf(elementProto, HTMLElement.prototype);
	document.registerElement('beat-bg-slider', {
		prototype: elementProto
	});
});