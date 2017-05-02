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

	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	var requestAnimationFrame = utils.getRequestAnimationFrame();

	var elementProto = Object.create(HTMLElement.prototype);
	var ambientGain = 0.02;

	elementProto.playSong = function(song, position) {
		var self = this;
		var previousSong;
		var position = position || 0;

		var t = this._audio.current;

		this._audio.current = this._audio.previous;
		this._audio.previous = t;

		this._audio.current.element.src = song.src;

		this._audio.current.element.load();

		if (!this._paused) {
			this._audio.current.element.play();
			dispatcher.dispatch({
				type: 'audio-song-changed',
				song: {
					name: song.name,
					index: song.index,
					playlistId: playerStore.getData().playlistId
				},
				paused: false
			});

			if (this._mode === 'webaudio') {
				if (song === this._ambient) {
					this._audio.current.gainNode.gain.value = ambientGain;
				} else {
					this._audio.current.gainNode.gain.linearRampToValueAtTime(1, this._context.currentTime + this._crossfadeDuration);
				}
				
				this._audio.previous.gainNode.gain.linearRampToValueAtTime(0, self._context.currentTime + this._crossfadeDuration);
			} else {
				this._audio.previous.element.pause();
			}
			if (position) {
				this._audio.current.element.currentTime = position;
			}
		}

		setTimeout(function() {
			self._audio.previous.element.pause();
		}, this._crossfadeDuration * 1000);
	}

	elementProto.pauseSong = function() {
		var element = this._audio.current.element;
		var current = this._audio.current;

		this._paused = this._audio.current.element.currentTime;

		dispatcher.dispatch({
			type: 'audio-song-changed',
			song: null,
			paused: true
		});

		if (this._mode === 'webaudio') {
			current.gainNode.gain.linearRampToValueAtTime(0, this._context.currentTime + this._crossfadeDuration);
		}
		
		setTimeout(function() {
			element.pause();
		}, this._crossfadeDuration * 1000);
	}

	elementProto.unpauseSong = function() {
		var element = this._audio.current.element;
		var current = this._audio.current;
		var gn = 1;

		this._paused = 0;

		dispatcher.dispatch({
			type: 'audio-song-changed',
			song: {
				name: this._songNfo.name,
				index: this._songNfo.index,
				playlistId: playerStore.getData().playlistId,
				paused: false
			}
		});

		if (this._mode === 'webaudio') {
			if (this._songNfo === this._ambient) {
				gn = ambientGain;
			}
			current.gainNode.gain.linearRampToValueAtTime(gn, this._context.currentTime + this._crossfadeDuration);
		}

		element.play();
	}

	elementProto.loop = function() {
		var current;
		var element;
		var self = this;

		if (this._stopLoop) return;

		current = this._audio.current;
		element = this._audio.current.element;

		audioDispatcher.dispatch({
			type: 'audio-data-changed',
			duration: element.duration,
			time: element.currentTime,
			audioData: self._audioData
		});

		if (element.duration && element.currentTime >= element.duration - this._crossfadeDuration) {

			dispatcher.dispatch({
				type: 'audio-next'
			});
		}

		requestAnimationFrame(this.loop);
	}

	elementProto.handleDispatcher = function(e) {
		var playlist = playerStore.getData().playlist;
		var playlistId = playerStore.getData().playlistId;

		if (e.type === 'audio-low-freq' && this._mode === 'webaudio') {
			this._gainNode.gain.linearRampToValueAtTime(0.8, this._context.currentTime + 0.5);
			this._frequencyFilter.frequency.exponentialRampToValueAtTime(this._context.sampleRate / 150, this._context.currentTime + 0.5);
		}
		if (e.type === 'audio-high-freq' && this._mode === 'webaudio') {
			this._gainNode.gain.linearRampToValueAtTime(1, this._context.currentTime + 0.5);
			this._frequencyFilter.frequency.exponentialRampToValueAtTime(this._context.sampleRate / 2, this._context.currentTime + 0.5);
		}
		if (e.type === 'audio-play') {
			if (e.index !== undefined) {
				if (e.playlistId && e.playlistId !== playlistId) {
					console.log('audio error. wrong playlist id specified');
					return;
				}
				if (playlist && playlist[e.index]) {
					this._songNfo = playlist[e.index];
				} else {
					this._songNfo = this._ambient;
				}

				this.playSong(this._songNfo);
				if (e.unpause === true && this._paused) {
					this.unpauseSong();
				}
			} else {
				if (this._paused) {
					this.unpauseSong();
				} else {
					this.playSong(this._songNfo);
				}
			}
		}

		// for mobiles to load first song insted of autoplaying;
		if (e.type === 'audio-load') { 
			if (e.playlistId && e.playlistId !== playlistId) {
				console.log('audio error. wrong playlist id specified');
				return;
			}
			if (playlist && playlist[e.index]) {
				this._songNfo = playlist[e.index];
			} else {
				this._songNfo = this._ambient;
			}
		}

		if (e.type === 'audio-stop') {
			this.pauseSong();
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
			this.playSong(this._songNfo);
		}

		if (e.type === 'audio-goto') {
			this._audio.current.element.currentTime = e.time;
		}
	}

	elementProto.build = function() {
		var audio = this.getElementsByTagName('audio');
		var audioSource1, audioSource2;
		var context, gainNode, frequencyFilter, dummyNode;
		var audioGain1, audioGain2;
		var analyser, processor;
		var self = this;

		this._audioData = null;

		this._ambient = {
			src: this.getAttribute('data-ambient'),
			name: '__ambient__',
			index: 0
		}

		if (this._mode === 'webaudio') {
			context = new AudioContext();
			gainNode = context.createGain();
			dummyNode = context.createGain();
			frequencyFilter = context.createBiquadFilter();

			gainNode.gain.value = 1;
			dummyNode.gain.value = 1; // temp!
			frequencyFilter.type = 'lowpass';
			frequencyFilter.frequency.value = context.sampleRate / 2;
			dummyNode.connect(frequencyFilter);
			frequencyFilter.connect(gainNode);
			gainNode.connect(context.destination);

			processor  = context.createScriptProcessor(512);
			analyser = context.createAnalyser();
			analyser.smoothingTimeConstant = 0.3;
			
			dummyNode.connect(analyser);
			analyser.connect(processor);
			processor.connect(context.destination);

			this._audioData = new Uint8Array(analyser.frequencyBinCount);

			audioSource1 = context.createMediaElementSource(audio[0]);
			audioSource2 = context.createMediaElementSource(audio[1]);
			audioGain1 = context.createGain();
			audioGain2 = context.createGain();
			audioGain1.gain.value = 1;
			audioGain2.gain.value = 1;

			audioSource1.connect(audioGain1);
			audioSource2.connect(audioGain2);
			audioGain1.connect(dummyNode);
			audioGain2.connect(dummyNode);

			processor.onaudioprocess = function() {
				analyser.getByteFrequencyData(self._audioData);
			}
		}

		this._audio = {
			current: {
				element: audio[0],
				gainNode: audioGain1
			},
			previous: {
				element: audio[1],
				gainNode: audioGain2
			}
		}

		this._context = context;
		this._gainNode = gainNode;
		this._frequencyFilter = frequencyFilter;


		this._songNfo = this._ambient;
		this.loop();
	}

	elementProto.createdCallback = function() {
		this._context = null;
		this._songNfo = null;
		this._ambient = null;

		this._currentSong = null;
		this._loadingSong = false;
		this._paused = 0;

		this.playSong = this.playSong.bind(this);
		this.pauseSong = this.pauseSong.bind(this);
		this.unpauseSong = this.unpauseSong.bind(this);
		this.handleDispatcher = this.handleDispatcher.bind(this);
		this.loop = this.loop.bind(this);
		this.build = this.build.bind(this);
	}
	elementProto.attachedCallback = function() {
		if (window.AudioContext) {
			this._mode = 'webaudio';
			this._crossfadeDuration = 0.3;
		} else {
			this._mode = 'audio';
			this._crossfadeDuration = 0;
		}

		this.build();

		dispatcher.subscribe(this.handleDispatcher);
	}
	elementProto.detachedCallback = function() {
		dispatcher.unsubscribe(this.handleDispatcher);
		this._stopLoop = true;
	}

	document.registerElement('audio-player', {
		prototype: elementProto
	});
});