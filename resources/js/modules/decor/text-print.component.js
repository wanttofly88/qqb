define([
	'dispatcher',
	'slide-scroll/slide-scroll.store'
], function(
	dispatcher,
	slideStore
) {
	"use strict";

	var animationSpeed = 400;
	var charactersToRandomize = 4;
	var charPool = ['a', 's', 't', 'w', '#', '#', '#'];

	if (!String.prototype.replaceAt) {
		String.prototype.replaceAt = function(index, character) {
			if (index < 0) return this;
			if (index >= this.length) return this;
			return this.substr(0, index) + character + this.substr(index + character.length);
		}
	}

	var elementProto = Object.create(HTMLElement.prototype);

	var getRandomChar = function() {
		return charPool[Math.floor(Math.random()*charPool.length)];
	}

	elementProto.Animation = function(line, value, speed, delay) {
		this.line = line;
		this.value = value === null ? this.line.defaultText : value;
		this.speed = speed/this.value.length;
		this.delay = delay  || 0;

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
			var way = this.line.way;
			var self = this;
			clearTimeout(this.to);

			if (this.speed === 0) {
				this.line.element.innerHTML = this.value;
				return;
			}

			this.line.element.innerHTML = '';

			var _loop = function() {
				if (charNum >= self.value.length + charactersToRandomize + 1) return;

				if (way === 'reverse') {
					tmpValue = self.value.substring(self.value.length - charNum, self.value.length);
					for (var i = 0; i <= charactersToRandomize; i++) {
						if (self.value.length - charNum - i > 0) {
							tmpValue = tmpValue.replaceAt(i, getRandomChar());
						}
					}
				} else {
					tmpValue = self.value.substring(0, charNum);
					for (var i = 0; i <= charactersToRandomize; i++) {
						tmpValue = tmpValue.replaceAt(charNum - i, getRandomChar());
					}
				}

				self.line.element.innerHTML = tmpValue;
				charNum++;

				self.to = setTimeout(_loop, self.speed);
			}
			
			this.to = setTimeout(_loop, this.delay);
		}
	}

	elementProto.haldleSlideStore = function() {
		var index;
		var storeItems = slideStore.getData().items;
		if (!storeItems[this._parentId]) return;

		index = slideStore.getData().items[this._parentId].index;

		if (index === this._index) {
			if (this._lastStoreIndex === null) {
				this._lines.forEach(function(line, index) {
					line.animation.setValues({
						speed: 0,
						delay: 0
					});
					line.animation.start();
				}); 
			} else {
				this._lines.forEach(function(line, index) {
					line.animation.setValues({
						delay: 600 + index*100
					});
					line.animation.start();
				}); 
			}
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
		var others = document.getElementsByTagName('text-print');

		this._parentId = parent.getAttribute('data-id');
		this._lines = [];
		this._lastStoreIndex = null;

		Array.prototype.forEach.call(others, function(other, index) {
			if (other === self) {
				self._index = index;
			}
		});

		Array.prototype.forEach.call(lines, function(line, index) {
			var defaultText = line.innerHTML;
			var lineObj = {
				element: line,
				defaultText: defaultText,
				way: 'forward'
			}

			self._lines.push({
				element: line,
				animation: new self.Animation(lineObj, null, animationSpeed, index*150)
			});

			// line.innerHTML = '';
		});

		this.haldleSlideStore();
		slideStore.eventEmitter.subscribe(this.haldleSlideStore);
	}
	elementProto.detachedCallback = function() {
		slideStore.eventEmitter.unsubscribe(this.haldleSlideStore);
	}

	document.registerElement('text-print', {
		prototype: elementProto
	});
});