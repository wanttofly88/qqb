define([
	'dispatcher',
	'THREE',
	'resize/resize.store',
	'utils',
	'text!glsl/simple-vertex.glsl',
	'text!glsl/dot-fragment.glsl',
	'scheme/scheme.store',
	'TweenMax',
	'slide-scroll/slide-scroll.store',
	'popup/popup.store',
	'router/router.store',
	'bezier'
], function(
	dispatcher,
	THREE,
	resizeStore,
	utils,
	simpleVertexShader,
	dotFragmentShader,
	schemeStore,
	TweenMax,
	sSStore,
	popupStore,
	routerStore,
	bezier
) {
	"use strict";

	var requestAnimationFrame = utils.getRequestAnimationFrame();

	var elementProto = Object.create(HTMLElement.prototype);

	elementProto.buld = function() {
		var camera, scene, renderer;
		var ww = resizeStore.getData().width;
		var wh = resizeStore.getData().height;
		var plane, mesh, material;
		var dpr = 1;
		var maxW = Math.max(ww, wh);
		var texloader = new THREE.TextureLoader();
		var texture;
		var self = this;

		camera = new THREE.OrthographicCamera(
			ww*dpr / -2, 
			ww*dpr / 2,  
			wh*dpr / 2, 
			wh*dpr / -2, 
			-100, 
			100
		);

		scene = new THREE.Scene();
		renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true
		});

		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(ww, wh);

		renderer.domElement.style.width  = '100%';
		renderer.domElement.style.height = '100%';
		renderer.setClearColor(0x40dbe1);

		this.appendChild(renderer.domElement);

		material = new THREE.ShaderMaterial({
			uniforms: {
				prevMap: {type: 't', value: texture},
				nextMap: {type: 't', value: null},
				r: {type: 'f', value: 0},
				transition: {type: 'f', value: 1},
				statics: {type: 'f', value: 0},
				time: {type: 'f', value: 0},
				resolution: {type: 'v2', value: [1, 1]},
				bright: {type: 'f', value: 0}
			},
			vertexShader: simpleVertexShader,
			fragmentShader: dotFragmentShader
		});

		texture = texloader.load(this._maskSrc, function(e) {
			self._sizes = {
				nw: texture.image.naturalWidth,
				nh: texture.image.naturalHeight
			}

			self._currentMap = self._maskSrc;

			texture.premultiplyAlpha = true;
			texture.needsUpdate = true;

			texture.magFilter = THREE.NearestFilter;
			texture.minFilter = THREE.NearestFilter;

			material.uniforms.prevMap.value = texture;

			plane = new THREE.PlaneBufferGeometry(self._sizes.nw, self._sizes.nh);
			mesh = new THREE.Mesh(plane, material);
			scene.add(mesh);

			renderer.render(scene, camera);

			self._texture = texture;
			self._mesh = mesh;

			self.loop();

			self.handleResize();
		});

		this._material = material;
		this._scene = scene;
		this._camera = camera;
		this._renderer = renderer;
	}

	elementProto.switchMap = function(map, speed) {
		var material = this._material;
		var texloader = new THREE.TextureLoader();
		var self = this;

		var loadMap = function(map) {
			var promise = new Promise(function(resolve, reject) {
				var texture = texloader.load(map, function(e) {
					texture.premultiplyAlpha = true;
					texture.needsUpdate = true;
					texture.magFilter = THREE.NearestFilter;
					texture.minFilter = THREE.NearestFilter;
					material.uniforms['nextMap'].value = texture;

					resolve();
				});
			});
			return promise;
		}

		if (this._currentMap === map) return;

		TweenMax.killChildTweensOf(material.uniforms.transition);

		loadMap(map).then(function() {
			TweenMax.to(material.uniforms.transition, speed/1000, {
				value: 0,
				ease: Power1.easeInOut,
				onComplete: function() {
					material.uniforms.transition.value = 1;
					material.uniforms.prevMap.value = material.uniforms.nextMap.value;
					self._currentMap = map;
				}
			});
		});
	}

	elementProto.updateMaps = function(maps) {
		var self = this;
		this._maskElements = maps;
		this._maps = [];

		Array.prototype.forEach.call(this._maskElements, function(element) {
			var img = document.createElement('img');
			img.src = element.getAttribute('data-texture');
			self._maps.push(img.src);
		});

		if (this._currentMap !== this._maps[0]) {
			this.switchMap(this._maps[0], 700);
		}
	}

	elementProto.handleSlide = function() {
		var index = sSStore.getData().items[sSStore.getData().lastAdded].index;
		var i2;
		if (index === this._slide) return;
		i2 = index % this._maps.length;

		this.switchMap(this._maps[i2], 700);
		this._slide = index;
	}

	elementProto.loop = function() {
		var material = this._material;
		var scene = this._scene;
		var camera = this._camera;
		var renderer = this._renderer;
		var mesh = this._mesh;
		var r = Math.random()/90;

		if (!this._active) return;
		if (this._loopIndex > 10000) this._loopIndex = 0;
		this._loopIndex++;

		material.uniforms.r.value = r;
		material.uniforms.time.value = this._loopIndex;

		renderer.render(scene, camera);
		requestAnimationFrame(this.loop);
	}

	elementProto.handleScheme = function() {
		var material = this._material;
		var scheme = schemeStore.getData().scheme;
		var value;
		var speed = 0.5;

		if (routerStore.getData().routing) {
			speed = 0.9;
		}
		if (!material) return;
		if (scheme === this._currentScheme) return;

		if (scheme === 'bright') {
			value = 1;
		}
		if (scheme === 'dark') {
			value = 0;
		}

		if (this._currentScheme === undefined) {
			material.uniforms.bright.value = value;
		} else {
			TweenMax.killTweensOf(material.uniforms.bright);
			TweenMax.to(material.uniforms.bright, speed, {
				value: value,
				ease: Power1.easeInOut
			});
		}

		this._currentScheme = scheme;
	}

	elementProto.handlePopup = function() {
		var material = this._material;
		var active = popupStore.getData().active;

		if (!material) return;
		if (routerStore.getData().routing) return;

		if (active) {
			TweenMax.killTweensOf(material.uniforms.statics);
			TweenMax.to(material.uniforms.statics, 0.4, {
				value: 0.6,
				ease: Power0.linear
			});
		} else {
			TweenMax.killTweensOf(material.uniforms.statics);
			TweenMax.to(material.uniforms.statics, 0.4, {
				value: 0,
				ease: Power0.linear
			});
		}
	}

	elementProto.handleDispatcher = function(e) {
		var material = this._material;

		if (e.type === 'transition-start') {
			if (!material) return;
			TweenMax.killTweensOf(material.uniforms.statics);
			TweenMax.to(material.uniforms.statics, 0.9, {
				value: 1,
				ease: Power1.easeOut
			});
		}
		if (e.type === 'transition-end') {
			if (!material) return;
			TweenMax.killTweensOf(material.uniforms.statics);
			TweenMax.to(material.uniforms.statics, 2, {
				value: 0,
				ease: Power1.easeIn,
				delay: 0.4
			});
		}
		if (e.type === 'update-maps') {
			this.updateMaps(e.maps);
		}
	}

	elementProto.handleResize = function() {
		var ww = resizeStore.getData().width;
		var wh = resizeStore.getData().height;
		var camera = this._camera;
		var renderer = this._renderer;
		var mesh = this._mesh;
		var material;
		var scaleX, scaleY, scale;
		var mw, mh;

		camera.left =   ww / -2;
		camera.right =  ww / 2;
		camera.top =    wh / 2;
		camera.bottom = wh / -2;

		camera.updateProjectionMatrix();
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(ww, wh);

		if (this._sizes && mesh) {
			mw = mesh.geometry.parameters.width;
			mh = mesh.geometry.parameters.height;
			scaleX = ww / mw;
			scaleY = wh / mh;

			scale = Math.max(scaleX, scaleY);
			mesh.scale.set(scale, scale, 1);
			this._sizes.mw = mw*scale;
			this._sizes.mh = mh*scale;

			material = mesh.material;
			material.uniforms.resolution.value = [
				this._sizes.mw,
				this._sizes.mh
			]
		}
	}

	elementProto.createdCallback = function() {
		this._loopIndex = 0;
		this.build = this.buld.bind(this);
		this.handleDispatcher = this.handleDispatcher.bind(this);
		this.handleResize = this.handleResize.bind(this);
		this.handleScheme = this.handleScheme.bind(this);
		this.handleSlide = this.handleSlide.bind(this);
		this.handlePopup = this.handlePopup.bind(this);
		this.switchMap = this.switchMap.bind(this);
		this.updateMaps = this.updateMaps.bind(this);
		this.loop = this.loop.bind(this);
		this._active = true;
		this._currentScheme = undefined;
		this._slide = 0;
	}
	elementProto.attachedCallback = function() {
		var self = this;
		this._maskElements = this.getElementsByClassName('mask');
		this._maskSrc = this._maskElements[0].getAttribute('data-texture');
		this._maps = [];
		//if (Modernizr && (!Modernizr.webgl || Modernizr.touchevents)) return;

		if (!Modernizr || !Modernizr.webgl) return;

		Array.prototype.forEach.call(this._maskElements, function(element) {
			var img = document.createElement('img');
			img.src = element.getAttribute('data-texture');
			self._maps.push(img.src);
		});

		this.build();
		this.handleScheme();
		// this.setMaps(self._maps[0], self._maps[1]);

		resizeStore.eventEmitter.subscribe(this.handleResize);
		dispatcher.subscribe(this.handleDispatcher);
		schemeStore.eventEmitter.subscribe(this.handleScheme);
		sSStore.eventEmitter.subscribe(this.handleSlide);
		popupStore.eventEmitter.subscribe(this.handlePopup);
		dispatcher.subscribe(this.handleDispatcher);
	}
	elementProto.detachedCallback = function() {
		resizeStore.eventEmitter.unsubscribe(this.handleResize);
		dispatcher.unsubscribe(this.handleDispatcher);
		schemeStore.eventEmitter.unsubscribe(this.handleScheme);
		sSStore.eventEmitter.unsubscribe(this.handleSlide);
		popupStore.eventEmitter.unsubscribe(this.handlePopup);
		dispatcher.unsubscribe(this.handleDispatcher);
	}

	document.registerElement('stage-component', {
		prototype: elementProto
	});
});