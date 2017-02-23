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

	var charPool = ['$', '#', '#', '#', '%', '4', '+', '3', '7', '0', 'V', 'A'];

	if (!String.prototype.replaceAt) {
		String.prototype.replaceAt = function(index, character) {
			if (index < 0) return this;
			if (index >= this.length) return this;
			return this.substr(0, index) + character + this.substr(index + character.length);
		}
	}

	var getRandomChar = function() {
		return charPool[Math.floor(Math.random()*charPool.length)];
	}

	var elementProto = Object.create(HTMLHeadingElement.prototype);

	elementProto.split = function() {
		var self = this;
		var words = this._text.split(' ');
		this.innerHTML = '';
		
		words.forEach(function(word) {
			var span = document.createElement('span');
			var invSpan = document.createElement('span');
			span.innerHTML = invSpan.innerHTML = word;
			span.className ='wd';
			invSpan.className = 'wd-inv';
			span.style.display = invSpan.style.display = 'inline-block';
			self.appendChild(span);
			self.appendChild(document.createTextNode(' '));
		});

		// splitLines(self);
		// splitLetters(self);
	}

	elementProto.splitLines = function(h) {
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

	elementProto.splitLetters = function(h) {
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

	elementProto.animate = function() {
		var glitch = function(word) {
			var tmpText;
			var text = tmpText = word.innerHTML;
			var ln = text.length;
			var index;
			clearTimeout(to);

			for (var i = 0; i < ln/3; i++) {
				tmpText = tmpText.replaceAt(Math.random()*ln, getRandomChar());

			}

			word.innerHTML = tmpText;
			word.style.opacity = 1;

			to = setTimeout(function() {
				word.innerHTML = originalText;
				// word.style.opacity = 0;
			}, 150);
		}

		var words = this.getElementsByClassName('wd');
		var word = words[Math.floor(Math.random()*words.length)];
		var originalText =  word.innerHTML;
		var to;

		if (word) {
			setTimeout(function() {
				glitch(word);
			}, 0);
			setTimeout(function() {
				glitch(word);
			}, 200);
			setTimeout(function() {
				glitch(word);
			}, 240);
			setTimeout(function() {
				glitch(word);
			}, 280);
			setTimeout(function() {
				glitch(word);
			}, 320);
			setTimeout(function() {
				glitch(word);
			}, 360);
			setTimeout(function() {
				glitch(word);
			}, 600);
		}

		this.handleSlide();
	}

	elementProto.handleSlide = function() {
		var storeData = slideStore.getData().items[this._parentId];
		clearTimeout(this._slideTimeout);
		
		if (!storeData) return;

		if (this._index === storeData.index) {
			this._slideTimeout = setTimeout(this.animate, 12000);
		}
	}

	elementProto.handleResize = function() {
		var doResize = function() {
			this.split();
		}.bind(this);

		clearTimeout(this._resizeTimeout);
		if (!this._lastResized || Date.now() - this._lastResized > 50) {
			doResize()
		} else {
			this._resizeTimeout = setTimeout(doResize, 50);
		}
	}

	elementProto.createdCallback = function() {
		this.split = this.split.bind(this);
		this.handleResize = this.handleResize.bind(this);
		this.handleSlide = this.handleSlide.bind(this);
		this.animate = this.animate.bind(this);
	}

	elementProto.attachedCallback = function() {
		var parent  = document.getElementsByTagName('slide-scroll')[0];
		var sections;
		var self = this;

		if (parent) {
			sections = parent.getElementsByTagName('section');
			Array.prototype.forEach.call(sections, function(section, index) {
				var hd = section.getElementsByTagName('h1')[0];
				if (hd === self) {
					self._index = index;
					self._parentId = parent.getAttribute('data-id');
				}
			});
		}

		this._text = this.innerHTML;

		slideStore.eventEmitter.subscribe(this.handleSlide);
		preloaderStore.eventEmitter.subscribe(this.handleSlide);
		resizeStore.eventEmitter.subscribe(this.handleResize);
		this.handleResize();
		this.handleSlide();
	}
	elementProto.detachedCallback = function() {
		slideStore.eventEmitter.unsubscribe(this.handleSlide);
		preloaderStore.eventEmitter.unsubscribe(this.handleSlide);
		resizeStore.eventEmitter.unsubscribe(this.handleResize);
	}

	document.registerElement('header-component', {
		extends: 'h1',
		prototype: elementProto
	});
});