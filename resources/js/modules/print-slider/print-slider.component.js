define([
	'dispatcher',
	'slide-scroll/slide-scroll.store'
], function(
	dispatcher,
	slideStore
) {

	"use strict";

	var animationSpeed = 800;
	var charactersToRandomize = 4;
	var charPool = ['a', 's', 't', 'w', '#', '#', '#'];
	var numberPool = ['8'];

	if (!String.prototype.replaceAt) {
		String.prototype.replaceAt = function(index, character) {
			if (index < 0) return this;
			if (index >= this.length) return this;
			return this.substr(0, index) + character + this.substr(index + character.length);
		}
	}

	var elementProto = Object.create(HTMLElement.prototype);

	var getRandomChar = function(pool) {
		if (pool && pool === 'number') {
			return numberPool[Math.floor(Math.random()*numberPool.length)];
		} else {
			return charPool[Math.floor(Math.random()*charPool.length)];
		}
	}

	elementProto.Animation = function(line, value, speed, delay, pool) {
		this.line = line;
		this.value = '';
		this.speed = speed;
		this.delay = delay  || 0;
		this.pool = pool || null;

		this.defaults = {
			line: this.line,
			value: this.value,
			speed: this.speed,
			delay: this.delay
		}

		this.to = null;

		this.setValues = function(values) {
			this.line  = values.hasOwnProperty('line')  ? values.line  : this.defaults.line;
			this.value = values.hasOwnProperty('value') ? values.value : this.defaults.value;
			this.speed = values.hasOwnProperty('speed') ? values.speed : this.defaults.speed;
			this.delay = values.hasOwnProperty('delay') ? values.delay : this.defaults.delay;
		}

		this.start = function() {
			var charNum = 0;
			var tmpValue = '';
			var self = this;
			var currentValue = this.line.element.innerHTML;
			var valueWithSpaces = this.value;
			var t, i;
			var tmpAppend = '';

			if (valueWithSpaces.length < currentValue.length) {
				t = currentValue.length - valueWithSpaces.length;
				for (i = 0; i < t; i++) {
					valueWithSpaces += ' ';
				}
			}

			clearTimeout(this.to);

			if (this.speed === 0) {
				this.line.element.innerHTML = this.value;
				return;
			}

			var _loop = function() {
				if (charNum >= valueWithSpaces.length + charactersToRandomize + 1) {
					self.line.element.innerHTML = self.value;
					return;
				}

				tmpValue = valueWithSpaces.substring(0, charNum);
				for (var i = 0; i <= charactersToRandomize; i++) {
					// should do it more interesting
					if (tmpValue.charAt(charNum - i) !== currentValue.charAt(charNum - i)) {
						tmpValue = tmpValue.replaceAt(charNum - i, getRandomChar(self.pool));
					}
				}

				tmpAppend = currentValue.substring(tmpValue.length, currentValue.length)
				self.line.element.innerHTML = tmpValue + tmpAppend;
				charNum++;

				self.to = setTimeout(_loop, self.speed/valueWithSpaces.length);
			}
			
			this.to = setTimeout(_loop, this.delay);
		}
	}

	elementProto.haldleSlideStore = function() {
		var index;
		var storeItems = slideStore.getData().items;
		var textData;

		if (!storeItems[this._parentId]) {
			return;
		};

		index = slideStore.getData().items[this._parentId].index;

		textData = this._textData[index];
		if (!textData) return;

		if (this._lastStoreIndex === index) return;

		if (this._lastStoreIndex === null) {
			this._lines.forEach(function(line, index) {
				line.animation.setValues({
					speed: 0,
					delay: 0,
					value: textData.lines[index]
				});
				line.animation.start();
			}); 
		} else {
			this._lines.forEach(function(line, index) {
				line.animation.setValues({
					speed: 500,
					delay: 600 + index*100,
					value: textData.lines[index]
				});
				line.animation.start();
			}); 
		}


		this._lastStoreIndex = index;
	}

	elementProto.createdCallback = function() {
		this.haldleSlideStore = this.haldleSlideStore.bind(this);
	}
	elementProto.attachedCallback = function() {
		var lines = this.getElementsByTagName('div');
		var self = this;
		var parent  = document.getElementsByTagName('slide-scroll')[0];
		var sections = parent.getElementsByTagName('section');

		this._id = this.getAttribute('data-id');
		this._parentId = parent.getAttribute('data-id');
		this._lastStoreIndex = null;

		this._lines = [];
		this._textData = [];
		this._pool = this.getAttribute('data-pool') || null;

		Array.prototype.forEach.call(lines, function(line, index) {
			var defaultText = line.innerHTML;
			var lineObj = {
				element: line,
				way: 'forward'
			}

			self._lines.push({
				element: line,
				animation: new self.Animation(lineObj, null, animationSpeed, index*150, self._pool)
			});
		});

		Array.prototype.forEach.call(sections, function(section, index) {
			var textElement = section.querySelector('.data-text[data-id="' + self._id + '"]');
			var lines;

			if (textElement) {
				lines = textElement.getElementsByTagName('div');
				self._textData[index] = {
					element: textElement,
					lines: []
				}

				Array.prototype.forEach.call(lines, function(line) {
					self._textData[index].lines.push(line.innerHTML);
				});
			}
		});
		this.haldleSlideStore();
		slideStore.eventEmitter.subscribe(this.haldleSlideStore);
	}
	elementProto.detachedCallback = function() {
		slideStore.eventEmitter.unsubscribe(this.haldleSlideStore);
	}


	document.registerElement('print-slider', {
		prototype: elementProto
	});
});