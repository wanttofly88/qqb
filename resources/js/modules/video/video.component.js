define([
	'dispatcher',
	'popup/popup.store',
	'utils'
], function(
	dispatcher,
	popupStore,
	utils
) {
	"use strict";

	var elementProto = Object.create(HTMLElement.prototype);
	var requestAnimationFrame = utils.getRequestAnimationFrame();

	elementProto.handlePopup = function() {
		var active = popupStore.getData().active;
		var self = this;

		if (active === this._parentId && !this._playing) {
			this._video.currentTime = 0;
			this.play();
		}

		if (active !== this._parentId && this._playing) {
			setTimeout(function() {
				self.stop();
			}, 400);
		}
	}

	elementProto.play = function() {
		this._video.play();

		this._playing = true;
		this.loop();

		if (this._pause) {
			this._pause.innerHTML = '[pause]';
		}
	}
	elementProto.stop = function() {
		this._video.pause();

		this._playing = false;

		if (this._pause) {
			this._pause.innerHTML = '[play]';
		}
	}

	elementProto.loop = function() {
		var coef;
		var time = this._video.currentTime;
		var minutes = Math.floor(time / 60);
		var seconds = Math.floor(time % 60);
		var milliseconds = (time - Math.floor(time)).toFixed(3);

		coef = this._video.currentTime / this._video.duration;
		if (coef > 1) {
			coef = 1;
		}

		this._progressAc.style.transform = 'scaleX(' + coef + ')';



		if (seconds < 10) {
			seconds = '0' + seconds;
		}
		if (minutes < 10) {
			minutes = '0' + minutes;
		}

		seconds = seconds + '.';
		minutes = minutes + '.';
		milliseconds = milliseconds.substring(2);

		this._mnElement.innerHTML = minutes;
		this._scElement.innerHTML = seconds;
		this._msElement.innerHTML = milliseconds;

		if (!this._playing) return;

		requestAnimationFrame(this.loop);
	}

	elementProto.handleLoad = function() {
		this._duration = this._video.duration;
	}
	elementProto.handlePauseClick = function() {
		if (this._playing) {
			this.stop();
		} else {
			this.play();
		}
	}

	elementProto.handleProgressClick = function(e) {
		var x = e.clientX;
		var w = this.clientWidth;
		var coef = x/w;

		this._video.currentTime = this._video.duration*coef;

		if (!this._playing) {
			this.loop();
		}
	}

	elementProto.createdCallback = function() {
		this._playing = false;
		this.handlePopup = this.handlePopup.bind(this);
		this.handleLoad = this.handleLoad.bind(this);
		this.play = this.play.bind(this);
		this.stop = this.stop.bind(this);
		this.loop = this.loop.bind(this);
		this.handlePauseClick = this.handlePauseClick.bind(this);
		this.handleProgressClick = this.handleProgressClick.bind(this);
	}
	elementProto.attachedCallback = function() {
		this._video = this.getElementsByTagName('video')[0];
		this._pause = this.getElementsByClassName('pause')[0];
		this._parentId = this.parentNode.getAttribute('data-id');
		this._progressBar = this.getElementsByClassName('video-progressbar')[0];
		this._progressAc = this._progressBar.getElementsByClassName('ac')[0];

		this._mnElement = this.getElementsByClassName('mn')[0];
		this._scElement = this.getElementsByClassName('sc')[0];
		this._msElement = this.getElementsByClassName('ms')[0];

		this._progressBar.addEventListener('click', this.handleProgressClick);

		if (this._pause) {
			this._pause.addEventListener('click', this.handlePauseClick);
		}

		this._video.addEventListener('canplaythrough', this.handleLoad);

		popupStore.eventEmitter.subscribe(this.handlePopup);
	}
	elementProto.detachedCallback = function() {
		this.stop();
		popupStore.eventEmitter.unsubscribe(this.handlePopup);
	}

	document.registerElement('video-component', {
		prototype: elementProto
	});
});