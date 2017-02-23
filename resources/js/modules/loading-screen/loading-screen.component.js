define([
	'dispatcher',
	'THREE',
	'resize/resize.store',
	'utils',
	'TweenMax',
	'text!glsl/simple-vertex.glsl',
	'text!glsl/loading-fragment.glsl'
], function(
	dispatcher,
	THREE,
	resizeStore,
	utils,
	TweenMax,
	simpleVertexShader,
	loadingFragmentShader
) {
	"use strict";

	var requestAnimationFrame = utils.getRequestAnimationFrame();

	var elementProto = Object.create(HTMLElement.prototype);

	elementProto.buld = function() {
		var camera, scene, renderer;
		var ww = resizeStore.getData().width;
		var wh = resizeStore.getData().height;
		var plane;
		var mesh;
		var material;
		var dpr = 1;
		var maxW = Math.max(ww, wh);

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
				res: {type: 'v2', value: new THREE.Vector2(ww, wh)},
				Fi: {type: 'f', value: 0},
				fact: {type: 'f', value: 0},
				globalA: {type: 'f', value: 0},
				sideA: {type: 'f', value: 0},
				disA: {type: 'f', value: 1}
			},
			vertexShader: simpleVertexShader,
			fragmentShader: loadingFragmentShader
		});

		plane = new THREE.PlaneBufferGeometry(maxW, maxW);
		mesh = new THREE.Mesh(plane, material);
		scene.add(mesh);

		this._material = material;
		this._scene = scene;
		this._camera = camera;
		this._renderer = renderer;

		renderer.render(scene, camera);
	}

	elementProto.loop = function() {
		var material = this._material;
		var scene = this._scene;
		var camera = this._camera;
		var renderer = this._renderer;

		if (!this._active) return;

		this._loopIndex++;
		if (this._loopIndex >= 1800) {
			this._loopIndex = 0;
		}

		if (this._loopIndex % 3 === 0
			|| this._loopIndex % 9 === 0
			|| this._loopIndex % 8 === 0
		) {
			material.uniforms.fact.value = Math.random()/20 + 0.01;
		}

		material.uniforms.Fi.value = Math.sin((this._loopIndex/900)*Math.PI)/20 + 0.02;

		renderer.render(scene, camera);
		requestAnimationFrame(this.loop);
	}

	elementProto.handleDispatcher = function(e) {
		var self = this;
		if (e.type === 'preload-starting') {
			this._active = true;
			this.loop();
			setTimeout(function() {
				TweenMax.to(self._material.uniforms.globalA, 1.8, {
					value: 1
				});
			}, 100);
		}
		if (e.type === 'preload-finishing') {
			setTimeout(function() {
				TweenMax.to(self._material.uniforms.disA, 0.6, {
					value: -0.25
				});
			}, 1300);
		}
		if (e.type === 'preload-complete' && this._active) {
			setTimeout(function() {
				// can be destructed by the time though
				self._active = false;
			}, 6000);	
		}
	}

	elementProto.createdCallback = function() {
		this._loopIndex = 0;
		this.build = this.buld.bind(this);
		this.handleDispatcher = this.handleDispatcher.bind(this);
		this.loop = this.loop.bind(this);
	}
	elementProto.attachedCallback = function() {
		if (Modernizr && !Modernizr.webgl) return;

		this.build();
		dispatcher.subscribe(this.handleDispatcher);
	}
	elementProto.detachedCallback = function() {
		dispatcher.unsubscribe(this.handleDispatcher);
	}

	document.registerElement('loading-screen', {
		prototype: elementProto
	});
});