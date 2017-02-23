define([
	'dispatcher',
	'slide-scroll/slide-scroll.store'
], function(
	dispatcher,
	store
) {
	"use strict";

	var translatePos = function(element, position, opacity, speed) {
		element.style.transitionDuration = speed + 'ms';
		element.style.transform = 'translateY(' + position + 'px) translateZ(0)';
		element.style.opacity = opacity;
	}
	var translateScale = function(element, scale, opacity, speed) {
		element.style.transitionDuration = speed + 'ms';
		element.style.transform = 'scale(' + scale + ') translateZ(0)';
		element.style.opacity = opacity;
	}

	var elementProto = Object.create(HTMLElement.prototype);

	elementProto.showSlide = function(slide, way) {
		slide.classList.remove('hidden');
		this._z = this._z + 1;
		slide.style.zIndex = this._z;

		if (way === 'bottom') {
			setTimeout(function() {
				translateScale(slide, 1, 1, 500);
			}, 300);
		} else {
			setTimeout(function() {
				translatePos(slide, 0, 1, 500);
			}, 300);
		}
	}
	elementProto.hideSlide = function(slide, way) {
		slide.classList.add('hidden');
		if (way === 'bottom') {
			translatePos(slide, -200, 0, 800);
		} else {
			translateScale(slide, 1.1, 0, 800);
		}
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
				translateScale(slide, 1.1, 0, 0);
			}
		});

		store.eventEmitter.subscribe(this.handleStore);
	}
	elementProto.detachedCallback = function() {
		store.eventEmitter.unsubscribe(this.handleStore);
	}

	document.registerElement('cover-slider', {
		prototype: elementProto
	});
});