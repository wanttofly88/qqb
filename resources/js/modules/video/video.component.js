define(['dispatcher'], function(dispatcher) {
	"use strict";

	var elementProto = Object.create(HTMLElement.prototype);
	var isTouchDevice = (Modernizr && Modernizr.touchevents);

	elementProto.onPlayerReady = function() {
	}

	elementProto.onPlayerStateChange = function(event) {
		if (event.data === 2 && Modernizr && Modernizr.touchevents) {
			this.stopVideo();
		}
		// if (event.data === 3 && isTouchDevice) {
		// 	close.style.display = 'none';
		// }
	}

	elementProto.onYouTubePlayerAPIReady = function() {
		var self = this;
		this.player = new YT.Player('videoPlayer', {
			events: {
				'onReady': self.onPlayerReady,
				'onStateChange': self.onPlayerStateChange
			}
		});
	}

	elementProto.playVideo = function(src) {
		dispatcher.dispatch({
			type: 'popup-open',
			id: 'video-popup'
		});

		this.player.loadVideoById({
			videoId: src,
			suggestedQuality: 'large'
		});

		dispatcher.dispatch({
			type: 'audio-stop'
		});

		if (!this.player) return;

		if (Modernizr && !Modernizr.touchevents) {
			this.player.playVideo();
		}
	}

	elementProto.stopVideo = function() {
		dispatcher.dispatch({
			type: 'audio-play'
		});

		if (!this.player) return;

		this.player.pauseVideo();
	}

	elementProto.handleDispatcher = function(e) {
		if (e.type === 'video-play') {
			this.playVideo(e.src);
		}
		if (e.type === 'video-stop' || e.type === 'popup-close') {
			this.stopVideo();
		}
	}

	elementProto.createdCallback = function() {
		this._playing = false;
		this.onYouTubePlayerAPIReady = this.onYouTubePlayerAPIReady.bind(this);
		this.onPlayerStateChange = this.onPlayerStateChange.bind(this);
		this.handleDispatcher = this.handleDispatcher.bind(this);
		this.playVideo = this.playVideo.bind(this);
		this.stopVideo = this.stopVideo.bind(this);
	}
	elementProto.attachedCallback = function() {
		var iframe = this.getElementsByTagName('iframe')[0];
		var tag = document.createElement('script');
		var firstScriptTag;

		if (typeof YT === 'undefined') {
			tag.src = 'http://www.youtube.com/player_api';
			firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
		} else {
			this.onYouTubePlayerAPIReady();
		}

		window.onYouTubePlayerAPIReady = this.onYouTubePlayerAPIReady;

		// play.onclick = enable;
		// close.onclick = disable;
		dispatcher.subscribe(this.handleDispatcher);
	}
	elementProto.detachedCallback = function() {
		dispatcher.unsubscribe(this.handleDispatcher);
	}

	Object.setPrototypeOf(elementProto, HTMLElement.prototype);
	document.registerElement('video-component', {
		prototype: elementProto
	});
});