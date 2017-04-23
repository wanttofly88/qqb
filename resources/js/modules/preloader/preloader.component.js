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
	var elementProto = Object.create(HTMLElement.prototype);

	elementProto.start = function() {
		var self = this;

		setTimeout(function() {
			dispatcher.dispatch({
				type: 'preload-starting'
			});
		}, 40);

		this.classList.add('loading');
		TweenMax.to(this._obj, 2, {
			p: 75,
			ease: Quad.easeOut,
			onUpdate: function() {
				self._perc.innerHTML = Math.floor(self._obj.p) + '%';
			}
		});
	}
	elementProto.finish = function() {
		var self = this;
		setTimeout(function() {
			dispatcher.dispatch({
				type: 'preload-finishing'
			});
		}, 1400);

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
				self.loop();
			}, 100);
		}, 250);
	}

	elementProto.hide = function() {
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
				self._active = false;

				// self-destructing in 900 milliseconds =)
				self.parentNode.removeChild(self);
			}, 900);
		}, 1400);
	}

	elementProto.loop = function() {
		this._step++;
		if (!this._active) return;

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
				this.hide();
				return;
			};
		}

		requestAnimationFrame(this.loop);
	}

	elementProto.createdCallback = function() {
		this._obj = {
			p: 0
		}
		this._letter = 0;
		this._step = 0;

		this.start = this.start.bind(this);
		this.finish = this.finish.bind(this);
		this.hide = this.hide.bind(this);
		this.loop = this.loop.bind(this);
		this._active = true;
	}
	elementProto.attachedCallback = function() {
		var pw = document.getElementsByClassName('page-wrapper')[0];

		this._perc = this.getElementsByClassName('perc')[0];
		this._perc.innerHTML = '0%';
		this._text = this.getElementsByClassName('loaded-text')[0];
		this._text.innerHTML = '';
		this._textData = this._text.getAttribute('data-text');

		console.log(9999);
		console.log(Modernizr);
		console.log(Modernizr.csstransitions);

		if (Modernizr && Modernizr.csstransitions) {
			this.start();
			setTimeout(this.finish, 1000);
		} else {
			pw.classList.add('preload-complete');
			dispatcher.dispatch({
				type: 'preload-complete'
			});
		}
	}
	elementProto.detachedCallback = function() {
	}

	document.registerElement('preloader-component', {
		prototype: elementProto
	});
});