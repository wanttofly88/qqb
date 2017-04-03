define(['dispatcher'], function(dispatcher) {
	"use strict";

	var elementProto = Object.create(HTMLElement.prototype);

	var animationSpeed = 300;
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

	var getRandomChar = function(pool) {
		if (pool && pool === 'number') {
			return numberPool[Math.floor(Math.random()*numberPool.length)];
		} else {
			return charPool[Math.floor(Math.random()*charPool.length)];
		}
	}

	elementProto.handleMutation = function(e) {
		var charNum = 0;
		var tmpValue = '';
		var self = this;
		var currentValue = this.innerHTML;
		var valueWithSpaces = e.value;
		var t, i;
		var tmpAppend = '';

		if (valueWithSpaces.length < currentValue.length) {
			t = currentValue.length - valueWithSpaces.length;
			for (i = 0; i < t; i++) {
				valueWithSpaces += ' ';
			}
		}

		clearTimeout(this.to);

		var _loop = function() {
			if (charNum >= valueWithSpaces.length + charactersToRandomize + 1) {
				self.innerHTML = e.value;
				return;
			}

			tmpValue = valueWithSpaces.substring(0, charNum);
			for (var i = 0; i <= charactersToRandomize; i++) {
				if (tmpValue.charAt(charNum - i) !== currentValue.charAt(charNum - i)) {
					tmpValue = tmpValue.replaceAt(charNum - i, getRandomChar(charPool));
				}
			}

			tmpAppend = currentValue.substring(tmpValue.length, currentValue.length);
			self.innerHTML = tmpValue + tmpAppend;
			charNum++;

			self.to = setTimeout(_loop, animationSpeed/valueWithSpaces.length);
		}
		
		this.to = setTimeout(_loop, 0);
	}

	elementProto.handleDispatcher = function(e) {
		if (e.type === 'title-change') {
			this.handleMutation(e);
		}
	}
	elementProto.createdCallback = function() {
		this.handleDispatcher = this.handleDispatcher.bind(this);
		this.handleMutation = this.handleMutation.bind(this);
	}
	elementProto.attachedCallback = function() {
		this._text = this.innerHTML;
		dispatcher.subscribe(this.handleDispatcher);
	}
	elementProto.detachedCallback = function() {
		dispatcher.unsubscribe(this.handleDispatcher);
	}

	document.registerElement('page-name', {
		prototype: elementProto
	});
});