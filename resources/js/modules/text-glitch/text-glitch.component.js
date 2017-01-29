define(['dispatcher', 'utils'], function(dispatcher, utils) {
	"use strict";

	var symbols = 'qwertyuiopasdfghjklzxcvbnm1234567890';
	var dict = {
		'A': ['4'],
		'B': ['8'],
		'C': ['<'],
		'D': [')'],
		'E': ['3'],
		'F': ['7'],
		'G': ['6'],
		'H': ['"'],
		'I': ['!'],
		'J': [','],
		'K': ['%'],
		'L': ['_'],
		'M': ['^'],
		'N': ['\\'],
		'O': ['0'],
		'P': ['?'],
		'Q': [';'],
		'R': ['&'],
		'S': ['$'],
		'T': ['+'],
		'U': ['_'],
		'V': ['.'],
		'W': ['"'],
		'X': ['*'],
		'Y': ['\''],
		'Z': ['5']
	}

	var requestAnimationFrame = utils.getRequestAnimationFrame();

	if (!window.cancelAnimationFrame) {
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
	}


	var elementProto = function() {
		var animate = function(targetText) {
			if (targetText) {
				this._targetText = targetText;
			} else {
				this._targetText = this._text;
			}

			this._step = -this._sim - 1;

			this.stop();
			this._loopId = requestAnimationFrame(this._loop);
		}
		var setPropertyes = function(data) {
			if (data.sim) {
				this._sim = data.sim;
				this._step = -this._sim - 1;
			}
			if (data.steps) {
				this._steps = data.steps;
			}
			if (data.throttle) {
				this._throttle = data.throttle;
			}
		}
		var stop = function() {
			this._loopCounter = 0;
			if (this._loopId) {
				this._loopId = undefined;
				cancelAnimationFrame(this._loopId);
			}
		}
		var loop = function() {
			var firstLetter;
			var text;
			var symb = '';

			this._loopCounter++;
			if (this._loopCounter >= 2000) this._loopCounter = 0;
			if (this._loopCounter % this._throttle !== 0) {
				this._loopId = requestAnimationFrame(this._loop);
				return;
			}

			if (this._step >= (this._text.length + this._sim - 1) * this._steps) return;

			firstLetter = Math.floor(this._step / this._steps) - 1;
			text = this.innerText;

			for (var i = 0; i < this._sim; i++) {
				if (i === 0 && firstLetter >= 0 && this._targetText && this._targetText[firstLetter]) {
					symb += this._targetText[firstLetter];
				} else {
					symb += symbols.charAt(Math.floor(Math.random() * symbols.length));
				}
			}
			
			if (firstLetter < 0) {
				symb = symb.substr(-firstLetter);
				firstLetter = 0;
			}

			text = text.substr(0, firstLetter) + symb + text.substr(firstLetter + symb.length);

			if (text.length > this._text.length) {
				text = text.substr(0, this._text.length);
			}

			this.innerText = text;
			this.setAttribute('data-text', text);

			this._step++;

			this._loopId = requestAnimationFrame(this._loop);
		}

		var createdCallback = function() {
			this._loopId = undefined;

			this._loop = loop.bind(this);
			this._loopCounter = 0;

			this.animate = animate.bind(this);
			this.stop = stop.bind(this);
			this.setPropertyes = setPropertyes.bind(this);
		}
		var attachedCallback = function() {
			this._bounds = this.getAttribute('data-bound') || '0,0';
			this._steps = this.getAttribute('data-steps') || 3;
			this._sim = this.getAttribute('data-sim') || 3;
			this._throttle = this.getAttribute('data-throttle') || 1;

			this._step = -this._sim - 1;
			this._sim = parseInt(this._sim);
			this._steps = parseInt(this._steps);
			this._from = parseInt(this._bounds.split(',')[0]);
			this._to = parseInt(this._bounds.split(',')[1]);
			this._text = this.innerHTML;

			this.setAttribute('data-text', this._text);
		}
		var detachedCallback = function() {
			this.stop();
		}

		return {
			createdCallback: createdCallback,
			attachedCallback: attachedCallback,
			detachedCallback: detachedCallback
		}
	}();


	Object.setPrototypeOf(elementProto, HTMLElement.prototype);
	document.registerElement('text-glitch', {
		prototype: elementProto
	});
});