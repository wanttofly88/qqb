"use strict";

var __path;
var pathElements =  document.getElementsByName('resources-path');
if (pathElements && pathElements.length) {
	__path = pathElements[0].content;
} else {
	__path = document.getElementsByTagName('head')[0].getAttribute('data-path');
}

if (__path.slice(-1) !== '/') __path += '/';

require.config({
	baseUrl: __path + 'js/modules',
	paths: {
		text: '../libs/text',
		TweenMax: '../libs/TweenMax',
		THREE: '../libs/THREE',
		THREEShaders: '../libs/THREE-Shaders',
		bezier: '../libs/bezier-easing',
	},
	shim: {
		THREE: {
			exports: 'THREE'
		},
		bezier: {
			exports: 'bezier'
		}
	}
});


require([
	'text',
	'resize/vh-fix.component',
	'resize/proportional-height.component',

	'full-img/full-img.component',

	'scheme/scheme.component',

	'router/router.component',
	'router/menu-link.component',
	'router/inner-link.component',
	'router/page-transition.component',

	'audio/audio-player.component',
	'audio/audio-progress.component',
	'audio/audio-progressbar.component',
	'audio/audio-pause.component',
	'audio/audio-visual.component',

	'track-list/track-list.component',

	'text-glitch/menu-text.component',

	'popup/popup.component',
	'popup/popup-toggle.component',
	'popup/popup-close.component',
	'popup/menu-toggle.component',
	'popup/popup.helper',

	'helpers/beats-helper.component',
	'helpers/albums-helper.component',
	'helpers/videos-helper.component',
	'helpers/album-helper.component',
	'helpers/merch-helper.component',
	'helpers/about-helper.component',

	'slide-scroll/slide-scroll.component',
	'slide-scroll/slide-scroll-index.component',
	'slide-scroll/slide-scroll-total.component',
	'slide-scroll/slide-scroll-control.component',

	'print-slider/print-slider.component',
	'attribute-slider/href-slider.component',
	'attribute-slider/buy-slider.component',

	'cart/license.component',
	'cart/cart.component',
	'cart/cart-item.component',
	'cart/cart-total.component',
	'cart/cart-price.component',
	'cart/buy-merch-btn.component',
	'cart/buy-album.component',
	'cart/buy-album-fixed.component',
	'cart/buy-beat.component',
	'cart/buy-beat-fixed.component',
	'cart/cart-checkout.component',

	'slider/cover-bg-slider.component',
	'slider/cover-slider.component',
	'slider/video-slider.component',
	'slider/merch-slider.component',
	'slider/webgl-slider.component',

	'decor/header.component',
	'decor/text-print.component',

	'video/video.component',
	'video/video-play.component',
	'video/video-play-fixed.component',

	'loading-screen/loading-screen.component',
	'stage/stage.component',
	'preloader/preloader.component',

	's-scroll/s-scroll.view',
	'page-name/page-name.component',

	'merch/merch-sizes.component',
	'merch/look.component'
]);