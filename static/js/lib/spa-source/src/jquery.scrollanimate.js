/**
 *  $.fn.scrollAnimate
*/
;(function(window, $, undefined){
	if(!window.console){
		window.console = {
			log : function(){
			
			}
		};
	};	
	var PLUGIN_NAME = "scrollAnimate";
	var CLASS_NAME = "ScrollAnimate";
	var opt = Object.prototype.toString;
	function _class_(ele, options){
		this.ele = $(ele).eq(0);
		this.version = "2.3";
		this.init();
	}
	_class_.prototype = {
		init : function(){
			console.log("start init...");
		},
		destroy : function(){
			this.unbind();
			console.log("destroy success");
		},
		unbind : function(){
			console.log("unbind success");
		},
		testFunc : function(a, b){
			alert("result:" + (a + b) + ", version:" + this.version);
		}
	};
	$.fn[PLUGIN_NAME] = function(options){
		var args = arguments;
		
		return this.each(function(){
			var t = $(this);
			var data = $(this).data(PLUGIN_NAME);
			if(args.length == 0){
				options = {};
			}
			var type = opt.call(options);
			if(type == "[object Object]"){
				t.data(PLUGIN_NAME, new _class_(this, options));
			}else if(type == "[object String]"){
				if(!data){
					return;
				}
				if(typeof(data[options]) !== "undefined"){
					data[options].apply(data, Array.prototype.slice.call(args, 1));
				}else{
					console.log("object." + options + "() undefined");
				}
			}
		});
	}
	window[CLASS_NAME] = _class_;
	
})(window, jQuery);