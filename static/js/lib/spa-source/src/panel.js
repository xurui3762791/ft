/**
 * @class Panel
*/
XDK.ns("Panel", function(){
	var TouchEvents = (function(){
		var supportTouch = "ontouchend" in document ? true : false;
		return {
			touchstart : supportTouch ?  "touchstart" : "mousedown",
			touchmove : supportTouch ? "touchmove" : "mousemove",
			touchend : supportTouch ? "touchend" : "mouseup"
		};	
	})();
	
    var support = {
        transforms3d : (window.Modernizr && Modernizr.csstransforms3d === true) || (function () {
            'use strict';
            var div = document.createElement('div').style;
            return ('webkitPerspective' in div || 'MozPerspective' in div || 'OPerspective' in div || 'MsPerspective' in div || 'perspective' in div);
        })(),

        transforms : (window.Modernizr && Modernizr.csstransforms === true) || (function () {
            'use strict';
            var div = document.createElement('div').style;
            return ('transform' in div || 'WebkitTransform' in div || 'MozTransform' in div || 'msTransform' in div || 'MsTransform' in div || 'OTransform' in div);
        })(),

        transitions : (window.Modernizr && Modernizr.csstransitions === true) || (function () {
            'use strict';
            var div = document.createElement('div').style;
            return ('transition' in div || 'WebkitTransition' in div || 'MozTransition' in div || 'msTransition' in div || 'MsTransition' in div || 'OTransition' in div);
        })()
    };
	var support3D = support.transforms3d  && support.transforms && support.transitions;
	
	var INDEX = -1;	
	var PANEL_LEFT = "left";
	var PANEL_RIGHT = "right";
	var PANEL_LEFT_RIGHT = "left-right";
	function getPanelAlpha(type, index){
		var node = $("<div id='panel-alpha-" + index + "' class='panel-alpha'></div>");
		return node;
	};
	function getPanel(type, index){
		var node = $("<div id='panel-bar-" + type + "-" + index + "' class='panel-bar panel-bar-" + type + "-" + index + " panel-bar-" + type + "'></div>");
		return node;
	}
	var __class__ = XDK.Class.create({
		_init_ : function(options){
			INDEX += 1;
			this.index = INDEX;
			this.set = $.extend({
				// left|right|left-right
				type : "left-right",
				leftPanelHtml : "",
				rightPanelHtml : ""	,
				animateDuration : 300,
				//使用document swipe 事件打开面板
				useDocumentSwipeEvent : true,
				use3DTransform : true,
				events : {}
			}, options);
			this.set.events = $.extend({
				leftpanelcreate : function(panel, _self){
					console.log("left panel init");
				},
				rightpanelcreate : function(panel, _self){
					console.log("right panel init");
				},
				panelopen : function(panel, currentPanelType, _self){
					console.log(currentPanelType + " panel open");
				},
				panelclose : function(panel, currentPanelType, _self){
					console.log(currentPanelType + " panel close");
				}
			}, this.set.events);
			this.panelType = this.set.type;
			this.panelAlpha = null;
			this.leftPanel = null;
			//open close
			this.leftPanelState = "close";
			this.leftPanelWidth = null;
			this.rightPanel = null;
			//open close
			this.rightPanelState = "close";
			this.rightPanelWidth = null;
			this._init();	
			
		},
		
		/**
		 * 初始化的操作，创建dom，绑定相关事件
		*/
		_init : function(){
			var _this = this;
			this._createPanel();
			this._createPanelAlpha();
			this._createStyle();
			$(document).bind("swipeleft swiperight", $.proxy(this._doc_swipe_evt, this));
			//$(document).bind("mousedown");
			if(this.leftPanel){
				this.leftPanel.bind("swipeleft", function(e){
					_this.closeLeftPanel();
				});
			};
			if(this.rightPanel){
				this.rightPanel.bind("swiperight", function(e){
					_this.closeRightPanel();
				});
			};
		
			this.panelAlpha.bind("tap", function(e){
				e.stopPropagation(); 
				e.preventDefault();
				_this.closeLeftPanel();
				_this.closeRightPanel();
			});
			
		}, 
		/**
		 * document 的swipe 事件封装
		*/
		_doc_swipe_evt : function(e){
			//console.log(e.type);	
			//console.log(this.set.type);	
			//e.stopPropagation();
			//e.preventDefault();
			var type = e.type;
			//console.log(type);
			if(this.set.useDocumentSwipeEvent){ 
				if(type == "swipeleft"){
					this.openRightPanel();
				}else if(type == "swiperight"){
					this.openLeftPanel();
				}
			};
			
			
		},
		/**
		 * 移除相关事件绑定
		*/
		unbind : function(){
			if(this.leftPanel){
				this.leftPanel.unbind();
			};
			if(this.rightPanel){
				this.rightPanel.unbind();
			};
			$(document).unbind("swipeleft swiperight", this._doc_swipe_evt);
			this.panelAlpha.unbind();
		},
		/**
		 * 销毁
		*/
		destroy : function(){
			this.unbind();
			if(this.leftPanel){
				this.leftPanel.remove();
			};
			if(this.rightPanel){
				this.rightPanel.remove();
			};
			this.panelAlpha.remove();
			$("#panel-style-" + this.index).remove();
		},
		/**
		 * 创建面板，设置相关参数
		*/
		_createPanel : function(){
			if(this.panelType == PANEL_LEFT_RIGHT){
				this.leftPanel = getPanel("left", this.index);
				this.rightPanel = getPanel("right", this.index);
				$("body").append(this.leftPanel);
				$("body").append(this.rightPanel);
				this.leftPanel.html(this.set.leftPanelHtml);
				this.rightPanel.html(this.set.rightPanelHtml);
				this.set.events.leftpanelcreate.call(this, this.leftPanel, this);
				this.set.events.rightpanelcreate.call(this, this.rightPanel, this);
			}else if(this.panelType == PANEL_LEFT){
				this.leftPanel = getPanel("left", this.index);
				$("body").append(this.leftPanel);
				this.leftPanel.html(this.set.leftPanelHtml);
				this.set.events.leftpanelcreate.call(this, this.leftPanel, this);
			}else if(this.panelType == PANEL_RIGHT){
				this.rightPanel = getPanel("right", this.index);
				$("body").append(this.rightPanel);
				this.rightPanel.html(this.set.rightPanelHtml);
				this.set.events.rightpanelcreate.call(this, this.rightPanel, this);
			};
			if(this.leftPanel){
				this.leftPanelWidth = this.leftPanel[0].offsetWidth;
				this.leftPanel.css({
					left : -this.leftPanelWidth
				});
			};
			if(this.rightPanel){
				this.rightPanelWidth = this.rightPanel[0].offsetWidth;
				this.rightPanel.css({
					right : -this.rightPanelWidth
				});
			};
		},
		_createStyle : function(){
			var cssTpl = [
				"<style id='panel-style-" + this.index + "' type='text/css' >",
					".panel-bar-left-" + this.index + "{ -webkit-transition:-webkit-transform " + (this.set.animateDuration/1000) + "s linear; transition:transform " + (this.set.animateDuration/1000) + "s linear; }",
					".panel-bar-right-" + this.index + "{ -webkit-transition:-webkit-transform " + (this.set.animateDuration/1000) + "s linear; transition:transform " + (this.set.animateDuration/1000) + "s linear;}",
					"." + this._get3dClassName("left") + "{-webkit-transform:translate3d(" + this.leftPanelWidth + "px, 0px, 0px);transform:translate3d(" + this.leftPanelWidth + "px, 0px, 0px);}",
					"." + this._get3dClassName("right") + "{-webkit-transform:translate3d(-" + this.rightPanelWidth + "px, 0px, 0px);transform:translate3d(-" + this.rightPanelWidth + "px, 0px, 0px);}",
				"</style>"
			].join("\n");
			$("head").append(cssTpl);
		},
		/**
		 * 获取当前对象的某个面板进行3d切换动画的类名 
		 * @param {String} type - left/right
		 * @return {String}	
		*/
		_get3dClassName : function(type){
			return "animate3d-" + type + "-" + this.index;
		},
		/**
		 * 添加3d切换动画类
		 * @param {String} type - left/right
		*/
		_add3dAnimateClass : function(type){
			this[type + "Panel"].addClass(this._get3dClassName(type));
		},
		/**
		 * 移除3d切换动画类
		 * @param {String} type - left/right
		*/
		_remove3dAnimateClass : function(type){
			this[type + "Panel"].removeClass(this._get3dClassName(type));
		},
		/**
		 * 创建遮罩
		*/
		_createPanelAlpha : function(){
			var node = getPanelAlpha(this.index, this.panelType);
			$("body").append(node);
			this.panelAlpha = node;
		},
		/**
		 * 显示遮罩
		*/
		showPanelAlpha : function(){
			this.panelAlpha.show().css({
				opacity : 0
			}).stop().animate({
				opacity : 0.5
			}, 200, function(){
			});	
		},
		/**
		 * 隐藏遮罩
		*/
		hidePanelAlpha : function(){
			this.panelAlpha.css({
				opacity : 0.5
			}).stop().animate({
				opacity : 0
			}, 200, function(){
				$(this).hide();
			});	
			
			this.panelAlpha.css({opacity : 0}).hide();	
		},
		/**
		 * 设置遮罩尺寸
		 * @param {String} type - 遮罩方向，left/right : 距离浏览器左/右边的某个宽度，然后自适应宽度
		*/
		setPanelAlphaSize : function(type){
			if(type == "left"){
				this.panelAlpha.addClass("panel-alpha-left").removeClass("panel-alpha-right");
			}else if(type == "right"){
				this.panelAlpha.addClass("panel-alpha-right").removeClass("panel-alpha-left");
			};
		},
		/**
		 * 展开左面板
		*/
		openLeftPanel : function(){
			var _this = this;
			if(this.leftPanelState == "open" || !this.leftPanel || this.rightPanelState == "open"){
				return;
			};
			
			this.setPanelAlphaSize("left");
			this.showPanelAlpha();
			//如果设置使用3d切换，同时系统支持3d切换
			if(this.set.use3DTransform && support3D){
				//this.leftPanel.addClass("animate3d-left");
				this._add3dAnimateClass("left");
				setTimeout(function(){
					_this.leftPanelState = "open";
					_this.set.events.panelopen.call(_this, _this.leftPanel, "left", _this);
				}, this.set.animateDuration);
			}else{
				this.leftPanel.stop().animate({
					left : 0
				}, this.set.animateDuration, function(){
					_this.leftPanelState = "open";
					_this.set.events.panelopen.call(_this, _this.leftPanel, "left", _this);
				});
			}
		},
		/**
		 * 关闭左面板
		*/
		closeLeftPanel : function(){
			var _this = this;	
			if(  !this.leftPanel || this.leftPanelState == "close"){
				return;
			};
			_this.hidePanelAlpha();
			if(this.set.use3DTransform && support3D){
				//this.leftPanel.removeClass("animate3d-left");
				this._remove3dAnimateClass("left");
				setTimeout(function(){
					_this.leftPanelState = "close";
					_this.set.events.panelclose.call(_this, _this.leftPanel, "left", _this);
				}, this.set.animateDuration);
			}else{
				this.leftPanel.stop().animate({
					left : - this.leftPanelWidth
				}, this.set.animateDuration, function(){
					_this.leftPanelState = "close";
					_this.set.events.panelclose.call(_this, _this.leftPanel, "left", _this);
				});
			}
		},
		/**
		 * 展开右面板
		*/
		openRightPanel : function(){
			var _this = this;
			if(this.rightPanelState == "open" || !this.rightPanel || this.leftPanelState == "open"){
				return;
			};
			this.setPanelAlphaSize("right");
			this.showPanelAlpha();
			if(this.set.use3DTransform && support3D){
				//this.rightPanel.addClass("animate3d-right");
				this._add3dAnimateClass("right");
				setTimeout(function(){
					_this.rightPanelState = "open";
					_this.set.events.panelopen.call(_this, _this.rightPanel, "right", _this);
				}, this.set.animateDuration);
			}else{
				this.rightPanel.stop().animate({
					right : 0
				}, this.set.animateDuration, function(){
					_this.rightPanelState = "open";
					_this.set.events.panelopen.call(_this, _this.rightPanel, "right", _this);
				});
			}
		},
		/**
		 * 关闭右面板
		*/
		closeRightPanel : function(){
			var _this = this;
			if( !this.rightPanel || this.rightPanelState == "close"){
				return;
			};
			_this.hidePanelAlpha();
			if(this.set.use3DTransform && support3D){
				//this.rightPanel.removeClass("animate3d-right");
				this._remove3dAnimateClass("right");
				setTimeout(function(){
					_this.rightPanelState = "close";
					_this.set.events.panelclose.call(_this, _this.rightPanel, "right", _this);
				}, this.set.animateDuration);
			}else{
				this.rightPanel.stop().animate({
					right : -this.rightPanelWidth
				}, this.set.animateDuration, function(){
					_this.rightPanelState = "close"; 
					_this.set.events.panelclose.call(_this, _this.rightPanel, "right", _this);
				});
			}	
		}
	});
	return __class__;
});

