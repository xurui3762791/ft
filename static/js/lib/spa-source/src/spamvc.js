;(function(){
	if(!window.console){
		window.console = {
			log : function(){
			
			}
		};
	};
	
	/*if($.browser.msie && $.browser.version == "6.0"){
		try{document.execCommand("BackgroundImageCache",false,true)}catch(r){}
	};	
	
	/**
	 * 设置underscore模版标记
	*/

	_.templateSettings = {
		interpolate: /\<\#\=(.+?)\#\>/gim,
		evaluate: /\<\#([\s\S]+?)\#\>/gim,
		escape: /\<\#\-(.+?)\#\>/gim
	};
		
	
	/**
	 * 设置静态资源目录，以及配置require相关模块选项
	*/
	(function(){
		var CONFIG_KEY = "REQUIRE_CONFIG";
		var cfg = typeof(window[CONFIG_KEY]) == "undefined" ? {
			debug : true,
			urlVersion : (new Date()).getTime()
		} : window[CONFIG_KEY];
		var static_dir = (function(){
			var dir = null;
			var scripts = document.getElementsByTagName("script");
			var pat = /((.*)(static\/))js\/lib\/(([^\/]+\/)*)spamvc(.*)\.js/;
			for(var i = 0, l = scripts.length; i < l; i++){
				var srcipt = scripts[i];
				var src = srcipt.src;
				if(!src){
					continue;
				};
				
				var matchRs = src.match(pat);
				if(matchRs != null){
					dir = matchRs[1];
					break;
				};
			};
			return dir;
		})(); 
		if(static_dir == null){
			console.log("static_dir");
			return;
		};
		 
		var js = static_dir + "js/";	
		var lib = js + "lib/";
		var app = js + "app/";
		var style = static_dir + "css/";
		var getParam = (function(){
			var query = window.location.search != "" ? window.location.search.slice(1) : "";
			var GET = {};
			(function(){
				if(query == ""){
					return;
				};
				var arr = query.split(/&/);
				$.each(arr, function(i, v){
					if(v != ""){
						var o = v.split(/=/);
						if(o.length == 2){
							var key = o[0];
							var value = o[1];
							GET[key] = value;
						}else if(o.length == 1){
							var key = o[0];
							GET[key] = "";
						};
					};
				});
			})();
			return function(param){
				return typeof(GET[param]) != "undefined" ? GET[param] : null;
			};
		})();
		 
		 
		window._g_dir = {
			"static_dir" : static_dir,
			"js" : js,
			"lib" : lib,
			"app" : app,
			"style" : style
		};
		//console.log(cfg);
		require.config({
			map : {
			  '*' : {
				'css' : "js/lib/require-css",
				'image' : "js/lib/require-image",
				'text' : "js/lib/text-v2.0.10"
			  }
			},
			waitSeconds : 120,
			urlArgs : "_v_=" + (cfg.debug ? (new Date()).getTime() : cfg.urlVersion),
			paths : {
				"js" : js.replace(/(\/+)$/g, ""),
				"lib" : lib.replace(/(\/+)$/g, ""),
				"app" : app.replace(/(\/+)$/g, ""),
				"style" : style.replace(/(\/+)$/g, "")
			}
		});
		window._g_getParam = getParam;
		 
	
	})();
	
	//require load source list
	(function(){
	
		function requireLoad(list, loaded){
			list = typeof(list) == "string" ? [list] : list;
			loaded = loaded || function(){};
			var loadingBar = $("#loading-tip");
			loadingBar.show();
			var context = this;
			//console.log(context);
			require(list, function(){
				loadingBar.hide();
				loaded.apply(context, arguments);
			});
		};
		function changePosition(){
			var loadingBar = $("#loading-tip");		
			var top = $(window).scrollTop() + ( ($(window).innerHeight() - loadingBar[0].offsetHeight) / 2);
			loadingBar.css({
				top : top
			});
		};/*
		$(function(){
			$(window).resize(function(){
				changePosition();
			}).scroll(function(){
				changePosition();
			});
			changePosition();
		});*/
		window._g_requireLoad = requireLoad;
	})();
	
	/**
	 * @class SPAMVC - create main webApplication
	*/
	(function(){
		var APP_INDEX = -1;
		var app_object = {};
		function getApp(id){
			return typeof(app_object[id]) != "undefined" ? app_object[id] : null;
		};
		function getAppByRouterPath(routerPath, singleMode){
			singleMode = typeof(singleMode) == "undefined" ? true : singleMode; 
			var reg = new RegExp("^" + routerPath);
			var rs = [];
			for(var path in app_object){
				var app = app_object[path];
				if(reg.test(path)){
					if(singleMode){
						return app;
					};
					rs.push(app);
				};
			};
			return singleMode ? null : rs;
		};
		function addApp(id, obj){
			app_object[id] = obj;
		};
		function removeApp(id){
			if(getApp(id)){
				delete app_object[id]
			};
		};
		function getHash(){
			return ((window.location.hash || '').replace(/^#/, ''))
		};
		
		var Events = XDK.Class.create({
			_init_ : function(){
				this.eventList = {};
			},
			getEventList : function(event){
				return typeof(this.eventList[event]) !== "undefined" ? this.eventList[event] : [];
			},
			bind : function(event, func){
				this.eventList[event] = this.getEventList(event);
				this.eventList[event].push(func);
			},
			trigger : function(event){
				var targetEventList = this.getEventList(event);
				var i = 0;
				var l = targetEventList.length;
				var args = Array.prototype.slice.call(arguments, 1);
				for(; i < l; i++){
					var func = targetEventList[i];
					var rs = func.apply(this, args);
					if(rs === false){
						break;
					};
				};
			},
			unbind : function(event){
				delete this.eventList[event]; 
			}
		});
		
		var _class_ = XDK.Class.create({
			_init_ : function(opt){
				var _this = this;
				var args = Array.prototype.slice.call(arguments, 1);
				APP_INDEX += 1;
				this.appIndex = APP_INDEX;
				//布局模版路径
				this.layoutUrl = null;
				var set = $.extend({
					actionName : null,
					api : null, 
					params : {}, 
					routerObj : null, 
					path : null,
					routerPath : null,
					container : "#container",
					destroyPrevApp : true
				}, opt);
				this.set = set;
				this.actionName = set.actionName;
				this.api = set.api;
				this.params = set.params;
				this.path = set.path;
				this.routerPath = set.routerPath;
				this.routerData = (function(data){
					return {
						"action" : data[1],
						"controller" : data[0]
					};
				})(set.routerPath.split("/"));
				this.routerObj = set.routerObj;
				this.container = $(set.container);
				this.uninstallActionList = {};
				//保存前一个app的实时path
				var prevPath = this.container.attr("data-path") || null;
				this.prevPath = prevPath;
				
				//保存前一个app的初始化path
				//此app对象对应的key在对象列表里是以initPath为基准而不是prevPath
				var initPath = this.container.attr("data-init-path") || null;
				this.initPath = initPath;
				
				
				//dom树对象
				this.dom = {};
				//弹出框列表
				this.dialogList = {};
				//xhr请求列表
				this.xhrList = {};
				//obj对象类别
				this.objList = {};
			 
				this.prevAppObj = null;
				 
				//销毁前一个对象
				if(initPath){
					//销毁前缓存
					this.prevAppObj = this.getApp(this.initPath);
					if(this.set.destroyPrevApp){
						if(this.destroy(initPath) === false){
							return false;
						};
					};
				};
				this.container.attr("data-path", this.path);
				this.container.attr("data-init-path", this.path);
				this.sourcePath = this.path;
				this.sourceId = encodeURIComponent(decodeURIComponent(this.path));
				_class_.sourceId = this.sourceId;
				this.json = XDK.core.json;
				this.base64 = XDK.core.base64;
				this.arr = XDK.core.arr;
				this.str = XDK.core.str;
				this.obj = XDK.core.obj;
				_class_.baseConstructor.apply(this, arguments);
				addApp(this.path, this);
				
				this.addUninstallAction(this.actionName, function(){
					$.each(this.dialogList, function(k, dialog){
						_this.destroyDialog(k);
						
					});
					$.each(this.xhrList, function(k, xhr){
						_this.abortXHR(k);
						
					});
					$.each(this.objList, function(k, o){
						_this.uninstallObj(k);
					});
				});
				$(window).on("unload", function(){
					_this.triggerUninstallAction();
				});
				this._initForm();
			},
			require : function(){
				_g_requireLoad.apply(this, arguments);
			},
			renderOnCurrentApp : function(callback){
				callback = callback || function(){};
				if(this.isCurrentApp()){
					callback.call(this);
				};
			},
			isCurrentApp : function(){
				return _class_.sourceId == this.sourceId;
			},
			_app_object_ : app_object,
			_getApp_ : getApp,
			getApp : getApp,
			_removeApp_ : removeApp,
			removeApp : removeApp,
			_getAppByRouterPath_ : getAppByRouterPath,
			getAppByRouterPath : getAppByRouterPath,
			
			renderContainer : function(view){
				this.resetHtml(this.container, view);
			},
			getSiblingsAppList : function(){
				var list = [];
				var sourcePath = this.sourcePath;
				$.each(app_object, function(path, app){
					if(path !== sourcePath){
						list.push(app);
					};
				});
				return list;
			},
			eachSiblingsAppList : function(callback){
				callback = callback || function(){};
				var _this = this;
				var list = this.getSiblingsAppList();
				var l = list.length;
				var i = 0;
				for(; i < l; i++){
					var app = list[i];
					var rs = callback.call(app, i, app);
					if(rs === false){
						return false;
					};
				};
			},
			initInpFocus : function(){
				var id = "spamvc-blank-focus";
				var tempFocusInp = $("#" + id);
				var inp; 
				if(tempFocusInp.size() == 0){
					inp = $("<input id='spamvc-blank-focus' type='text' style='width: 10px; height: 50px; overflow: hidden; background: none repeat scroll 0% 0% transparent; border: 0; position: absolute; top: 0px;' >");
					$("body").append(inp);
				}else{
					inp = tempFocusInp;
				};
				inp.focus();
				inp.hide();	
				
			},
			resetHtml : function(dom, html){
				dom = $(dom);
				dom.html(html);
				//this.initInpFocus();	
			},
			_initForm : function(){
				var s_input = ".g-form-input"; 
				var focus_input = "g-form-input-focus";
				var s_textarea = ".g-form-textarea";
				var focus_textarea = "g-form-textarea-focus";
				$("body").on("focus", s_input, function(){
					$(this).addClass("g-form-input-focus");
				}).on("blur", s_input, function(){
					$(this).removeClass("g-form-input-focus");
				});
				
				$("body").on("focus", s_textarea, function(){
					$(this).addClass(focus_textarea);
				}).on("blur", s_textarea, function(){
					$(this).removeClass(focus_textarea);
				});
			},
			/**
			 * 销毁一个控制器实例
			 * @param {String} path - 控制器实例的path
			 * @return Boolean
			*/
			destroy : function(path){
				var app_path = path.split("~")[0];
				var o = app_path.split("/");
				var action = o[1];
				var appObj = getApp(path);
				if(appObj){
					var rs = appObj.triggerUninstallAction(action) !== false;
					if(rs){
						//appObj.container.empty();
						console.log("destroy app - " + path);
						removeApp(path);
					};
					return rs;
				};
				return true;
			},
			
			/**
			 * 向队列内注入当前事件卸载方法，可以重复添加
			 * @prarm {String} action - 控制器事件名称
			 * @param {Function} func - 卸载方法
			*/
			addUninstallAction : function(action, func){
				if(arguments.length == 1){
					this.addUninstallAction(this.actionName, action);
					return;
				};
				if(typeof(this.uninstallActionList[action]) == "undefined"){
					this.uninstallActionList[action] = [];
				};
				this.uninstallActionList[action].push(func);
			},
			/**
			 * 循环执行当前事件队列的所有方法， 当遇到返回false的方法则退出
			 * @param {String} action - 当前控制器事件名称
			 * @return Boolean 
			*/
			triggerUninstallAction : function(action){
				action = action || this.actionName;
				var funcList = this.uninstallActionList[action];
				var _this = this;
				if(typeof(this.uninstallActionList[action]) == "undefined"){
					return;
				};
				for(var i = 0, l = funcList.length; i < l; i++){
					var func = funcList[i];
					var rs = func.call(this) !== false;
					if(rs === false){
						return false;
					};
				};
				return true;
			},
			unescapeParams : function(params){
				var res = {};
				$.each(params, function(k, v){
					 
					//res[k] = unescape(v);
					res[k] = decodeURIComponent(v);
				});	
				return res;
			},
			getParam : function(paramName, isDecode){
				isDecode = typeof(isDecode) == "undefined" ? true : isDecode;
				var param = typeof(this.params[paramName]) !== "undefined" ? this.params[paramName] : null;
				if(param != null){
					if(isDecode){
						param = decodeURIComponent(param);
						//param = unescape(param);
					};
				};
				
				return param;
			},
			
			destroyDialog : function(dialog){
				if(XDK.type.is_object(dialog)){
					if(typeof(dialog.close) !== "undefined"){
						dialog.close();
					};
				}else if(XDK.type.is_string(dialog)){
					var obj = this.dialogList[dialog] || null;
					if(obj){
						console.log("destroy dialog - " + dialog);
						this.destroyDialog(obj);
						delete this.dialogList[dialog];
					};
				};
				 
			},
			setXHR : function(xhr_key, xhr_source_callback){
				this.abortXHR(xhr_key);
				this.xhrList[xhr_key] = XDK.type.is_function(xhr_source_callback) ? xhr_source_callback.call(this, this) : xhr_source_callback;
			},
			setObj : function(obj_key, obj_source_callback){
				
				this.uninstallObj(obj_key);
				this.objList[obj_key] = XDK.type.is_function(obj_source_callback) ? obj_source_callback.call(this, this) : obj_source_callback;
			},
			abortXHR : function(xhr){
				if(XDK.type.is_object(xhr)){
					xhr.abort();
				}else if(XDK.type.is_string(xhr)){
					
					var obj = this.xhrList[xhr] || null;
					if(obj){
						console.log("destroy xhr - " + xhr);
						this.abortXHR(obj);
						delete this.xhrList[xhr];
					};
				};
			},
			uninstallObj : function(o){
				
				if(XDK.type.is_object(o)){
					if(typeof(o["destroy"]) != "undefined"){
						o.destroy();
					};
				}else if(XDK.type.is_string(o)){
					var obj = this.objList[o] || null;
					if(obj){
						console.log("destroy object - " + o);
						this.uninstallObj(obj);
						delete this.objList[o];
					};
				};
				
			},
			unlogincallback : function(json){
			
			},
			_ajax : function(type, url, data, callback, unlogincallback){
				callback = callback || function(){};
				unlogincallback = unlogincallback || this.unlogincallback;
				var _this = this;
				var loadingBar = $("#loading-tip");
				loadingBar.show();
				if(type == "get"){
					data = $.extend({
						_v_ : Math.random()
					}, data);
				};
				return $.ajax({
					type : type,
					url : url,
					data : data,
					success : function(json){
						loadingBar.hide();
						if(json.code == 10001){
							unlogincallback.call(_this, json, this);
						}else{
							callback.call(_this, json, this);	
						};
					},
					error : function(a, b){
						loadingBar.hide(); 
						console.log(JSON.stringify(a));
						//alert(JSON.stringify(a));
					},
					dataType : "json"	
				});
			},
			getData : function(url, data, callback){	
				return this._ajax("get", url, data, callback);	
			},
			postData : function(url, data, callback){
				return this._ajax("post", url, data, callback);	
			},
			
			/**
			 * 容器内插入iframe 跳转
			 * @param {String} url - iframe 地址,默认会自带 _path_ 参数，标识来源应用程序sourceId
			*/
			iframeTo : function(url){
				var url = this.getURL(url, {
					_path_ : this.sourceId,
					_ : Math.random()
				});
				 
				var p = $("<div class='lay-main-iframe main-iframe'>");
				var iframe = $("<iframe frameborder='0' srcolling='auto' data-sourceid='" + this.sourceId + "'>").attr({
					src : url,
					width : "100%",
					height : "100%"
					
				});
				this.container.append(p);
				p.append(iframe);
				this.addUninstallAction(function(){
					iframe.attr("src", "about:blank").remove();
				});			
			
			},
			
			/**
			 * 更改hash路径，同时绑定router对象的hashChangeEvent
			*/
			redirect  : function(){
				this.routerObj.navigate(this.createURL.apply(this, arguments), {
					trigger : true
				});
			},
			
			/**
			 * 更改hash路径，但是不绑定router对象的hashChangeEvent
			*/
			updateHash : function(){
				this.routerObj.navigate(this.createURL.apply(this, arguments), {
					trigger : false
				});
				this.updateParams();
			},
			
			updateHashExtendsSelfParams : function(path, params){
				params = $.extend({}, this.unescapeParams(this.params), params);
				this.updateHash(path, params);
			},
			updateParams : function(){
				var hash = getHash();
				var data = hash.split(/~/);
				var temp = {};
				if(data.length == 2){
					var query2Arr = data[1].split(/&/);
					var l = query2Arr.length;
					var i = 0;
					for(; i < l; i++){
						var o = query2Arr[i].split(/=/);
						var key = o[0];
						var v = o.length == 2 ? o[1] : "";
						//temp[key] = escape(unescape(v));
						temp[key] = encodeURIComponent(decodeURIComponent(v));
					};
				};
				this.params = $.extend({}, this.params, temp);
				this.path = hash;
				this.container.attr("data-path", this.path);
			},
			/**
			 * 创建URL
			 * @param path - 路径
			 * @param {Object|String} params - 传递参数 
			 * @return {Boolean}
			 * @example this.createURL("a/b", "id=1&vid=2") => a/b~id=1&vid=2;
			 * @example this.createURL("a/b", {id : 1, vid : 2}) =>	a/b~id=1&vid=2;
			*/
			createURL : function(path, params, isEncodeParams){
				var len = arguments.length;
				params = params || "";
				isEncodeParams = typeof(isEncodeParams) == "undefined" ? true : isEncodeParams;
				if(len == 1){
					return path;
				};
				if(typeof(params) == "string"){
					if(params == ""){
						return path;
					};
					return path + "~" + params;
				}
				if($.isPlainObject(params)){
					var queryList = [];
					$.each(params, function(k, v){
						//queryList.push(k + "=" + (isEncodeParams ? escape(v) : v) );
						queryList.push(k + "=" + (isEncodeParams ? encodeURIComponent(v) : v) );
					});
					var query = queryList.join("&");
					return query !== "" ? path + "~" + query : path;
				};
				
			},
			getURL : function(url, param_data){
				param_data = param_data || {};
				var preFixParam = {};
				var url_explode = url.split("?");
				var _url = url_explode.length > 1 ? url_explode[0] : url; 
				if(url_explode.length > 1){
					var _params = url_explode[1];
					var _arr = _params.split("&");
					$.each(_arr, function(i, v){
						
						var _o = v.split("=");
						preFixParam[_o[0]] = _o[1];
					});
				};
				$.each(preFixParam, function(k, v){
					if(typeof(param_data[k]) == "undefined"){
						param_data[k] = v;
					};
				});
				
				var params = "";
				$.each(param_data, function(key, value){
					params += key + "=" + value + "&";
				});
				if(params != ""){
					params = params.slice(0, -1);
				};
				
				return (params != "") ? (_url + "?" + params) :  _url;
			},
			form2json : function(form){
				 
				var data= {};
				form.find("input[type=hidden]").each(function(){
					var t = $(this);
					var key = t.attr("name");
					var value = t.val();
					data[key] = value;
				});
				return data;
			},
			select2json : function(select, ext){
				select = $(select);
				ext = $.extend({
					name_key : "name",
					value_key : "value",
					attr_list : []
				}, ext);
				var data = [];
				select.find("option").each(function(){
					var t = $(this);
					var o = {};
					if(this.selected){
						o.selected = true;
					};
					o[ext.name_key] = t.html();
					o[ext.value_key] = t.attr("value") || t.html();
					$.each(ext.attr_list, function(i, b){
						if(typeof(t.attr(b.option_attr)) != "undefined"){
							if(b.type == "boolean"){
								o[b.json_attr] = t.attr(b.option_attr) == "true" ? true : false;
							}else{
								o[b.json_attr] = t.attr(b.option_attr);
							};
						};
					});
					data.push(o);
				});
				return data;
			},
			
			json2select : function(data){
				var options = "";
				var pat = /^data\-/;
				$.each(data, function(i, o){
					var selectedAttr = ( typeof(o.selected) != "undefined" && o.selected === true ) ? "selected='selected'" : "";
					var dataAttrList = [];
					$.each(o, function(attr, value){
						if(pat.test(attr)){
							dataAttrList.push(attr + "='" + value + "'");
						};
					});
					
					options += "<option " + dataAttrList.join("  ") + selectedAttr + " value='" + (typeof(o.id) == "undefined" ? o.name : o.id) + "'>" + o.name + "</option>";
				});
				return options;
			},

			render : function(tpl_id, data){
				data = data || {};
				data.self = this;
				var tplNode = this.container.find("[data-tpl='" + tpl_id + "']");
				if(tplNode.size() == 0){
					tplNode = this.container.find("#" + tpl_id);
				}
				return _class_.render.apply(_class_, [tplNode, data]);
			},
			/**
			 * 渲染模板，需要underscore支持，调用_.template方法
			 * @param {String} tpl_id - 模板id，此项必填
			 * @param {Object} data - 数据对象，此项可选
			 * @return {String} || null
			*/
			_render_ : function(tpl_id, data){
				data = data || {};
				var script;
				if(XDK.type.is_string(tpl_id)){
					script = $("#" + tpl_id);
				}else{
					script = $(tpl_id);
				};
				return script.size() == 0 ? null : _.template(script.html(), data);
			},
			render2obj : function(tpl_id){
				var script;
				if(XDK.type.is_string(tpl_id)){
					script = $("#" + tpl_id);
				}else{
					script = $(tpl_id);
				};	
				return script.size() == 0 ? null : eval("(" + script.html() + ")");
			},
			render2Obj : function(){
				return this.render2obj.apply(this, arguments)
			},
			getUrlFromLink : function(linkObj){
				linkObj = $(linkObj);
				return this.getUrlFromHref(linkObj.attr("href"));
			},
			getUrlFromHref : function(href){
				return href.replace(/^((.*#+))/g, "");	
			},
			
			/**
			 * @param {String} url - 当前模板路径
			 * @param {Function} loaded
			*/
			view : function(url, loaded, options){
				loaded = loaded || function(){};
				var _this = this;
				options = $.extend({
					//布局模板数据对象
					layout_data : {},
					//公共资源
					require_source : []
				}, options);
				var pat = /^(text\!)/;
				options.layout_url = this.layoutUrl;
				if(options.layout_url){
					if(!pat.test(options.layout_url)){
						options.layout_url = "text!" + options.layout_url;
					};
				};
				
				if(!pat.test(url)){
					url = "text!" + url;
				};
				
				//加载当前视图模版
				function loadContent(callback){
					callback = callback || function(){};
					_g_requireLoad([
						url
					], function(content){
						callback.call(_this, content);
					});
				};
				_g_requireLoad(options.require_source, function(){
					loadContent(function(content){
						if(options.layout_url === null){
							_this.renderOnCurrentApp(function(){
								loaded.call(_this, content);
							});
						}else{
							_g_requireLoad([
								options.layout_url
							], function(layout){
								options.layout_data.__content__ = content;
								options.layout_data.self = _this;
								layout = _.template(layout, options.layout_data);
								_this.renderOnCurrentApp(function(){
									loaded.call(_this, layout);
								});
							});
						}
					});
				});
			},
			
			/**
			 * 返回前一页
			 * @param {String} prevPath
			 
			*/
			back : function(routerPath){
				var pat = new RegExp("^" + routerPath);
				this.redirect((this.prevPath && pat.test(this.prevPath)) ? this.prevPath : routerPath);
			}
	
		}, Events);
		window.SPAMVC = _class_;
	})();
	
	/**
	 * @class CRouter
	*/
	(function(){
		
		function cls(opt){
			var set = $.extend({
				defaultRoute : "",
				routes : {
				},
				routerAction : {
					r : function(router){
						 
					}
				}
			}, opt);
			
			var routerConfig = $.extend({}, {
				routes : set.routes
			}, set.routerAction);
			var clsRouter = Backbone.Router.extend(routerConfig);
			this.routerObj = new clsRouter();
			Backbone.history.start();
			Backbone.history.navigate(set.defaultRoute, {trigger:true});
		};
		window.CRouter = cls;
	})();
})();
