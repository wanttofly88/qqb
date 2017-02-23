define([
	'dispatcher',
	'THREE',
	'resize/resize.store',
	'utils',
	'text!glsl/simple-vertex.glsl',
	'text!glsl/simple-fragment.glsl'
], function(
	dispatcher,
	THREE,
	resizeStore,
	utils,
	simpleVertexShader,
	simpleFragmentShader
) {
	"use strict";

	var requestAnimationFrame = utils.getRequestAnimationFrame();

	var elementProto = function() {
		var buld = function() {
			var camera, scene, renderer;
			var ww = resizeStore.getData().width;
			var wh = resizeStore.getData().height;
			var plane, mesh, material;
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
				},
				vertexShader: simpleVertexShader,
				fragmentShader: simpleFragmentShader
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

		var loop = function() {
			var material = this._material;
			var scene = this._scene;
			var camera = this._camera;
			var renderer = this._renderer;

			if (!this._active) return;

			this._loopIndex++;

			renderer.render(scene, camera);
			requestAnimationFrame(this._loop);
		}

		var handleDispatcher = function(e) {
		}
		var handleResize = function() {
		}

		var createdCallback = function() {
			this._loopIndex = 0;
			this._build = buld.bind(this);
			this._handleDispatcher = handleDispatcher.bind(this);
			this._handleResize = handleResize.bind(this);
			this._loop = loop.bind(this);
		}
		var attachedCallback = function() {
			if (Modernizr && !Modernizr.webgl) return;

			this._build();
			resizeStore.eventEmitter.subscribe(this._handleResize);
			dispatcher.subscribe(this._handleDispatcher);
		}
		var detachedCallback = function() {
			resizeStore.eventEmitter.unsubscribe(this._handleResize);
			dispatcher.unsubscribe(this._handleDispatcher);
		}


		return {
			createdCallback: createdCallback,
			attachedCallback: attachedCallback,
			detachedCallback: detachedCallback
		}
	}();

	Object.setPrototypeOf(elementProto, HTMLElement.prototype);
	document.registerElement('stage-component', {
		prototype: elementProto
	});
});