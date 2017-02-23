define([
	'dispatcher',
	'audio/audio-player.store'
], function(
	dispatcher,
	playerStore
) {
	"use strict";

	var elementProto = Object.create(HTMLElement.prototype);

	elementProto.handleStore = function() {
		var storeData = playerStore.getData();

		if (storeData.paused) return;
		if (storeData.playlistId !== this._id) {
			if (this._active !== null) {
				this._playlist[this._active].element.classList.remove('active');
				this._active = null;
			}
		} else {
			if (storeData.inndex !== this._active) {
				if (this._active !== null) {
					this._playlist[this._active].element.classList.remove('active');
					if (this._playlist[this._active].visualizer) {
						this._playlist[this._active].visualizer.stop();
					}
				}
				this._active = storeData.index;
				if (this._active !== null) {
					this._playlist[this._active].element.classList.add('active');
					if (this._playlist[this._active].visualizer) {
						this._playlist[this._active].visualizer.start();
					}
				}
			}
		}
	}

	elementProto.handleDispatcher = function(e) {
		if (e.type === 'load-playlist' && e.id === this._id) {
			dispatcher.dispatch({
				type: 'audio-set-playlist',
				id: this._id,
				playlist: this._playlist
			});
		}
	}

	elementProto.createdCallback = function() {
		this._playlist = [];
		this._active = null;

		this.handleDispatcher = this.handleDispatcher.bind(this);
		this.handleStore = this.handleStore.bind(this);
	}

	elementProto.attachedCallback = function() {
		var tracks = this.getElementsByClassName('track');
		var self = this;

		this._id = this.getAttribute('data-id');
		if (!this._id) {
			console.warn('data-id attribute is missing on track-list');
		}

		Array.prototype.forEach.call(tracks, function(track, index) {
			var name = track.innerHTML;
			var src = track.getAttribute('data-src');
			var visualizer = track.getElementsByTagName('audio-visual')[0];

			track.addEventListener('click', function() {
				dispatcher.dispatch({
					type: 'audio-play',
					index: index,
					playlistId: self._id,
					upause: true
				});
				dispatcher.dispatch({
					type: 'audio-low-freq'
				});
				setTimeout(function() {
					dispatcher.dispatch({
						type: 'popup-close'
					});
				}, 300);

			});

			self._playlist.push({
				element: track,
				index: index,
				name: name,
				src: src,
				visualizer: visualizer
			});
		});

		dispatcher.subscribe(this.handleDispatcher);
		playerStore.eventEmitter.subscribe(this.handleStore);
	}
	elementProto.detachedCallback = function() {
		dispatcher.unsubscribe(this.handleDispatcher);
		playerStore.eventEmitter.unsubscribe(this.handleStore);
	}

	document.registerElement('track-list', {
		prototype: elementProto
	});
});