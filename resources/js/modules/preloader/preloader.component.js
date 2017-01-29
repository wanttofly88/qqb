define([
	'dispatcher',
	'preloader/preloader.store',
	'TweenMax',
	'utils'
], function(
	dispatcher,
	preloaderStore,
	TweenMax,
	utils
) {
	"use strict";

	var requestAnimationFrame = utils.getRequestAnimationFrame();

	var elementProto = function() {
		var start = function() {
			var self = this;
			this.classList.add('loading');
			TweenMax.to(this._obj, 2, {
				p: 75,
				ease: Quad.easeOut,
				onUpdate: function() {
					self._perc.innerHTML = Math.floor(self._obj.p) + '%';
				}
			});
		}
		var finish = function() {
			var self = this;
			TweenMax.killTweensOf(this._obj);
			TweenMax.to(this._obj, 0.5, {
				p: 100,
				ease: Quad.easeOut,
				onUpdate: function() {
					self._perc.innerHTML = Math.floor(self._obj.p) + '%';
				}
			});
			setTimeout(function() {
				self.classList.add('loaded');
				setTimeout(function() {
					self._loop();
				}, 100);
			}, 250);
		}

		var hide = function() {
			var self = this;
			setTimeout(function() {
				self._text.classList.add('no-animation');
			}, 400);
			
			setTimeout(function() {
				var pw = document.getElementsByClassName('page-wrapper')[0];

				self.classList.add('hidden');

				pw.classList.add('preload-complete');
				dispatcher.dispatch({
					type: 'preload-complete'
				});

				setTimeout(function() {
					self.style.display = 'none';
				}, 500);
			}, 1400);
		}

		var loop = function() {
			this._step++;

			if (this._step % 3 === 0 
				&& !(this._step > 4 && this._step < 9) 
				&& !(this._step > 17 && this._step < 20) 
				&& !(this._step > 24 && this._step < 27)
				&& !(this._step > 33 && this._step < 42) 
				&& !(this._step > 54 && this._step < 57) 
				&& !(this._step > 68 && this._step < 70) 
				&& !(this._step > 75 && this._step < 78)
			) {
				this._text.innerHTML += this._textData[this._letter];
				this._letter++;
				if (this._letter >= this._textData.length) {
					this._hide();
					return;
				};
			}

			requestAnimationFrame(this._loop);
		}

		var createdCallback = function() {
			this._obj = {
				p: 0
			}
			this._letter = 0;
			this._step = 0;
			this._delays = [20];

			this._start = start.bind(this);
			this._finish = finish.bind(this);
			this._hide = hide.bind(this);
			this._loop = loop.bind(this);
		}
		var attachedCallback = function() {
			this._perc = this.getElementsByClassName('perc')[0];
			this._perc.innerHTML = '0%';
			this._text = this.getElementsByClassName('loaded-text')[0];
			this._text.innerHTML = '';
			this._textData = this._text.getAttribute('data-text');

			if (Modernizr.csstransitions) {
				this._start();
				setTimeout(this._finish, 1000);
			} else {
				dispatcher.dispatch({
					type: 'preload-complete'
				});
			}
		}
		var detachedCallback = function() {
		}


		return {
			createdCallback: createdCallback,
			attachedCallback: attachedCallback,
			detachedCallback: detachedCallback
		}
	}();

	Object.setPrototypeOf(elementProto, HTMLElement.prototype);
	document.registerElement('preloader-component', {
		prototype: elementProto
	});
});