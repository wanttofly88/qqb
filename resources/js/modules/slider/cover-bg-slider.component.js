define([
	'dispatcher',
	'slide-scroll/slide-scroll.store'
], function(
	dispatcher,
	store
) {
	"use strict";

	var translate = function(element, position, speed) {
		element.style.transitionDuration = speed + 'ms';
		element.style.transform = 'translateY(' + position + '%) translateZ(0)';
	}

	var elementProto = Object.create(HTMLElement.prototype);

	elementProto.showSlide = function(slide, way) {
		var bg = slide.getElementsByClassName('bg')[0];

		slide.classList.remove('hidden');
		this._z = this._z + 1;

		// if (way === 'bottom') {
		// 	translate(slide, 100, 0);
		// 	translate(bg, -92, 0);
		// } else {
		// 	translate(slide, -100, 0);
		// 	translate(bg, 92, 0);
		// }

		this._slides[this._index].style.zIndex = this._z;

		setTimeout(function() {
			translate(slide, 0, 800);
			translate(bg, 0, 800);
		}, 20);
	}

	elementProto.hideSlide = function(slide, way) {
		var bg = slide.getElementsByClassName('bg')[0];
		slide.classList.add('hidden');

		setTimeout(function() {
			if (way === 'bottom') {
				translate(slide, -100, 800);
				translate(bg, 80, 800);
			} else {
				translate(slide, 100, 800);
				translate(bg, -80, 800);
			}
		}, 20);
	}

	elementProto.handleStore = function() {
		var storeData = store.getData().items[this._id];
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

		this.showSlide(this._slides[this._index], way);
		this.hideSlide(this._slides[this._current], way)
		this._current = this._index;
	}

	elementProto.createdCallback = function() {
		this._index = 0;
		this._z = 1;
		this.handleStore = this.handleStore.bind(this);
		this.showSlide = this.showSlide.bind(this);
		this.hideSlide = this.hideSlide.bind(this);
	}
	elementProto.attachedCallback = function() {
		this._slides = this.getElementsByClassName('slide');
		this._current = 0;
		this._id = this.getAttribute('data-id');
		if (!this._id) {
			console.warn('data-id attribute is missing on cover-bg-slider');
		}

		this._slides[0].style.zIndex = 1;

		Array.prototype.forEach.call(this._slides, function(slide, index) {
			var bg = slide.getElementsByClassName('bg')[0];
			if (index > 0) {
				slide.classList.add('hidden');
				translate(slide, 100, 800);
				translate(bg, -80, 800);
			}
		});

		store.eventEmitter.subscribe(this.handleStore);
	}
	elementProto.detachedCallback = function() {
		store.eventEmitter.unsubscribe(this.handleStore);
	}

	document.registerElement('cover-bg-slider', {
		prototype: elementProto
	});
});