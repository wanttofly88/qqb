define([
	'dispatcher',
	'THREE',
	'resize/resize.store',
	'utils',
	'TweenMax'
], function(
	dispatcher,
	THREE,
	resizeStore,
	utils,
	TweenMax
) {
	"use strict";

	var requestAnimationFrame = utils.getRequestAnimationFrame();

	var elementProto = function() {
		var buld = function() {
			var camera, scene, renderer;
			var ww = resizeStore.getData().width;
			var wh = resizeStore.getData().height;
			var plane;
			var mesh;
			var material;
			var fragmentShader, vertexShader;
			var dpr = 1;

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

			vertexShader = document.getElementById('simpleVertexShader').innerHTML;
			fragmentShader = document.getElementById('loadingFragmentShader').innerHTML;

			material = new THREE.ShaderMaterial({
				uniforms: {
					res: {type: 'v2', value: new THREE.Vector2(ww, wh)},
					Fi: {type: 'f', value: 0},
					fact: {type: 'f', value: 0},
					globalA: {type: 'f', value: 0},
					sideA: {type: 'f', value: 0},
					disA: {type: 'f', value: 1}
				},
				vertexShader: vertexShader,
				fragmentShader: fragmentShader
			});

			plane = new THREE.PlaneBufferGeometry(ww, ww);
			mesh = new THREE.Mesh(plane, material);
			scene.add(mesh);

			this._material = material;
			this._scene = scene;
			this._camera = camera;
			this._renderer = renderer;

			renderer.render(scene, camera);
		}

		var loop = function() {
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
			requestAnimationFrame(this._loop);
		}

		var handleDispatcher = function(e) {
			var self = this;
			if (e.type === 'preload-starting') {
				this._active = true;
				this._loop();
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

		var createdCallback = function() {
			this._loopIndex = 0;
			this._build = buld.bind(this);
			this._handleDispatcher = handleDispatcher.bind(this);
			this._loop = loop.bind(this);
		}
		var attachedCallback = function() {
			if (Modernizr && !Modernizr.webgl) return;

			this._build();
			dispatcher.subscribe(this._handleDispatcher);
		}
		var detachedCallback = function() {
			dispatcher.unsubscribe(this._handleDispatcher);
		}


		return {
			createdCallback: createdCallback,
			attachedCallback: attachedCallback,
			detachedCallback: detachedCallback
		}
	}();

	Object.setPrototypeOf(elementProto, HTMLElement.prototype);
	document.registerElement('loading-screen', {
		prototype: elementProto
	});
});