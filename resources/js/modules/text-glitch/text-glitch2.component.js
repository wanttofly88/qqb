define(['dispatcher', 'utils', 'TweenMax'], function(dispatcher, utils) {
	"use strict";

	var symbols = 'qwertyuiopasdfghjklzxcvbnm1234567890';

	var requestAnimationFrame = utils.getRequestAnimationFrame();

	if (!window.cancelAnimationFrame) {
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
	}


	var elementProto = function() {
		var animate = function(targetText) {
			var self = this;

			clearTimeout(this._to);
			this._tl = new TimelineLite()

			TweenMax.killTweensOf(this._st);
			TweenMax.killTweensOf(this._gl);
			TweenMax.killTweensOf(this._fn);

			this._to = setTimeout(function() {
				self.classList.add('hover');
			}, 300);

			this._tl.to(this._st, 0.4, {
				width: 0,
				ease:SteppedEase.config(5)
			});
			this._tl.to(this._gl, 0.4, {
				width: this.clientWidth,
				ease:SteppedEase.config(5)
			}, '-=0.4');
			this._tl.to(this._fn, 0.3, {
				width: this.clientWidth
			}, '+=0.1')
		}

		var stop = function() {
			var self = this;

			clearTimeout(this._to);
			this._tl = new TimelineLite()

			TweenMax.killTweensOf(this._st);
			TweenMax.killTweensOf(this._gl);
			TweenMax.killTweensOf(this._fn);

			this._to = setTimeout(function() {
				self.classList.remove('hover');
			}, 150);

			this._tl.to(this._gl, 0.3, {
				width: 0
			});
			this._tl.to(this._st, 0.3, {
				width: self.clientWidth
			}, '-=0.3');
			this._tl.to(this._fn, 0.3, {
				width: 0
			}, '-=0.3');

		}

		var loop = function() {
			this._loopCounter++;

			if (this._loopCounter >= 2000) this._loopCounter = 0;

			if (this._loopCounter % this._throttle === 0) {

				this._gl.innerHTML = '';
				for (var i = 0; i < this._text.length; i++) {
					this._gl.innerHTML += symbols.charAt(Math.floor(Math.random() * symbols.length));
				}

			}

			requestAnimationFrame(this._loop);
		}

		var createdCallback = function() {
			this._loopId = undefined;
			this._loopCounter = 0;

			this._loop = loop.bind(this);
			this.animate = animate.bind(this);
			this.stop = stop.bind(this);
		}

		var attachedCallback = function() {
			var stInner;

			this._throttle = 3;

			this._text = this.innerHTML;
			this._to = this.getAttribute('data-to');

			this.innerHTML = '';

			this._gl = document.createElement('span');
			this._gl.className = 'glitch-animation';
			this._gl.innerHTML = '######';
			this._st = document.createElement('span');
			this._st.className = 'glitch-start';
			this._fn = document.createElement('span');
			this._fn.className = 'glitch-final';
			this._fn.innerHTML = this._to;
			this._fake = document.createElement('span');
			this._fake.className = 'glitch-fake';
			this._fake.innerHTML = this._text;

			stInner = document.createElement('span');
			stInner.innerHTML = this._text;
			this._st.appendChild(stInner);

			this.appendChild(this._gl);
			this.appendChild(this._st);
			this.appendChild(this._fn);
			this.appendChild(this._fake);
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