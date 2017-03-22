define([
	'dispatcher',
	'slide-scroll/slide-scroll.store',
	'resize/breakpoint.store'
], function(
	dispatcher,
	store,
	bpStore
) {
	"use strict";

	var translate = function(element, position, speed) {
		var bp = bpStore.getData().name;
		element.style.transitionDuration = speed + 'ms';

		if (bp === 'mobile') {
			element.style.transform = 'translateX(' + position + '%) translateZ(0)';
		} else {
			element.style.transform = 'translateY(' + position + '%) translateZ(0)';
		}
	}

	var elementProto = Object.create(HTMLElement.prototype);

	elementProto.showSlide = function(slide, way) {
		var bg = slide.getElementsByClassName('img')[0];

		slide.classList.remove('hidden');
		this._z = this._z + 1;

		this._lSlides[this._index].style.zIndex = this._z;
		this._rSlides[this._index].style.zIndex = this._z;

		setTimeout(function() {
			translate(slide, 0, 800);
			translate(bg, 0, 800);
		}, 20);
	}

	elementProto.hideSlide = function(slide, way) {
		var bg = slide.getElementsByClassName('img')[0];
		slide.classList.add('hidden');

		setTimeout(function() {
			if (way === -1) {
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
			way = 1;
		} else if (index > this._index) {
			way = -1;
		}

		this._index = index;

		if (!this._lSlides[this._index] || !this._rSlides[this._index]) {
			console.warn('some slides are probably missing in beat-bg-slider');
			return;
		}

		this.showSlide(this._lSlides[this._index], way);
		this.showSlide(this._rSlides[this._index], -way);
		this.hideSlide(this._lSlides[this._current], way);
		this.hideSlide(this._rSlides[this._current], -way)
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
		var l = this.getElementsByClassName('l')[0];
		var r = this.getElementsByClassName('r')[0];

		this._current = 0;
		this._id = this.getAttribute('data-id');
		this._lSlides = l.getElementsByClassName('slide');
		this._rSlides = r.getElementsByClassName('slide');

		if (!this._id) {
			console.warn('data-id attribute is missing on cover-bg-slider');
		}

		this._lSlides[0].style.zIndex = 1;
		this._rSlides[0].style.zIndex = 1;

		Array.prototype.forEach.call(this._lSlides, function(slide, index) {
			var bg = slide.getElementsByClassName('img')[0];
			if (index > 0) {
				slide.classList.add('hidden');
				translate(slide, 100, 800);
				translate(bg, -80, 800);
			}
		});
		Array.prototype.forEach.call(this._rSlides, function(slide, index) {
			var bg = slide.getElementsByClassName('img')[0];
			if (index > 0) {
				slide.classList.add('hidden');
				translate(slide, -100, 800);
				translate(bg, 80, 800);
			}
		});


		store.eventEmitter.subscribe(this.handleStore);
	}
	elementProto.detachedCallback = function() {
		store.eventEmitter.unsubscribe(this.handleStore);
	}

	document.registerElement('merch-slider', {
		prototype: elementProto
	});
});