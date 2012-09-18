//Create FS namespace if not already there.
var FS = FS || {};

FS.FlickScroll = (function(win, doc, $) {
	'use strict';

	var _name = "FlickScroll",
		_defaults = {
			$flickElement: $('body'),
			$flickDistanceThreshold: 1000, //in pixels
			$flickTimeMax: 1000, //in milliseconds
			$allowTapScroll: true, //allow scroll to positon on touch as well as a flick
			axis: 'vertical', //Direction of scroll intent (horizontal, vertical, all) TODO: implement 'all'
			debug: true 
		},
		_eventStorage = {
			'touchStartPositionX': 0,
			'touchStartPositionY': 0,
			'touchStartTime': 0,
			'touchEndPositionX': 0,
			'touchEndPositionY': 0,
			'touchEndTime': 0,
			'eventDirectionX': '',
			'eventDirectionY': ''
		};

	var FlickScroll = function(options){
		this.options = $.extend({}, _defaults, options);
	};

	//--------------------------------------------------
	//EVENT HANDLERS
	//--------------------------------------------------
	
	function handleTouchStart(event){
		//Store first touch event data
		_eventStorage.touchStartPositionX = event.pageX;
		_eventStorage.touchStartPositionY = event.pageY;
		_eventStorage.touchStartTime = Date.now();

		var $debugPanel = $('html').find('.debug-panel');
		$debugPanel.find('.direction').html("Event Type: " + event);
	}

	function handleTouchEnd(event){
		//Set flick event end parameters
		_eventStorage.touchEndPositionX = event.pageX;
		_eventStorage.touchEndPositionY = event.pageY;
		_eventStorage.touchEndTime = Date.now();

		//Calculate differences to detect direction and speed of flick event to test against settings.
		var flickOptions = {
			'totalFlickTime': _eventStorage.touchEndTime - _eventStorage.touchStartTime,
			'xDifference': _eventStorage.touchStartPositionX - _eventStorage.touchEndPositionX,
			'yDifference': _eventStorage.touchStartPositionY - _eventStorage.touchEndPositionY
		};

		//Determine direction of flick x (left or right)
		if(flickOptions.xDifference === 0 && FS.FlickScroll.options.$allowTapScroll === true){
			_eventStorage.eventDirectionX = 'none';
		}else{
			if(flickOptions.xDifference > 0){
				_eventStorage.eventDirectionX = 'left';
			}else{
				_eventStorage.eventDirectionX = 'right';
			}
		}

		//Determine direction of flick y (up or down)
		if(flickOptions.yDifference === 0 && FS.FlickScroll.options.$allowTapScroll === true){
			_eventStorage.eventDirectionY = 'none';
		}else{
			if(flickOptions.yDifference > 0){
				_eventStorage.eventDirectionY = 'up';
			}else{
				_eventStorage.eventDirectionY = 'down';
			}
		}

		//Check for time difference vs. set max time to define a flick vs. scroll
			//Check for distance flicked vs. set distance threshold to define flick vs. scroll
		if(flickOptions.totalFlickTime < FS.FlickScroll.options.$flickTimeMax){
			triggerFlick(flickOptions);
		}else{
			console.log('Touch event took too long. Not treated as flick. Check $flickTimeMax option.');
		}

		//Debug console to log values for testing only
		if(FS.FlickScroll.options.debug === true){
			var $debugPanel = $('html').find('.debug-panel');
			$debugPanel.find('.time').html("Event Time: " + flickOptions.totalFlickTime/1000 + ' seconds');
			$debugPanel.find('.posX').html("Pos X Difference: " + flickOptions.xDifference + "px");
			$debugPanel.find('.posY').html("Pos Y Difference: " + flickOptions.yDifference + "px");
			$debugPanel.find('.direction').html("Directions: " + _eventStorage.eventDirectionY + " " + _eventStorage.eventDirectionX);
		}
	}

	function triggerFlick(options){
		console.log('triggerFlick', options);
	}

	//--------------------------------------------------
	//PRIVATE METHODS
	//--------------------------------------------------

	function attachEvents(){
		FS.FlickScroll.options.$flickElement.on({
			"mousedown.flickScroll": handleTouchStart,
			"mouseup.flickScroll": handleTouchEnd
		});
		
	}

	//--------------------------------------------------
	//PUBLIC HANDLERS
	//--------------------------------------------------

	FlickScroll.prototype.init = function(){
		attachEvents();

		if(FS.FlickScroll.options.debug === true){
			$('html').append('<div class="debug-panel"><div class="time"></div><div class="posX"></div><div class="posY"></div><div class="direction"></div></div>');
		}

		return this;
	};


	$('.flickScroll').each(function () {
		if (!$.data(this, 'FlickScroll_' + _name)) {
			$.data(this, 'FlickScroll_' + _name, new FlickScroll(this, {}));
		}
	});

	return new FlickScroll();

}(window, document, jQuery));

FS.FlickScroll.init();