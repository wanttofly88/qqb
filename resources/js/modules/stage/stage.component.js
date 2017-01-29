define([
	'dispatcher',
	'THREE',
	'resize/resize.store'
], function(
	dispatcher,
	THREE,
	resizeStore
) {
	"use strict";

	var dpr = 1;

	var Base = function(component) {
		this._renderer = null;
		this._renderPass = null;
		this._effectPass = null;
		this._vertexShader = null;
		this._rShader = null;
		this._rPass = null;

		var init = function() {
			var ww = resizeStore.getData().width;
			var wh = resizeStore.getData().height;

			component._camera = new THREE.OrthographicCamera(
				ww*dpr / -2, 
				ww*dpr / 2,  
				wh*dpr / 2, 
				wh*dpr / -2, 
				-100, 100);
			component._scene = new THREE.Scene();

			this._rShader = {
				uniforms: {
					h: {type: 'f', value: 1},
					v: {type: 'f', value: 1}
				},
				vertexShader: this._vertexShader,
				fragmentShader: this._rShader
			}

			this._renderer = new THREE.WebGLRenderer({
				antialias: true
			});
			this._renderer.setPixelRatio(window.devicePixelRatio);
			this._renderer.setSize(ww, wh);

			this._renderer.domElement.style.width  = '100%';
			this._renderer.domElement.style.height = '100%';
			component.appendChild(this._renderer.domElement);

			this._renderPass = new THREE.RenderPass(component._scene, component._camera);
			this._rPass = new THREE.ShaderPass(this._rShader);
			this._copyPass   = new THREE.ShaderPass(THREE.CopyShader);
			this._rPass.renderToScreen = true;

			component._composer = new THREE.EffectComposer(this._renderer);
			component._composer.setSize(ww, wh);

			component._composer.addPass(this._renderPass);
			component._composer.addPass(this._copyPass);
			component._composer.addPass(this._rPass);
		}

		var resize = function() {
			var ww = resizeStore.getData().width;
			var wh = resizeStore.getData().height;

			if (component._camera && this._renderer) {
				component._camera.left =   ww*dpr / -2;
				component._camera.right =  ww*dpr / 2;
				component._camera.top =    wh*dpr / 2;
				component._camera.bottom = wh*dpr / -2;

				component._camera.updateProjectionMatrix();
				this._renderer.setPixelRatio(window.devicePixelRatio);
				this._renderer.setSize(ww, wh);

				this._renderer.domElement.style.width  = '100%';
				this._renderer.domElement.style.height = '100%';
			}
		}

		var render = function() {
			composer.render(scene, component._camera);
		}

		return {
			init: init.bind(this),
			render: render.bind(this),
			resize: resize.bind(this)
		}
	}

	var elementProto = function() {

		var createdCallback = function() {
			this._camera;
			this._scene;
			this._composer;
			this._base = new Base(this);
		}
		var attachedCallback = function() {
			this._base.init();
			this._base.resize();
		}

		var detachedCallback = function() {
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