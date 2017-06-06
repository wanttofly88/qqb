define([
	'dispatcher',
	'slider/slider.store',
	'THREE',
	'resize/resize.store',
	'utils',
	'text!glsl/simple-vertex.glsl',
	'text!glsl/slider-noise-fragment.glsl'
], function(
	dispatcher,
	sliderStore,
	THREE,
	resizeStore,
	utils,
	simpleVertexShader,
	transitionFragmentShader
) {
	"use strict";

	var elementProto = Object.create(HTMLElement.prototype);

	elementProto.handlerStore = function() {
		var sliderData = sliderStore.getData()[this._id];

		if (this._index === sliderData.index) return;

		this._index = sliderData.index;

		if (!this._maps[this._index]) return;
		this.switchMap(this._maps[this._index].src, this._speed);
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

	elementProto.build = function() {
		var camera, scene, renderer;
		var ww = this.clientWidth;
		var wh = this.clientHeight;
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
				transition: {type: 'f', value: 1},
				resolution: {type: 'v2', value: [1, 1]},
				time: {type: 'f', value: 0},
				n: {type: 'f', value: 0}
			},
			vertexShader: simpleVertexShader,
			fragmentShader: transitionFragmentShader
		});

		texture = texloader.load(this._maps[0].src, function(e) {
			self._sizes = {
				nw: texture.image.naturalWidth,
				nh: texture.image.naturalHeight
			}

			self._currentMap = self._maps[0].src;

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

			self.handleResize();

			self._active = true;
			self.loop();
		});

		this._material = material;
		this._scene = scene;
		this._camera = camera;
		this._renderer = renderer;

		renderer.render(scene, camera);
	}

	elementProto.switchMap = function(map, speed) {
		var material = this._material;
		var texloader = new THREE.TextureLoader();
		var self = this;
		var speed = this._speed;

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
		TweenMax.killChildTweensOf(material.uniforms.n);

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
			TweenMax.to(material.uniforms.n, speed/2000, {
				value: 1.5,
				ease: Power1.easeIn,
				onComplete: function() {
					TweenMax.to(material.uniforms.n, speed/100, {
						value: 0,
						ease: Power1.easeOut,
						onComplete: function() {
							material.uniforms.n.value = 0;
						}
					});
				}
			});
		});
	}

	elementProto.updateMaps = function(slides) {
		var self = this;
		this._slides = this.getElementsByClassName('slide');
		this._maps = [];

		Array.prototype.forEach.call(this._slides, function(el) {
			var style, src;
			var img;

			el.style.display = 'none';

			if (el.tagName.toLowerCase = 'img') {
				src = el.src;
				img = el;
			} else {
				style = el.currentStyle || window.getComputedStyle(el, false),
				src = style.backgroundImage.slice(4, -1).replace(/["|']/g, "");
				img = document.createElement('img');
				img.src = src;
			}

			this._maps.push({
				img: img,
				scr: scr
			});
		});

		if (this._currentMap !== this._maps[0]) {
			this.switchMap(this._maps[0], this._speed);
		}
	}

	elementProto.loop = function() {
		var material = this._material;
		var scene = this._scene;
		var camera = this._camera;
		var renderer = this._renderer;
		var mesh = this._mesh;

		if (!this._active) return;

		this._loopIndex++;

		material.uniforms.time.value = this._loopIndex;

		renderer.render(scene, camera);
		requestAnimationFrame(this.loop);
	}

	elementProto.createdCallback = function() {
		this._index = 0;
		this.handleResize = this.handleResize.bind(this);
		this.handlerStore = this.handlerStore.bind(this);
		this.loop = this.loop.bind(this);
		this.build = this.build.bind(this);
		this._loopIndex = 0;
	}
	elementProto.attachedCallback = function() {
		var self = this;
		this._continuous  = this.getAttribute('data-continuous') === 'true' ? true : false;
		this._touch  = this.getAttribute('data-touch') === 'disabled' ? false : true;
		this._speed  = this.getAttribute('data-speed');
		this._slides = this.getElementsByClassName('slide');
		this._id = this.getAttribute('data-id');
		this._total = this._slides.length;
		this._maps = [];

		if (Modernizr && !Modernizr.webgl) return;

		Array.prototype.forEach.call(this._slides, function(el) {
			var style, src;
			var img;

			if (el.tagName.toLowerCase === 'img') {
				src = el.src;
				img = el;
			} else {
				style = el.currentStyle || window.getComputedStyle(el, false),
				src = style.backgroundImage.slice(4, -1).replace(/["|']/g, "");
				img = document.createElement('img');
				img.src = src;
			}

			el.style.display = 'none';

			self._maps.push({
				img: img,
				src: src
			});
		});

		if (this._speed) {
			this._speed = parseInt(this._speed);
		} else {
			this._speed = 600;
		}

		this._slides[0].style.zIndex = 1;
		this.classList.add('slider-initialized');

		dispatcher.dispatch({
			type: 'slider:add',
			id: this._id,
			continuous: this._continuous,
			total: this._total,
			index: this._index,
			speed: this._speed
		});

		this.build();

		resizeStore.eventEmitter.subscribe(this.handleResize);
		sliderStore.subscribe(this.handlerStore);
	}
	elementProto.detachedCallback = function() {
		dispatcher.dispatch({
			type: 'slider:remove',
			id: this._id
		});
		
		this._active = false;
		resizeStore.eventEmitter.unsubscribe(this.handleResize);
		sliderStore.unsubscribe(this.handlerStore);
	}

	document.registerElement('webgl-slider', {
		prototype: elementProto
	});
});