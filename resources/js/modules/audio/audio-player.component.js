define([
	'dispatcher',
	'audio/audio.dispatcher',
	'audio/audio-player.store',
	'utils'
], function(
	dispatcher,
	audioDispatcher,
	playerStore,
	utils
) {
	"use strict";

	// TODO: use page visibility api
	// TODO: add pause

	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	var requestAnimationFrame = utils.getRequestAnimationFrame();

	var crossFadeDuration = 0.3;

	var elementProto = function() {
		var SongsCashe = function(limit) {
			this._cache = [];
			this.get = function(url) {
				var result = null;
				this._cache.forEach(function(item) {
					if (item.url === url) {
						result = item;
					}
				});

				return result;
			}
			this.put = function(data) {
				var self = this;

				if (this._cache.length > limit) {
					this._cache.shift();
				}

				this._cache.push({
					url: data.url,
					buffer: data.buffer
				});
			}
		} 

		var loadSound = function(url) {
			var request = new XMLHttpRequest();
			var self = this;

			var promise = new Promise(function(resolve, reject) {
				var cashed;

				if (!self._context) {
					reject('webaudio error');
				}

				cashed = self._songsCashe.get(url);

				if (cashed) {
					resolve(cashed.buffer);
				} else {
					request.open('GET', url, true);
					request.responseType = 'arraybuffer';

					request.onload = function() {
						self._context.decodeAudioData(request.response, function(buffer) {
							self._songsCashe.put({
								url: url,
								buffer: buffer
							});

							resolve(buffer);
						}, function() {
							reject('webaudio error');
						});
					}
					request.send();
				}
			});

			return promise;
		}

		var playSound = function(buffer) {
			var source = this._context.createBufferSource();

			source.buffer = buffer;
			source.connect(this._context.destination);
			source.start(0);
		}

		var playSong = function(song, position) {
			var self = this;
			var previousSong;
			var position = position || this._paused;

			var go = function(buffer) {
				var source = self._context.createBufferSource();
				var gainNode = self._context.createGain();
				var playlist = playerStore.getData().playlist;
				var nextIndex;

				// cache next song;
				if (playlist) {
					if (playlist[song.index + 1]) {
						nextIndex = song.index + 1;
					} else {
						nextIndex = 0;
					}
					self._loadSound(playlist[nextIndex].src);
				}

				gainNode.gain.value = 0;
				source.buffer = buffer;
				source.connect(gainNode);
				gainNode.connect(self._frequencyFilter);
				source.start(self._context.currentTime, self._paused);

				gainNode.gain.linearRampToValueAtTime(1, self._context.currentTime + crossFadeDuration);

				self._currentSong = {
					startTime: self._context.currentTime - self._paused,
					source: source,
					gainNode: gainNode
				};
				self._loadingSong = false;

				dispatcher.dispatch({
					type: 'audio-song-changed',
					song: {
						name: song.name,
						index: song.index,
						playlistId: playerStore.getData().playlistId
					}
				});
			}

			if (this._loadingSong) return;
			this._loadingSong = true;

			previousSong = this._currentSong;

			if (previousSong) {
				previousSong.gainNode.gain.linearRampToValueAtTime(0, self._context.currentTime + crossFadeDuration);
				setTimeout(function() {
					previousSong.source.stop(0);
				}, crossFadeDuration * 1000);
			}

			this._loadSound(song.src).then(go, function(err) {
				console.log(err);
			});
		}

		var stopSong = function() {
			var previousSong = this._currentSong;

			if (!previousSong) return;

			this._currentSong = null;
			this._paused = this._context.currentTime - previousSong.startTime;

			dispatcher.dispatch({
				type: 'audio-song-changed',
				song: null
			});

			if (previousSong) {
				previousSong.gainNode.gain.linearRampToValueAtTime(0, this._context.currentTime + crossFadeDuration);
				setTimeout(function() {
					previousSong.source.stop(0);
				}, crossFadeDuration * 1000);
			}
		}

		var setFilters = function() {
			this._gainNode = this._context.createGain();
			this._gainNode.gain.value = 1;

			this._frequencyFilter = this._context.createBiquadFilter();
			this._frequencyFilter.type = 'lowpass';
			this._frequencyFilter.frequency.value = this._context.sampleRate / 2;
			this._frequencyFilter.connect(this._gainNode);
			this._gainNode.connect(this._context.destination);
		}

		var loop = function() {
			if (this._stopLoop) return;

			if (this._currentSong) {
				audioDispatcher.dispatch({
					type: 'audio-data-changed',
					duration: this._currentSong.source.buffer.duration,
					time: this._context.currentTime - this._currentSong.startTime
				});

				if (this._context.currentTime >= this._currentSong.startTime 
						+ this._currentSong.source.buffer.duration - crossFadeDuration
						&& !this._loadingSong) {
				// if (this._context.currentTime >= this._currentSong.startTime + 70
				// 		&& !this._loadingSong) {
					dispatcher.dispatch({
						type: 'audio-next'
					});
				}
			}

			requestAnimationFrame(this._loop);
		}

		var handleDispatcher = function(e) {
			var playlist = playerStore.getData().playlist;
			var playlistId = playerStore.getData().playlistId;

			if (e.type === 'audio-low-freq') {
				this._gainNode.gain.linearRampToValueAtTime(0.5, this._context.currentTime + 0.5);
				this._frequencyFilter.frequency.exponentialRampToValueAtTime(this._context.sampleRate / 300, this._context.currentTime + 0.5);
			}
			if (e.type === 'audio-high-freq') {
				this._gainNode.gain.linearRampToValueAtTime(1, this._context.currentTime + 0.5);
				this._frequencyFilter.frequency.exponentialRampToValueAtTime(this._context.sampleRate / 2, this._context.currentTime + 0.5);

			}
			if (e.type === 'audio-play') {
				if (e.index !== undefined) {
					this._paused = 0;

					if (e.playlistId && e.playlistId !== playlistId) {
						console.log('audio error. wrong playlist id specified');
						return;
					}
					if (playlist && playlist[e.index]) {
						this._songNfo = playlist[e.index];
					}
					this._playSong(this._songNfo);
				} else {
					this._playSong(this._songNfo);
				}
			}

			if (e.type === 'audio-stop') {
				this._stopSong();
			}

			if (e.type === 'audio-next') {
				if (playlist) {
					if (playlist[this._songNfo.index + 1]) {
						this._songNfo = playlist[this._songNfo.index + 1];
					} else {
						this._songNfo = playlist[0];
					}
				} else {
					this._songNfo = this._ambient;
				}
				this._playSong(this._songNfo);
			}
		}

		var createdCallback = function() {
			this._context = null;
			this._songNfo = null;
			this._ambient = null;

			this._currentSong = null;
			this._loadingSong = false;
			this._paused = 0;

			this._loadSound = loadSound.bind(this);
			this._playSound = playSound.bind(this);
			this._playSong = playSong.bind(this);
			this._stopSong = stopSong.bind(this);
			this._handleDispatcher = handleDispatcher.bind(this);
			this._setFilters = setFilters.bind(this);
			this._loop = loop.bind(this);
			this._songsCashe = new SongsCashe(2);
		}
		var attachedCallback = function() {
			this._ambient = {
				src: this.getAttribute('data-ambient'),
				name: 'ambient',
				index: 0
			}

			this._context = new AudioContext();

			this._setFilters();
			this._songNfo = this._ambient;

			this._loop();

			dispatcher.subscribe(this._handleDispatcher);
		}
		var detachedCallback = function() {
			dispatcher.unsubscribe(this._handleDispatcher);
			this._stopLoop = true;
		}


		return {
			createdCallback: createdCallback,
			attachedCallback: attachedCallback,
			detachedCallback: detachedCallback
		}
	}();

	Object.setPrototypeOf(elementProto, HTMLElement.prototype);
	document.registerElement('audio-player', {
		prototype: elementProto
	});
});