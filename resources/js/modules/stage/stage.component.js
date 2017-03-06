define([
	'dispatcher',
	'THREE',
	'resize/resize.store',
	'utils',
	'text!glsl/simple-vertex.glsl',
	'text!glsl/dot-fragment.glsl',
	'scheme/scheme.store',
	'TweenMax'
], function(
	dispatcher,
	THREE,
	resizeStore,
	utils,
	simpleVertexShader,
	dotFragmentShader,
	schemeStore,
	TweenMax
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
				shiftY: {type: 'f', value: 0},
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

	elementProto.setMaps = function(prevMapSrc, nextMapSrc) {
		var material = this._material;

		var loadMap = function(map, type) {
			var texture = texloader.load(map, function(e) {
				texture.premultiplyAlpha = true;
				texture.needsUpdate = true;
				texture.magFilter = THREE.NearestFilter;
				texture.minFilter = THREE.NearestFilter;

				material.uniforms[type].value = texture;
			});
		}

		loadMap(prevMapSrc, 'prevMap');
		loadMap(nextMapSrc, 'nextMap');
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
			TweenMax.to(material.uniforms.bright, 0.4, {
				value: value
			});
		}

		this._currentScheme = scheme;
	}
	elementProto.handleDispatcher = function(e) {
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
		this.loop = this.loop.bind(this);
		this._active = true;
		this._currentScheme = undefined;
	}
	elementProto.attachedCallback = function() {
		this._maskElements = this.getElementsByClassName('mask');
		this._maskSrc = this._maskElements[0].getAttribute('data-texture');
		if (Modernizr && (!Modernizr.webgl || Modernizr.touchevents)) return;

		Array.prototype.forEach.call(this._maskElements, function(element) {
			var img = document.createElement('img');
			img.src = element.getAttribute('data-texture');
		});

		this.build();
		this.handleScheme();

		resizeStore.eventEmitter.subscribe(this.handleResize);
		dispatcher.subscribe(this.handleDispatcher);
		schemeStore.eventEmitter.subscribe(this.handleScheme);
	}
	elementProto.detachedCallback = function() {
		resizeStore.eventEmitter.unsubscribe(this.handleResize);
		dispatcher.unsubscribe(this.handleDispatcher);
		schemeStore.eventEmitter.unsubscribe(this.handleScheme);
	}

	document.registerElement('stage-component', {
		prototype: elementProto
	});
});