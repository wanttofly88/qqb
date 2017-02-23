define([
	'dispatcher',
	'slide-scroll/slide-scroll.store',
	'popup/popup.store'
], function(
	dispatcher,
	store,
	popupStore
) {
	"use strict";

	var idName = 'slide-scroll-';
	var idNum  = 1;

	var SHIFT  = 150; // if set, this is a value in pixel which slide will trevel;

	var fireResize = function() {
		var evt = document.createEvent("HTMLEvents");
		evt.initEvent('resize', true, false);
		window.dispatchEvent(evt);
	}

	var translate = function(element, position, speed) {
		element.style.transitionDuration = speed + 'ms';
		element.style.transform = 'translateY(' + position + 'px) translateZ(0)';
	}

	var elementProto = Object.create(HTMLElement.prototype);

	elementProto.KeyboardHandler = function(component) {
		this.component = component;

		this.onKeyDown = function(e) {
			var keyCode = e.which;

			if (keyCode === 17) {
				this.component._ctrl = true;
			}

			if (this.component._isScrolling) return;
			if (popupStore.getData().active) return;

			if (keyCode === 38 || keyCode === 33) {
				dispatcher.dispatch({
					type: 'slide-scroll',
					id: this.component._id,
					direction: 'top'
				});
			} else if (keyCode === 40 || keyCode === 34) {
				dispatcher.dispatch({
					type: 'slide-scroll',
					id: this.component._id,
					direction: 'bottom'
				});
			}
		}.bind(this);

		this.onKeyUp = function() {
			this.component._ctrl = false;
		}.bind(this);

		this.set = function() {
			document.addEventListener('keydown', this.onKeyDown);
			document.addEventListener('keyup', this.onKeyUp);
		}

		this.remove = function() {
			document.removeEventListener('keydown', this.onKeyDown);
			document.removeEventListener('keyup', this.onKeyUp);
		}
	}

	elementProto.WheelHandler = function(component) {
		this.component = component;
		this._time = null;

		this._resetBuffer = function() {
			this._scrollBuffer = [];
			for (var i = 0; i < 40; i++) {
				this._scrollBuffer.push(0);
			}
		}

		this._resetBuffer();

		this.onWheel = function(e) {
			var value = e.wheelDelta || -e.deltaY || -e.detail;
			var direction = value > 0 ? 'top' : 'bottom';
			var previousTime;
			var summ1, summ2;
			var bufferOld, bufferNew;

			if (this.component._ctrl) return;

			if (Math.abs(e.wheelDeltaX) > Math.abs(e.wheelDelta) || Math.abs(e.deltaX ) > Math.abs(e.deltaY)) return;

			previousTime = this._time;
			this._time = new Date().getTime();

			if (previousTime && this._time - previousTime > 200) {
				this._resetBuffer();
			}

			this._scrollBuffer.push(Math.abs(value));
			this._scrollBuffer.shift();

			if (this.component._isScrolling) return;
			if (popupStore.getData().active) return;

			bufferNew = this._scrollBuffer.slice(20, 40);
			bufferOld = this._scrollBuffer.slice(0, 20);

			summ1 = bufferNew.reduce(function(previousValue, currentValue) {
				return previousValue + currentValue;
			});
			summ2 = bufferOld.reduce(function(previousValue, currentValue) {
				return previousValue + currentValue;
			});

			summ1 = summ1/20;
			summ2 = summ2/20;

			if (summ1*0.7 >= summ2) {
				dispatcher.dispatch({
					type: 'slide-scroll',
					id: this.component._id,
					direction: direction
				});
			}
		}.bind(this);

		this.set = function() {
			document.addEventListener('mousewheel', this.onWheel);
			document.addEventListener('wheel', this.onWheel);
		}
		this.remove = function() {
			document.removeEventListener('mousewheel', this.onWheel);
			document.removeEventListener('wheel', this.onWheel);
		}
	}

	elementProto.TouchHandler = function(component) {
		this.component = component;
		this._start = {};
		this._delta = {};
		this._horizontal = undefined;
		this._edge = false;

		this.ontouchstart = function(e) {
			var touches = e.touches[0];
			var storeData = store.getData().items[this.component._id];

			this.wh = this.component.clientHeight;
			this.index = storeData.index;

			this._start = {
				x: touches.pageX,
				y: touches.pageY,
				time: +new Date
			}
			this._delta = {}
			this._horizontal = undefined;

			window.addEventListener('touchmove', this.ontouchmove);
			window.addEventListener('touchend',  this.ontouchend);

		}.bind(this);

		this.ontouchmove = function(e) {
			var touches;
			var move = 0;
			var touchMoveEvent;

			if (e.touches.length > 1 || e.scale && e.scale !== 1) return;
			touches = event.touches[0];

			this.touches = event.touches[0];

			this._delta = {
				x: this.touches.pageX - this._start.x,
				y: this.touches.pageY - this._start.y
			}

			if (typeof this._horizontal === undefined) {
				this._horizontal = !!(this._horizontal || Math.abs(this._delta.y) < Math.abs(this._delta.x));
			}

			if (this._horizontal) return;

			move = this._delta.y/3;

			if (this._delta.y > 0 && this.index <= 0) {
				this._edge = true;
			} else if (this._delta.y < 0 && this.index >= this.component._total - 1) {
				this._edge = true;
			} else {
				this._edge = false;
			}

			if (this._edge) {
				move = move / 4;
			}
			if (this._edge) return;

			touchMoveEvent = new CustomEvent('touchshift', {
				'detail': move
			})
			this.component.dispatchEvent(touchMoveEvent);

			if (this.component._shift) {
				translate(this.component._wrapper, -this.component._shift*this.index + move, 0);
			} else {
				translate(this.component._wrapper, -this.wh*this.index + move, 0);
			}

		}.bind(this);

		this.ontouchend =  function(e) {
			var duration = +new Date - this._start.time;
			var check = parseInt(duration) < 250 && Math.abs(this._delta.y) > 20 || Math.abs(this._delta.y) > 100;
			var returnSpeed = 250;
			var touchEndEvent;

			this.component.removeEventListener('touchmove', this.ontouchmove, false);
			this.component.removeEventListener('touchend',  this.ontouchend, false);

			if (this._horizontal) return;

			if (check && !this._edge) {
				dispatcher.dispatch({
					type: 'slide-scroll',
					id: this.component._id,
					direction: this._delta.y > 0 ? 'top' : 'bottom'
				});
			} else {
				if (this._edge) returnSpeed = 150;

				if (this.component._shift) {
					translate(this.component._wrapper, -this.component._shift*this.index, returnSpeed);
				} else {
					translate(this.component._wrapper, -this.wh*this.index, returnSpeed);
				}

				touchEndEvent = new CustomEvent('touchcancel')
				this.component.dispatchEvent(touchEndEvent);
			}
		}.bind(this);

		this.set = function() {
			window.addEventListener('touchstart', this.ontouchstart);
		}

		this.remove = function() {
			window.removeEventListener('touchstart', this.ontouchstart);
			window.removeEventListener('touchmove', this.ontouchmove);
			window.removeEventListener('touchend',  this.ontouchend);
		}
	}

	elementProto.storeHandler = function() {
		var storeData = store.getData().items[this._id];
		var wh = window.innerHeight;
		var self = this;
		var timeForBlocking = store.getData().timeForBlocking;
		var animationSpeed = store.getData().animationSpeed;

		this._isScrolling = true;

		setTimeout(function() {
			self._isScrolling = false;
		}, timeForBlocking);

		if (this._slides[storeData.index - 1]) {
			this._slides[storeData.index - 1].classList.add('slide-previous');
		}

		this._slides[storeData.index].classList.remove('slide-previous');
		this._slides[storeData.index].classList.remove('slide-next');

		if (this._slides[storeData.index + 1]) {
			this._slides[storeData.index + 1].classList.add('slide-next');
		}

		if (this._shift) {
			translate(this._wrapper, -this._shift*storeData.index, animationSpeed);
		} else {
			translate(this._wrapper, -wh*storeData.index, animationSpeed);
		}
	}

	elementProto.scrollHandler = function(e) {
		var scrolled = window.scrollY;
		var maxIndex = 0;

		if (this._active === true) return;

		Array.prototype.forEach.call(this._slides, function(slide, index) {
			if (scrolled + 50 >= slide.offsetTop) {
				maxIndex = index;
			}
		});

		if (maxIndex === this.index) return;
		this.index = maxIndex;

		dispatcher.dispatch({
			type: 'slide-scroll-to',
			id: this._id,
			index: maxIndex,
			native: true
		});
	}

	elementProto.activate = function() {
		var self = this;
		var r = document.getElementsByTagName('html')[0];
		var wh = window.innerHeight;

		r.classList.add('slide-scroll-active');
		r.classList.remove('slide-scroll-inactive');

		if (this._active === true) return;
		this._active = true;

		store.eventEmitter.subscribe(this.storeHandler);
		this.touchHandler.set();
		this.wheelHandler.set();
		this.keyboardHandler.set();
		this.classList.add('slide-mode');
		this.classList.remove('scroll-mode');
		this.scrollTop = 0;

		Array.prototype.forEach.call(this._slides, function(slide, index) {
			slide.style.position = 'absolute';
			slide.style.height = '100%';
			slide.style.width = '100%';
			slide.style.top = self._shift*index + 'px';
			if (self._shift) {
				slide.style.top = self._shift*index + 'px';
			} else {
				slide.style.top = wh*index + 'px';
			}
		});

		this.resizeHandler();
		setTimeout(fireResize, 20);
	}

	elementProto.deactivate = function() {
		var self = this;
		var r = document.getElementsByTagName('html')[0];

		r.classList.remove('slide-scroll-active');
		r.classList.add('slide-scroll-inactive');

		if (this._active === false) return;
		this._active = false; 

		store.eventEmitter.unsubscribe(this.storeHandler);
		this.touchHandler.remove();
		this.wheelHandler.remove();
		this.keyboardHandler.remove();
		this.classList.remove('slide-mode');
		this.classList.add('scroll-mode');

		Array.prototype.forEach.call(this._slides, function(slide, index) {
			slide.style.position = 'relative';
			if (self._minHeight) {
				slide.style.height = self._minHeight + 'px';
			} else {
				slide.style.height = '';
			}
			slide.style.top = '0px';
		});

		translate(this._wrapper, 0, 0);
		setTimeout(fireResize, 20);
	}

	elementProto.resizeHandler = function() {
		var storeData = store.getData().items[this._id];
		var wh = window.innerHeight;
		var ww = window.innerWidth;

		var minHeight;

		if (!storeData) {
			console.warn('slide-scroll internall error');
			return;
		}

		if (this._minHeights) {
			minHeight = this._minHeights.reduce(function(prev, cur) {
				return cur.bp < ww ? cur: prev;
			});

			this._minHeight = minHeight;

			if (wh < minHeight.h) {
				this.deactivate();
			} else if (wh >= minHeight.h) {
				this.activate();
			}
		}

		if (this._active) {
			if (this._shift) {
				translate(this._wrapper, -this._shift*storeData.index, 0);
			} else {
				translate(this._wrapper, -wh*storeData.index, 0);
			}
		}
	}

	elementProto.createdCallback = function() {
		this._ctrl = false;
		this._active = undefined;
		this.storeHandler  = this.storeHandler.bind(this);
		this.resizeHandler = this.resizeHandler.bind(this);
		this.scrollHandler = this.scrollHandler.bind(this);
		this.touchHandler  = new this.TouchHandler(this);
		this.wheelHandler  = new this.WheelHandler(this);
		this.keyboardHandler  = new this.KeyboardHandler(this);
		this.activate   = this.activate.bind(this);
		this.deactivate = this.deactivate.bind(this);
		this.index = 0;
		this._shift = SHIFT || null;
	}

	elementProto.attachedCallback = function() {
		var self = this;
		this._slides = this.getElementsByClassName('js-slide');
		this._active = undefined;
		this._wrapper = this.getElementsByClassName('slide-scroll-wrapper')[0];
		this._id = this.getAttribute('data-id') || (idName + (idNum++));
		this._total = this._slides.length;
		this.setAttribute('data-id', this._id);

		this._minHeights = this.getAttribute('data-min-heights');
		this._minHeights = this._minHeights ? this._minHeights.split(';').map(function(item) {
				var vals = item.split(':');
				return {
					bp: parseInt(vals[0]),
					h: parseInt(vals[1])
				}
			}): null;

		dispatcher.dispatch({
			type: 'slide-scroll-add',
			id: this._id,
			index: 0,
			total: this._total
		});

		Array.prototype.forEach.call(this._slides, function(slide, index) {
			if (index > 0) {
				slide.classList.add('slide-next');
			}
		});

		this.resizeHandler();
		window.addEventListener('resize', this.resizeHandler);
		window.addEventListener('scroll', this.scrollHandler);

		setTimeout(function() {
			self.classList.add('slide-scroll-ready');
		}, 20);
	}

	elementProto.detachedCallback = function() {
		window.removeEventListener('resize', this.resizeHandler);
		window.removeEventListener('scroll', this.scrollHandler);
		this.deactivate();

		dispatcher.dispatch({
			type: 'slide-scroll-remove',
			id: this._id
		});
	}

	document.registerElement('slide-scroll', {
		prototype: elementProto
	});
});