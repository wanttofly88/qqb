define([
	'dispatcher',
	'audio/audio-player.store'
], function(
	dispatcher,
	playerStore
) {
	"use strict";

	var elementProto = function() {
		var handleStore = function() {
			var storeData = playerStore.getData();

			if (storeData.playlistId !== this._id) {
				if (this._active !== null) {
					this._playlist[this._active].element.classList.remove('active');
					this._active = null;
				}
			} else {
				if (storeData.inndex !== this._active) {
					if (this._active !== null) {
						this._playlist[this._active].element.classList.remove('active');
					}
					this._active = storeData.index;
					if (this._active !== null) {
						this._playlist[this._active].element.classList.add('active');
					}
				}
			}
		}

		var handleDispatcher = function(e) {
			if (e.type === 'load-playlist' && e.id === this._id) {
				dispatcher.dispatch({
					type: 'audio-set-playlist',
					id: this._id,
					playlist: this._playlist
				});
			}
		}

		var createdCallback = function() {
			this._playlist = [];
			this._active = null;

			this._handleDispatcher = handleDispatcher.bind(this);
			this._handleStore = handleStore.bind(this);
		}

		var attachedCallback = function() {
			var tracks = this.getElementsByClassName('track');
			var self = this;

			this._id = this.getAttribute('data-id');
			if (!this._id) {
				console.warn('data-id attribute is missing on track-list');
			}

			Array.prototype.forEach.call(tracks, function(track, index) {
				var name = track.innerHTML;
				var src = track.getAttribute('data-src');

				track.addEventListener('click', function() {
					dispatcher.dispatch({
						type: 'audio-play',
						index: index,
						playlistId: self._id
					});
					dispatcher.dispatch({
						type: 'popup-close'
					});
				});

				self._playlist.push({
					element: track,
					index: index,
					name: name,
					src: src
				});
			});

			dispatcher.subscribe(this._handleDispatcher);
			playerStore.eventEmitter.subscribe(this._handleStore);
		}
		var detachedCallback = function() {
			dispatcher.unsubscribe(this._handleDispatcher);
			playerStore.eventEmitter.unsubscribe(this._handleStore);
		}


		return {
			createdCallback: createdCallback,
			attachedCallback: attachedCallback,
			detachedCallback: detachedCallback
		}
	}();

	Object.setPrototypeOf(elementProto, HTMLElement.prototype);
	document.registerElement('track-list', {
		prototype: elementProto
	});
});