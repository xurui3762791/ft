/**
 * @class SPAController extends {Class} SPAMVC
*/
;(function(){

	function htmlspecialchars(string, quote_style, charset, double_encode) {
		var optTemp = 0,
			i = 0,
			noquotes = false;
		if (typeof quote_style === 'undefined' || quote_style === null) {
			quote_style = 2
		}
		string = string.toString();
		if (double_encode !== false) {
			string = string.replace(/&/g, '&amp;')
		}
		string = string.replace(/</g, '&lt;').replace(/>/g, '&gt;');
		var OPTS = {
			'ENT_NOQUOTES': 0,
			'ENT_HTML_QUOTE_SINGLE': 1,
			'ENT_HTML_QUOTE_DOUBLE': 2,
			'ENT_COMPAT': 2,
			'ENT_QUOTES': 3,
			'ENT_IGNORE': 4
		};
		if (quote_style === 0) {
			noquotes = true
		}
		if (typeof quote_style !== 'number') {
			quote_style = [].concat(quote_style);
			for (i = 0; i < quote_style.length; i++) {
				if (OPTS[quote_style[i]] === 0) {
					noquotes = true
				} else if (OPTS[quote_style[i]]) {
					optTemp = optTemp | OPTS[quote_style[i]]
				}
			}
			quote_style = optTemp
		}
		if (quote_style & OPTS.ENT_HTML_QUOTE_SINGLE) {
			string = string.replace(/'/g, '&#039;')
		}
		if (!noquotes) {
			string = string.replace(/"/g, '&quot;')
		}
		return string
	};
	
	
	
	var instanceIndex = 0;
	var __class__ = XDK.Class.create({
	
		/**
		 * 类构造函数，子类继承时调用
		*/
		_init_ : function(opt){
			var _this = this;
			instanceIndex += 1;
			this.instanceIndex = instanceIndex;
			this.module = __class__.module;
			this.config = opt.config;
			__class__.baseConstructor.apply(this, arguments);
			this.pageId = this.routerPath.replace(/\//g, "-") + "-" + this.appIndex;
			//解绑事件
			this.addUninstallAction(function(){
				this.container.off();	
				console.log("container event off");
			});			
		},
		
		/**
		 * RIAController.createWebApp();
		 * 静态方法，dom初始化执行
		*/
		_createWebApp_ : function(opt){
			
			var args = arguments;
			var domain = XDK.core.router.getDomain(); 
			var _this = this;
			opt = $.extend({
				defaultRoute : null,
				module : null,
				API : {},
				initEmptyRoute : "index/index"
			}, opt);
			opt.API = $.extend({}, opt.API);
			var tempRouterList = opt.initEmptyRoute.split(/\//);
			var initEmptyRouter = {
				c : tempRouterList[0],
				r : tempRouterList[1]
			};
			if(!opt.module){
				console.log("opt.module cannot null");
				return;	
			};
			this.module = opt.module;
			this.opt = opt;
			this.router = new CRouter({
				defaultRoute : opt.defaultRoute,
				routes : {
					"" : "parse",
					":c/:r" : "parse"
				},
				routerAction : {
					parse : function(c, r){
						if(!c){
							c = initEmptyRouter.c;
							r = initEmptyRouter.r;	
						};
						var _this2 = this;
						var data = r.split(/~/);
						var action = data[0];
						var params = {};
						if(data.length == 2){
							var query2Arr = data[1].split(/&/);
							var l = query2Arr.length;
							var i = 0;
							for(; i < l; i++){
								var o = query2Arr[i].split(/=/);
								var key = o[0];
								var v = o.length == 2 ? o[1] : "";
								params[key] = encodeURIComponent(decodeURIComponent(v));
							};
						};
						var cacheHash = window.location.hash;
						_g_requireLoad(["app/" + _this.module + "/controller/" + c + "/" + action], function(controller){
							var newHash = window.location.hash;
							if(newHash != cacheHash){
								return;
							};
							var hash = newHash.replace(/^(#+)/g, "");
							var path = hash.replace(/~(.*)$/g, "");
							var routerPath = c + "/" + action;
							var app = new controller({
								actionName : action,
								api : opt.API[c],
								params : params, 
								routerObj : _this2, 
								path : c + "/" + r,
								routerPath : routerPath,
								destroyPrevApp : true,
								config : opt,
								container : "#main-container"
							});
							app.actionName = action;
							var f = app["indexAction"];
							f && f.apply(app, args);
							 
						});
					}
				}
			});
		},
		
		domId : function(id){
			return this.pageId + "-" + id;
		},
		getDomById : function(id){
			return $("#" + this.domId(id));
		},
		disableBtn : function(btn){
			btn = $(btn);
			var cls = "btn-item-disabled";
			if(btn.attr("data-disabled")){
				return false;
			};
			btn.addClass(cls).attr("data-disabled", "disabled").attr("disabled", "disabled");
			return true;
		},
		
		removeDisabledBtn : function(btn){
			btn = $(btn);
			var cls = "btn-item-disabled";
			btn.removeClass(cls).removeAttr("data-disabled").removeAttr("disabled");
		},
		
		htmlspecialchars : htmlspecialchars,
		unlogincallback : function(json){
			alert("请先登录");
			return;
		},
		getFormData : function(form){
			form = $(form);
			if(typeof(form2js) == "undefined"){
				console.log("undefined form2js");
				return false;
			};
			if(form.size() == 0){
				console.log("undefined form");
				return false;
			};
			var _form = form[0];
			//console.log(_form);
			return form2js(_form, ".", false, function(){}, false, true);
		},
		indexAction : function(){
			var _this = this;
			this.container.on("click", "[data-g-act]", function(e){
				e.preventDefault();
				var act = $(this).attr("data-g-act");
				if(act == "reload"){
					_this.reload();
				}else if(act == "back"){
					_this.back();
				};
			});
			 
			
			
		},
		//重新加载某个tab
		reload : function(routerPath, params){
			var isCurrent = arguments.length == 0;
			var url = this.createURL.apply(this, arguments);
			routerPath = isCurrent ? this.path : url;
			var app_path = routerPath.replace(/\~.*$/g, "");
			var o = app_path.split("/");
			var c = o[0];
			var action = o[1];
			console.log(routerPath + " - " + app_path);
			//找到该path的app对象
			var appObj = this.getAppByRouterPath(app_path);
			console.log("find routerPath app -" + app_path, appObj);
			if(appObj){
				var rs = appObj.triggerUninstallAction(action) !== false;
				console.log(rs);
				if(rs){
					appObj.indexAction();
				};
			}else{
				this.redirect(url);
			};
		}
	}, SPAMVC);
	XDK.ns("SPAController", function(){
		return __class__;
	});
})();	
