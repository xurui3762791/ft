		
XDK.ns("FixDialog", function(){
	var supportTouch = "ontouchend" in document ? true : false;
	var touchEvents = {
		touchstart : supportTouch ?  "touchstart" : "mousedown",
		touchmove : supportTouch ? "touchmove" : "mousemove",
		touchend : supportTouch ? "touchend" : "mouseup"
	}

	var opt = Object.prototype.toString;
	var J = {};
	J.getType = function(a){
		var ret;
		var l = arguments.length;
		if (l === 0 || typeof(a) === "undefined") {
			ret = "undefined"
		} else {
			ret = (a === null) ? "null": opt.call(a)
		};
		return ret
	};
	J.type = {
		is_array : function(a){
			return J.getType(a) === "[object Array]";
		},
		is_string : function(a){
			return J.getType(a) === "[object String]";
		},
		is_number : function(a){
			return J.getType(a) === "[object Number]";
		},
		is_object : function(a){
			return J.getType(a) === "[object Object]";
		},
		is_function : function(a){
			return J.getType(a) === "[object Function]";
		},
		is_null : function(a){
			return J.getType(a) === "null";
		},
		is_undefined : function(a){
			 return J.getType(a) === "undefined";
		}
	};
	function uid(){
		var guid = "";
		for (var i = 1; i <= 32; i++){
		  var n = Math.floor(Math.random()*16.0).toString(16);
		  guid +=   n;
		  if((i==8)||(i==12)||(i==16)||(i==20))
			guid += "-";
		}
		return guid;    
	};	
	
	function render(tpl, data) {
		var __self = arguments.callee;
		if (J.type.is_array(data)) {
			var ret = "";
			$.each(data, function(key, obj) {
				ret += __self(tpl, obj)
			});
			return ret
		} else if (J.type.is_object(data)) {
			$.each(data, function(key, value) {
				tpl = tpl.replace(new RegExp("{" + key + "}", "g"), value);
			});
			return tpl
		} else {
			return null
		}
	};	
	var TPL = "" + 
	"<div class=\"fix-dialog-alpha  \" style=\"display:none;\" id=\"fix-dialog-alpha-{index}\"></div>" +	
	"<div class=\"fix-dialog  {dialogClassName}\" id=\"fix-dialog-{index}\" style=\"display:none;\">" +
	"	<table class=\"fix-dialog-table\" width=\"100%\" height=\"100%\" >" +
	"		<tr>" +
	"			<td>" +
	"				<div class=\"fix-dialog-wrap\" style='position:relative;'>" +
	"					<div class=\"handle-split\"></div>" +
	"					<div class=\"handle\"></div>" +
	"					<div class=\"c\"></div>" +
	"					<div class=\"bottom fix\"></div>" +
	"				</div>" +
	"			</td>" +
	"		</tr>" +
	"	</table>" +
	"</div>";
	var tapEvtName = "click";
	
	var ZINDEX = 1000;
	var IDINDEX = -1;
	var DIALOG_LIST = {};
	//按钮设置
	var btnSet = {
		text : "ok",
		disabled : false,
		fn : function(btnObj, _self){},
		css : {},
		cssClass : "",
		id : ""
	};
	var __class__ = XDK.Class.create({
		wrapContent : function(msg){
			return "<div class=\"text-wrap\">" + msg + "</div>";
		},
		_getDialog_ : function(id){
			return typeof(DIALOG_LIST[id]) != "undefined" ? DIALOG_LIST[id] : null; 
		},
		_DIALOG_LIST_ : DIALOG_LIST,
		updateZIndex : function(){
			ZINDEX += 1;
			this.zIndex = ZINDEX;
			this.DOM.dialog.css({
				"z-index" : this.zIndex
			});
			this.DOM.alpha.css({
				"z-index" : this.zIndex
			});
		},
		/**
		 * @constructor 
		 * @param {Array} options.buttons
		*/
		_init_ : function(options){
			
			IDINDEX += 1;
			this.index = IDINDEX;
			
			this.set = $.extend({
				id : uid(),
				title : "提示",
				content : "<p>系统提示！</p>",
				alphaOpacity : 0.4,
				alphaBgColor : "#000000",
				buttonText : "确定",
				dialogClassName : "",
				buttons : [],
				btnActiveClass: "btn-active",
				//点击遮罩层关闭对话框
				closeOnAlphaClick : true,
				autoShow : true,
				showHandlebar : true,
				events : {},
				//true 隐藏dialog（同一个id的dialog可以缓存，不用每次创建）
				//false 强制关闭dialog(不同id的dialog)
				lazyClose : false,
				dialogTpl : TPL
			}, options);
			this.id = this.set.id;
			var dialogObj = __class__.getDialog(this.id);
			if(dialogObj){
				dialogObj.show();
				return dialogObj;
			};
			this.title = null;
			this.content = null;
			this.buttonText = null;
			this.lazyClose = this.set.lazyClose;
			this.set.events = $.extend({
				init : function(_self){},
				beforeopen : function(_self){},
				open : function(_self){},
				show : function(_self){},
				beforehide : function(_self){},
				hide : function(_self){},
				beforeclose : function(_self){return true;},
				close : function(_self){}
			}, this.set.events);
			DIALOG_LIST[this.id] = this;
			this.buttons = {};
			this.DOM = {};
			this.init();
		},
		_close : function(){
			if(!this.lazyClose){
				this.close()
			}else{
				this.hide();
			};
		},
		getBtn : function(id){
			var btn = this.buttons[id];
			 
			return typeof(btn) == "undefined" ? null : btn;
		},
		getBtnElement : function(id){
			var ele =  this.DOM.btnBar.find("input.btn[data-id='" + id + "']").eq(0);
			return ele.size() == 0 ? null : ele;
		},
		_updateBtnSize : function(){
			var btnList = this.DOM.btnBar.find("input.btn");
			var size = btnList.size();
			if(size == 0){
				return;
			};
			var w = ( 100 / size ) + "%";
			btnList.css({
				width : w
			});
			if(size == 1){
				return;
			}else if(size == 2){
				btnList.eq(1).css({
					borderLeft : 0
				});
			}else if(size > 2){
				btnList.eq(0).nextAll().css({
					borderLeft : 0
				});
			};
			
		},
		_renderBtn : function(ele, btnData){
			ele.attr({
				"data-id" : btnData.id
			}).val(btnData.text).addClass("btn").addClass(btnData.cssClass).css(btnData.css || {});
			if(btnData.disabled){
				this._disableBtn(ele);
			};
			return ele;
		},
		insertRenderBtn : function(btnData){
			return this._renderBtn($("<input type='button'>"), btnData);
		},
		upateRenderBtn : function(id, btnData){
			var ele = this.getBtnElement(id);
			if(!ele){
				return;
			};
			return this._renderBtn(ele, btnData);
			
		},
		setBtnText : function(id, text){
			var btnData = this.getBtn(id);
			if(!btnData){
				return;
			};
			btnData.text = text;
			this.getBtnElement(id).val(text);
		},
		enableBtn : function(id){
			var btnData = this.getBtn(id);
			if(btnData){
				btnData.disabled = false;
				this.getBtnElement(id).removeAttr("disabled");
			};
		},
		disableBtn : function(id){
			var btnData = this.getBtn(id);
			if(btnData){
				btnData.disabled = true;
				this._disableBtn(this.getBtnElement(id));
			};
		},
		_disableBtn : function(btn){
			btn.attr("disabled", "disabled");
		},
		
		
		_setBtn : function(id, set){
			var btn = this.getBtn(id);
			if(!btn){
				return;
			};
			btn = $.extend(btn, set);
		},
		addBtn : function(btnData){
			this._setButtons([
				btnData
			]);
		},
		_setButtons : function(list){
			var _this = this;
			$.each(list, function(i, obj){
				var btn = $.extend({}, btnSet, obj);
				if(!btn.id){
					btn.id = uid();
				};
				var tempBtn = _this.getBtn(btn.id);
				if(!tempBtn){
					_this.DOM.btnBar.append(_this.insertRenderBtn(btn));
				}else{
					_this.upateRenderBtn(btn.id, btn);
				};
				_this.buttons[btn.id] = btn;
			});
			this._updateBtnSize();
		},
		init : function(){
			var bodyEle = $("body");
			var html = render(this.set.dialogTpl, {
				index : this.index,
				dialogClassName : this.set.dialogClassName
			});
			var _this = this;
			var index = this.index;
			bodyEle.append(html);
			this.DOM.dialog = $("#fix-dialog-" + index);
			this.DOM.handle = this.DOM.dialog.find(".handle");
			this.DOM.alpha = $("#fix-dialog-alpha-" + index);
			this.DOM.dialogWrap = this.DOM.dialog.find(".fix-dialog-wrap");
			this.DOM.closeBtn = this.DOM.dialog.find(".close-btn");
			this.DOM.c = this.DOM.dialog.find(".c");
			this.DOM.btnBar = this.DOM.dialog.find(".bottom");
			if(!this.set.showHandlebar){
				this.DOM.handle.hide();
			};
			this.setTitle(this.set.title);
			this.setContent(this.set.content);
			this._setButtons(this.set.buttons);
			this.set.events.init.call(this, this);
			if(this.set.autoShow){
				this.show();
			};
			this.updateZIndex();
			this.DOM.alpha.css({
				"opacity" : this.set.alphaOpacity,
				"backgroundColor" : this.set.alphaBgColor
			}).on(tapEvtName, function(e){
				e.preventDefault();
				e.stopPropagation();
				if(_this.set.closeOnAlphaClick){
					_this._close();
				};
			});
			 
			this.DOM.closeBtn.bind("tap", function(e){
				e.preventDefault();
				e.stopPropagation();
				_this._close();
			});	
			
			
			this.DOM.btnBar.on(tapEvtName, ".btn", function(e){
				e.preventDefault();
				e.stopPropagation();
				var t = $(this);
				var id = t.attr("data-id");
				var btnData = _this.getBtn(id);
				//t.addClass(_this.set.btnActiveClass);
				//setTimeout(function(){
					//t.removeClass(_this.set.btnActiveClass);
					var rs = btnData.fn.call(_this, t, _this);
					if(rs !== false){
						_this._close();
					};
				//}, 200);
			
			}).on(touchEvents.touchstart, ".btn", function(e){
				var t = $(this);
				var h = setTimeout(function() {
					t.addClass(_this.set.btnActiveClass);
				}, 50);
				$(document).one(touchEvents.touchend, function() {
					clearTimeout(h);
					t.removeClass(_this.set.btnActiveClass);
				});
			});
		},
		setContent : function(content){
			this.content = content;
			this.DOM.c.html(this.wrapContent(content));
		},
		setTitle : function(title){
			this.title = title;
			this.DOM.handle.html(title);
		},
		
		show : function(){
			this.DOM.alpha.show();
			this.DOM.dialog.show();
		},
		hide : function(){
			var rs = this.set.events.beforehide.call(this, this);
			this.DOM.alpha.hide();
			this.DOM.dialog.hide();
			this.set.events.hide.call(this, this);			
		},
		close : function(){
			var rs = this.set.events.beforeclose.call(this, this);
			if(rs === false){
				return;
			};
			this.DOM.alpha.off().hide().remove();
			this.DOM.dialog.off().hide();
			this.DOM.dialogWrap.off();
			this.DOM.closeBtn.off();
			this.DOM.btnBar.off();
			this.DOM.dialog.find("iframe").remove();
			this.DOM.dialog.remove();
			delete DIALOG_LIST[this.id];
			this.set.events.close.call(this, this);	
			 
		},
		destroy : function(){
			this.close.apply(this, arguments);
		}
	});
	return __class__;
});

XDK.ns("FixDialog.alert", function(){
	return function(msg, close){
		close = close || function(){};
		var opt = {
			autoShow : true,
			id : "_ALERT_", 
			content : msg,
			buttons : [
				{
					id : "ok",
					text : "确定",
					fn : function(){
						return close.apply(this, arguments);
					}
				}
			]
		};
		return new FixDialog(opt);
	};

});

XDK.ns("FixDialog.confirm", function(){
	return function(msg, ok_fn, cancel_fn){
		ok_fn = ok_fn || function(){};
		cancel_fn = cancel_fn || function(){};
		var opt = {
			autoShow : true,
			id : "_CONFIRM_",  
			content : msg,
			buttons : [
				{
					id : "ok",
					text : "确定",
					fn : function(){
						return ok_fn.apply(this, arguments);
					}
				},
				{
					id : "cancel",
					text : "取消",
					fn : function(){
						return cancel_fn.apply(this, arguments);
					}
				}
			]
		};
		return new FixDialog(opt);
	};
});
