define([
	'dispatcher',
	'resize/resize.store',
	'slide-scroll/slide-scroll.store',
	'preloader/preloader.store',
	'scheme/scheme.store',
	'utils'
], function(
	dispatcher,
	resizeStore,
	slideStore,
	preloaderStore,
	schemeStore,
	utils
) {
	"use strict";

	var loopDelay = 4000;
	var letterSpeed = 800;
	var requestAnimationFrame = utils.getRequestAnimationFrame();

	var translate = function(element, position, speed) {
		var inner = element.getElementsByClassName('lt-s2')[0];
		element.style.transitionDuration = speed + 'ms';
		element.style.transform = 'translateY(' + position + 'px) translateZ(0)';
		element.style.opacity = 1;
		if (inner) {
			inner.style.transitionDuration = speed + 'ms';
			inner.style.height = '100%';
		}
	}

	var elementProto = function() {
		var split = function() {
			var self = this;
			var words = this._text.split(' ');
			this.innerHTML = '';
			
			words.forEach(function(word) {
				var span = document.createElement('span');
				span.innerHTML = word;
				span.className ='wd';
				span.style.display = 'inline-block';
				self.appendChild(span);
				self.appendChild(document.createTextNode(' '));
			});

			splitLines(self);
			splitLetters(self);

			this.appendChild(this._canvas);
		}

		var splitLines = function(h) {
			var words = h.getElementsByClassName('wd');
			var lines = {};
			var offs = -100;
			var div;
			var soff;

			var createLine = function(line) {
				var div = document.createElement('div');
				div.className = 'ln';
				line.spans.forEach(function(span, index) {
					div.appendChild(span);
					if (index !== line.spans.length) {
						div.appendChild(document.createTextNode(' '));
					}
				});

				h.appendChild(div);
			}

			Array.prototype.forEach.call(words, function(word) {
				var soff = word.offsetTop;

				if (soff > offs) {
					offs = soff;
				}
				if (!lines[offs]) {
					lines[offs] = {
						spans: []
					};
				}

				lines[offs].spans.push(word);
			});

			for (offs in lines) {
				if (lines.hasOwnProperty(offs)) {
					createLine(lines[offs]);
				}
			}
		}

		var splitLetters = function(h) {
			var words = h.getElementsByClassName('wd');

			Array.prototype.forEach.call(words, function(word) {
				var letters = word.innerHTML.split('');

				word.innerHTML = '';
				letters.forEach(function(letter) {
					var span = document.createElement('span');
					var s1 = document.createElement('span');
					var s2 = document.createElement('span');
					span.className = 'lt';
					span.innerHTML = letter;

					span.style.display = 'inline-block';

					word.appendChild(span);
				});
			});
		}

		var prepare = function() {
			var lines = this.getElementsByClassName('ln');
			var letters = this.getElementsByClassName('lt');
			var length = lines[0].getElementsByTagName('lt').length;

			var totalLetters = letters.length;
			var r1;

			if (this._visible) return;

			for (var i = 0; i < letters.length/4; i++) {
				r1 = Math.floor(Math.random()*(totalLetters - 2) + 1);
				letters[r1].classList.add('letter-hidden');
			}

			clearTimeout(this._loopTimeout);
		}

		var appear = function() {
			var self = this;
			var lines = this.getElementsByClassName('ln');
			var letters = this.getElementsByClassName('lt');

			if (this._visible) return;
			this._firstTime = false;
			this._visible = true;

			this.classList.add('header-visible');
			Array.prototype.forEach.call(letters, function(lt, index) {
				lt.classList.remove('letter-hidden');
			})

			this._loopTimeout = setTimeout(self._loop, loopDelay + letterSpeed);
		}

		var buildCanvas = function() {
			var canvas = this._canvas;
			var canvasInverted = this._canvasInverted;
			var ctx = this._ctx;
			var ctxInvert = canvasInverted.getContext('2d');
			var lines = this.getElementsByClassName('ln');
			var styles = getComputedStyle(this);
			var lineIndex = 0;
			var pt = styles.paddingTop;

			var scheme = schemeStore.getData().scheme;

			canvas.width = this.clientWidth;
			canvas.height = this.clientHeight;
			canvas.style.left = '0px';
			canvas.style.top = parseInt(pt) + 'px';

			canvasInverted.width = canvas.width;
			canvasInverted.height = canvas.height;

			if (scheme === 'bright') {
				ctxInvert.fillStyle = '#101010';
			} else {
				ctxInvert.fillStyle = '#ffffff';
			}
			ctxInvert.fillRect(0, 0, canvas.width, canvas.height)
			if (scheme === 'bright') {
				ctxInvert.fillStyle = '#ffffff';
			} else {
				ctxInvert.fillStyle = '#010101';
			}

			ctxInvert.font = styles.fontSize + ' ' + styles.fontFamily;
			ctxInvert.textBaseline = 'top';

			Array.prototype.forEach.call(lines, function(line) {
				var words = line.getElementsByClassName('wd');
				var offs = 0;
				var ltWidth;
				var ltHeight;

				Array.prototype.forEach.call(words, function(word) {
					var letters = word.getElementsByClassName('lt');

					Array.prototype.forEach.call(letters, function(letter, index) {
						var char = letter.innerHTML.toUpperCase();
						ltWidth = letter.clientWidth;
						ltHeight = letter.clientHeight;

						// dont ask any questions. it works;
						ctxInvert.fillText(char, offs, -ltHeight/10 + ltHeight*lineIndex);
						offs += ltWidth;
					});

					ctxInvert.fillText(' ' , offs, -ltHeight/10 + ltHeight*lineIndex);
					offs += ltWidth;
				});

				lineIndex++;
			});
		}

		var handleResize = function() {
			var lt;
			var words;
			var lines;
			var self = this;

			clearTimeout(this._resizeTimeouts.main);
			clearTimeout(this._resizeTimeouts.canvas);

			this._w = this.clientWidth;
			this._h = this.clientHeight;

			this._resizeTimeouts.main = setTimeout(function() {
				self._split();
				self._prepare();

				lt = self.getElementsByClassName('lt')[0];
				words = self.getElementsByClassName('wd');
				lines = self.getElementsByClassName('ln');

				Array.prototype.forEach.call(words, function(word) {
					if (word.clientHeight === lt.clientHeight) return;
					word.style.height = lt.clientHeight + 'px';
				});
				Array.prototype.forEach.call(lines, function(ln) {
					if (ln.clientHeight === lt.clientHeight) return;
					ln.style.height = lt.clientHeight + 'px';
				});

				self._buildCanvas();
			}, 100);
		}

		var glitch = function(x, y, w, h) {
			var self = this;
			var ctx = this._ctx;
			var canvasInverted = this._canvasInverted;
			var ch = canvasInverted.height;
			var cw = canvasInverted.width;
			var x, y, w, h;

			ctx.clearRect(0, 0, cw, ch);

			ctx.save();
			ctx.beginPath();
			ctx.rect(x, y, w, h);
			ctx.clip();
			ctx.drawImage(canvasInverted, 0, 0);
			ctx.restore();
		}

		var clear = function() {
			var ctx = this._ctx;
			var canvasInverted = this._canvasInverted;
			var ch = canvasInverted.height;
			var cw = canvasInverted.width;
			ctx.clearRect(0, 0, cw, ch);
		}

		var loop = function() {
			// var self = this;
			// var ctx = this._ctx;

			// setTimeout(function() {
			// 	ctx.globalAlpha = 0.5;
			// 	self._glitch(80, 40, 100, 100);
			// }, 0);
			// setTimeout(function() {
			// 	ctx.globalAlpha = 1;
			// 	self._glitch(80, 40, 100, 100);
			// }, 20);

			// setTimeout(function() {
			// 	ctx.globalAlpha = 0.5;
			// 	self._glitch(360, 80, 80, 80);
			// }, 60);

			// setTimeout(self._clear, 80);

			this._loopTimeout = setTimeout(self._loop, loopDelay);
		}

		var handleSlide = function() {
			var preloaded = preloaderStore.getData().complete;
			var items = slideStore.getData().items;
			var index;
			var to = 600;
			var self = this;

			if (!items.hasOwnProperty(this._parentId)) return;
			if (!this._parentId) return;

			index = items[this._parentId].index;
			if (preloaded && 's' + index === this._id && !this._visible) {
				if (index === 0 && self._firstTime) to = 0;
				setTimeout(self._appear, to)
			} else if (preloaded && 's' + index !== this._id  && this._visible) {
				this._visible = false;
				this._prepare();
			}
		}

		var createdCallback = function() {
			this._visible = false;
			this._firstTime = true;
			this._split = split.bind(this);
			this._appear = appear.bind(this);
			this._prepare = prepare.bind(this);
			this._handleResize = handleResize.bind(this);
			this._handleSlide = handleSlide.bind(this);
			this._buildCanvas = buildCanvas.bind(this);
			this._loop = loop.bind(this);
			this._glitch = glitch.bind(this);
			this._clear = clear.bind(this);
		}

		var attachedCallback = function() {
			var parant  = document.getElementsByTagName('slide-scroll')[0];
			var sections;
			var self = this;

			this._resizeTimeouts = {
				main: undefined,
				canvas: undefined
			}

			this._id = null;
			this._w = this.clientWidth;
			this._h = this.clientHeight;

			if (this.classList.contains('header-visible')) {
				this._visible = true;
			}

			if (parant) {
				sections = parant.getElementsByTagName('section');
				Array.prototype.forEach.call(sections, function(section, index) {
					var hd = section.getElementsByTagName('h1')[0];
					if (hd === self) {
						self._id = 's' + index;
						self._parentId = parant.getAttribute('data-id');
					}
				});
			}

			this._text = this.innerHTML;

			this._canvas = document.createElement('canvas');
			this._canvasInverted = document.createElement('canvas');
			this._ctx = this._canvas.getContext('2d');
			this.appendChild(this._canvas);

			slideStore.eventEmitter.subscribe(this._handleSlide);
			preloaderStore.eventEmitter.subscribe(this._handleSlide);
			resizeStore.eventEmitter.subscribe(this._handleResize);

			this._handleResize();
		}
		var detachedCallback = function() {
			slideStore.eventEmitter.unsubscribe(this._handleSlide);
			preloaderStore.eventEmitter.unsubscribe(this._handleSlide);
			resizeStore.eventEmitter.unsubscribe(this._handleResize);
		}


		return {
			createdCallback: createdCallback,
			attachedCallback: attachedCallback,
			detachedCallback: detachedCallback
		}
	}();

	Object.setPrototypeOf(elementProto, HTMLHeadingElement.prototype);
	document.registerElement('header-appear', {
		extends: 'h1',
		prototype: elementProto
	});
});