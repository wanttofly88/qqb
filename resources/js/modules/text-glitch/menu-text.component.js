define(['dispatcher', 'utils', 'TweenMax'], function(dispatcher, utils) {
	"use strict";

	var requestAnimationFrame = utils.getRequestAnimationFrame();

	if (!window.cancelAnimationFrame) {
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
	}


	var elementProto = function() {
		var animate = function() {
			if (this.parentNode.classList.contains('active')) {
				return;
			}
			this._loopCounter = 0;
			this._to = setTimeout(this._loop, 800);
		}

		var stop = function() {
			clearTimeout(this._to);
		}

		var loop = function() {
			var canvasInver = this._textures.invert.canvas;
			var ctx = this._ctx;
			var num = Math.floor(Math.random()*4 + 1);
			var w = this._w;
			var h = this._h;
			var clipX, clipY, clipW, clipH;
			var op = Math.random()/4 + 0.8;

			this._loopCounter++;
			if (this._loopCounter >= 1000) this._loopCounter = 0;

			if (this._loopCounter % 6 === 0 && this._loopCounter <= 20) {
				this._textures.invert.data.clips = [];
				for (var i = 0; i < num; i++) {
					clipW = Math.floor(Math.random()*(w - 100) + 30);
					clipH = Math.floor(Math.random()*h + 30);
					clipX = Math.random()*(w - clipW);
					clipY = Math.random()*h;
					this._textures.invert.data.clips.push({
						x: clipX,
						y: clipY,
						w: clipW,
						h: clipH
					})
				}
			} else if (this._loopCounter > 20) {
				this._textures.invert.data.clips = [];
			}
			if (this._loopCounter % 3 === 0 && this._loopCounter <= 25) {
				this._textures.invert.data.smallClips = [];
				for (var i = 0; i < num*2; i++) {
					clipH = Math.floor(Math.random()*15 + 2);
					clipW = clipH*10;
					clipX = Math.random()*w - clipW;
					clipY = Math.random()*h;
					this._textures.invert.data.smallClips.push({
						x: clipX,
						y: clipY,
						w: clipW,
						h: clipH
					})
				}
			} else if (this._loopCounter > 25) {
				this._textures.invert.data.smallClips = [];
			}

			ctx.clearRect(0, 0, w, h);

			if (this._textures.invert.data.smallClips.length) {
				ctx.save();
				ctx.globalAlpha = 0.7;
				ctx.beginPath();
				this._textures.invert.data.smallClips.forEach(function(clip) {
					ctx.rect(clip.x + 15, clip.y - clip.h, clip.w, clip.h);
				});
				ctx.clip();
				ctx.drawImage(canvasInver, -20, 0);
				ctx.restore();
			}

			if (this._textures.invert.data.clips.length) {
				ctx.save();
				ctx.beginPath();
				this._textures.invert.data.clips.forEach(function(clip) {
					ctx.rect(clip.x, clip.y - clip.h, clip.w, clip.h);
				});
				ctx.clip();
				ctx.drawImage(canvasInver, 0, 0);
				ctx.restore();
			}

			if (this._loopCounter > 30) {
				ctx.clearRect(0, 0, w, h);
				return;
			}

			requestAnimationFrame(this._loop);
		}

		var buildImgs = function() {
			var ctx = this._ctx;
			var canvas = this._canvas;
			var canvasInver, ctxInvert;
			var letters = this._to.split('');

			this._textures = {
				invert: {},
				blured: {}
			}

			canvasInver = document.createElement('canvas');
			canvasInver.width = canvas.width;
			canvasInver.height = canvas.height;
			ctxInvert = canvasInver.getContext('2d');

			ctxInvert.fillStyle = '#101010';
			ctxInvert.fillRect(0, 0, canvas.width, canvas.height)
			ctxInvert.fillStyle = '#ffffff';
			ctxInvert.font = '60px CPMono';
			ctxInvert.textBaseline = 'middle';

			letters.forEach(function(letter, index) {
				ctxInvert.fillText(letter, 25 + index*36, 55);
			});

			this._textures.invert = {
				canvas: canvasInver,
				ctx: ctxInvert,
				data: {
					clips: [],
					smallClips: []
				}
			}
		}

		var createdCallback = function() {
			this._loopId = undefined;
			this._loopCounter = 0;
			this._to = undefined;

			this._loop = loop.bind(this);
			this.animate = animate.bind(this);
			this.stop = stop.bind(this);
			this._buildImgs = buildImgs.bind(this);
		}

		var attachedCallback = function() {
			var stInner;

			this._throttle = 3;

			this._text = this.innerHTML;
			this._to = this.getAttribute('data-to');

			this._canvas = document.createElement('canvas');

			this._sh = 0;
			this._sw = 25;
			this._h = this.clientHeight + this._sh * 2;
			this._w = this.clientWidth + this._sw * 2;
			this._canvas.width = this._w;
			this._canvas.height = this._h;
			this._canvas.style.top = -this._sh + 'px';
			this._canvas.style.left = -this._sw + 'px';
			this._ctx = this._canvas.getContext('2d');

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

			this.innerHTML = '';

			this.appendChild(this._gl);
			this.appendChild(this._st);
			this.appendChild(this._fn);
			this.appendChild(this._fake);
			this.appendChild(this._canvas);

			this._buildImgs();

			this.parentNode.addEventListener('mouseenter', this.animate);
			this.parentNode.addEventListener('mouseleave', this.stop);
		}

		var detachedCallback = function() {
			this.stop();
			this.parentNode.removeEventListener('mouseenter', this.animate);
			this.parentNode.removeEventListener('mouseleave', this.stop);
		}

		return {
			createdCallback: createdCallback,
			attachedCallback: attachedCallback,
			detachedCallback: detachedCallback
		}
	}();


	Object.setPrototypeOf(elementProto, HTMLElement.prototype);
	document.registerElement('menu-text', {
		prototype: elementProto
	});
});