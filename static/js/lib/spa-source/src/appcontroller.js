/**
 * @class AppController extends {Class} SPAController - webApp主控制器
*/
XDK.ns("AppController", function(){
	var TOKEN_KEY = "userData";
	var SECRET = "GDgLwwdK270Qj1w4";
	//接口路径映射
	
	function getString(str){
		 
		var result = "";  
		for (var i = 0; i < str.length; i++) {
			var s = str.charCodeAt(i); 
			if ( s == 12288){ 
				result += String.fromCharCode(32);
			} else if (s > 65280 && s < 65375){
				result += String.fromCharCode(str.charCodeAt(i) - 65248);
			}else{
				result += String.fromCharCode(str.charCodeAt(i));
			}
		}	
		return result;
	}
	
	 
	
	//接口域名配置
	var apiDomain = {
		//前端静态环境
		// "LOCAL" : "api",
		//线上环境
		//"ONLINE" : "http://120.27.156.30",
		 "ONLINE" : "http://demo.feitu360.com/api/Frontend/",

	};
	// var STATUS_MAP = {
	// 	"1" : "抢购中",
	// 	"2" : "抢购中",
	// 	"3" : "满标",
	// 	"4" : "还款中",
	// 	"5" : "已还款"
	// };
	//不支持本地存在，建立一个全局js对象缓存数据，刷新改缓存为空。
	var CACHE = {};
	var storage = !window.localStorage ? {
		removeItem : function(key){
			delete CACHE[key];
		},
		setItem : function(key, value){
			CACHE[key] = value;
		},
		getItem : function(key){
			return typeof(CACHE[key]) == "undefined" ? null : CACHE[key];
		}
	} : window.localStorage;
	function getRouerPath(path){
		return typeof(routerPathMap[path]) == "undefined" ? 0 : routerPathMap[path];
	}
	
	function sign(param){
		var secret = SECRET;
		var source;
		var signStr;
		// 对参数名进行字典排序  
		var array = new Array();
		for (var key in param) {
			array.push(key);
		}
		array.sort();

		// 拼接有序的参数名-值串  
		var paramArray = [];
		for (var index in array) {
			var key = array[index];
			paramArray.push(key + "=" + param[key]);
		}
		 
		source = paramArray.join("&") + secret;
		signStr = md5(source);
		return signStr;
	}
	
	function getSignParam(param){
		// param._t = getTime();
		// var s = sign(param);
		// param._s = s;	
		return param;
	}
	
	function dateFormat(dateObj, fmt) {
		var o = {
			"M+": dateObj.getMonth() + 1, //月份 
			"d+": dateObj.getDate(), //日 
			"h+": dateObj.getHours(), //小时 
			"m+": dateObj.getMinutes(), //分 
			"s+": dateObj.getSeconds(), //秒 
			"q+": Math.floor((dateObj.getMonth() + 3) / 3), //季度 
			"S": dateObj.getMilliseconds() //毫秒 
		};
		if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (dateObj.getFullYear() + "").substr(4 - RegExp.$1.length));
		for (var k in o)
		if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		return fmt;
	}
	
	function getHKDate(investDate, investDays){
		if(typeof(moment) == "undefined"){
			console.log("undefined moment js");
			return null;
		}
		return moment(investDate, "YYYY-MM-DD").add(investDays + 1, "days").format("YYYY-MM-DD");
	}
	
	function getTime(){
		return dateFormat((new Date()), "yyyy-MM-dd hh:mm:ss");
	}	
	
	var __class__ = XDK.Class.create({
		_init_ : function(opt){
			__class__.baseConstructor.apply(this, arguments);
			this.apiDomain = apiDomain;
			 
			this.layoutUrl = "view/layout.html"; 
			this.secret = SECRET;
			//是否显示底部菜单
			this.showFooterMenu = true;
			//是否显示头部handle
			this.showHeader = true;
			this.statusBarStyle = "red";
			//头部handle标题
			this.title = "小狗钱钱";
			//头部返回按钮地址
			this.prevUrl = this.prevPath || "index/index";
			this.pageUrl = __class__.getPageUrl();
			this.userData = this.token2data();
			this.userId = this.getUserId();
			this.storage = storage;
			this.userAccount = null;
			this.alertMsgTimer = null;
			// this.hmtPush();
		},
		//添加api
		addApiOpt : function(path, opt){
			routerPathMap[path] = opt;
		},
		strSlice : function(str, len, isDot){
			var n = len * 2;
			var r = /[^\x00-\xff]/g;    
			isDot = typeof(isDot) == "undefined" ? false : isDot;
			if(str.replace(r, "mm").length <= n){
				 return str;
			};   
			var m = Math.floor(n/2);   
			for(var i = m; i < str.length; i++) {    
				 if(str.substr(0, i).replace(r, "mm").length >= n) {    
					return str.substr(0, i) + (isDot ? "..." : "") ;    
				 }else{
					 return str; 
				 }
			}
			
			
		},
		
		loadMobiscrollSource : function(callBack){
			this.require([
				"css!lib/mobiscroll/mobiscroll",
				"lib/mobiscroll/mobiscroll"
			], function(){
				callBack.call(this);
			});
		},
		// hmtPush : function(path){
		// 	// path = "/index.html?router=" + ( encodeURIComponent(decodeURIComponent(path || this.path)));
		// 	// _hmt.push(['_setAccount', '38eeaec8b498d766cccb9788d5407171']);
		// 	// _hmt.push(['_trackPageview', path]);
		// 	console.log('_trackPageview - ', path);
		// },
		// updateHashExtendsSelfParams : function(){
		// 	__class__.superClass.updateHashExtendsSelfParams.apply(this, arguments);
		// 	this.hmtPush();
		// },
		stopMsgTimer : function(){
			if(this.alertMsgTimer === null){
				return;
			}
			clearTimeout(this.alertMsgTimer);
			this.alertMsgTimer = null;
		},
		alertMsg : function(msg){
			var _this = this;
			var msgWraper = this.getDomById("msgWraper");
			msgWraper.siblings().hide();
			msgWraper.show().text(msg).parents(".status-bar").addClass("status-bar-error");
			this.stopMsgTimer();
			this.alertMsgTimer = setTimeout(function(){
				_this.hideMsg();
			}, 3000);
		},
		hideMsg : function(){
			var msgWraper = this.getDomById("msgWraper");
			msgWraper.stop();
			msgWraper.hide().parents(".status-bar").removeClass("status-bar-error");
			msgWraper.siblings().show();
		},	
		getHKDate  : getHKDate,
		getMaxInvestMoney : function(amount, hasInvestMoney, max_invest_money){
			var v1 = amount - hasInvestMoney;
			var rs = Math.min(v1, max_invest_money);
			console.log("amount", amount);
			console.log("hasInvestMoney", hasInvestMoney);
			console.log("max_invest_money", max_invest_money);
			console.log("rs", rs);
			return max_invest_money == 0 ? v1 : rs;
		},
		getStatusText : function(status){
			return typeof(STATUS_MAP[status]) == "undefined" ? "未知状态" : STATUS_MAP[status];
		},
		getMinInvestMoney : function(tenderType){
			var minInvestMoney = null;
			if(tenderType == 1){
				minInvestMoney = 50;
			}else if(tenderType == 2){
				minInvestMoney = 1000;
			}else if(tenderType == 5){
				minInvestMoney = 50;
			}else if(tenderType == 6){
				minInvestMoney = 200;
			}	
			return minInvestMoney;
		},
		setUserAccountData : function(success){
			this.getUserAccountData(function(json){
				this.userAccount = json;
				success.call(this);
				
			});
		},
		getUserAccountData : function(success){
			if(!this.userId){
				success.call(this, null);
				return;
			};
			var router = this.getApiRouter("user/accountData", {
				id : this.userId
			});
			this.setXHR("user/accountData", function(){
				return this.postData(router.url, router.data, function(json){
					if(json.error == -1){
						success.call(this, json);
					}else{
						alert(json.msg);
					}
				});
			});
		},
		realNameFormat : function(realName){
			
			return realName.replace(/^(.+)(.{1})$/, function(s, s1, s2){
				var l = s1.length;
				var rs = "";
				for(var i = 0; i < l; i++){
				  rs += "*";
				}
				rs += s2;
				return rs;
			});
		 
		},
		getString  : function(){
			return getString.apply(this, arguments);
		},
		getBankData : function(callBack){
			if(!this.userId){
				callBack.call(this, null);
				return;
			};
			var router = this.getApiRouter("user/bank", {
				id : this.userId
			});
			this.setXHR("user/bank", function(){
				return this.postData(router.url, router.data, function(json){
					callBack.call(this, json.error == -1 ? json : null);
				});
			});
		},
		token2data : function(){
			return this.isLogin() ? JSON.parse(this.getToken()) : null;
		},
		getUserId : function(){
			var data = this.token2data();
			return data ? data.id : null;
		},
		_getToken_ : function(){
			return storage.getItem(TOKEN_KEY);
		},
		getToken : function(){
			return __class__.getToken.apply(this, arguments);
		},
		_setToken_ : function(token){
			storage.setItem(TOKEN_KEY, token);
		},
		setToken : function(){
			__class__.setToken.apply(this, arguments);
		},
		_deleteToken_ : function(){
			storage.removeItem(TOKEN_KEY);
		},
		deleteToken : function(){
			__class__.deleteToken.apply(this, arguments);
			console.log("token 已删除", "getToken:", this.getToken());
		},
		_getSignParam_ : getSignParam,
		_getTime_ : getTime,
		_sign_ : sign,
		_getRouerPath_: getRouerPath,
		/**
		 * 获取api接口地址和参数对象
		*/
		_getApiRouter_ : function(path, data, mode){
			// data = $.extend(data, {
			// 	OPT : __class__.getRouerPath(path)
			// });
			mode = mode || APP_CONFIG.mode;
			data = __class__.getSignParam(data);
			var url = "";
			if(APP_CONFIG.mode == "LOCAL"){
				
			}
			return {
				url : ( mode == "LOCAL" || /^LOCAL_CORS/.test(mode)) ?  apiDomain[mode] + "/" + path + ".php" : apiDomain[mode]  + path,
				data : data
			};
		},
		
		getApiRouter : function(){
			return __class__.getApiRouter.apply(__class__, arguments);
		},
		showLoadingBar : function(){
			$("#loading-tip").show();
		},
		hideLoadingBar : function(){
			$("#loading-tip").hide();
		},
		
		_ajax : function(type, url, data, callback, unlogincallback, showLoadingBar){
			callback = callback || function(){};
			unlogincallback = unlogincallback || this.unlogincallback;
			showLoadingBar = typeof(showLoadingBar) == "undefined" ?  true : showLoadingBar;
			var _this = this;
			var loadingBar = $("#loading-tip");
			if(showLoadingBar){
				_this.showLoadingBar();
			}
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
					if(showLoadingBar){
						_this.hideLoadingBar();
					}
					if(json.error == -1000){
						_this.deleteToken();
						unlogincallback.call(_this, json, this);
					}else{
						callback.call(_this, json, this);	
					};
				},
				error : function(a, b){
					if(showLoadingBar){
						_this.hideLoadingBar();
					}
					console.log(JSON.stringify(a));
					//alert(JSON.stringify(a));
				},
				dataType : "json"	
			});
		},
		getData : function(){
			var args = Array.prototype.slice.call(arguments);
			args.unshift("get");
			return this._ajax.apply(this, args);
		},
		postData : function(){
			var args = Array.prototype.slice.call(arguments);
			args.unshift("post");
			return this._ajax.apply(this, args);
		},
		getSignParam : function(){
			return __class__.getSignParam.apply(this, arguments);
		},
		getTime : function(){
			return __class__.getTime.apply(this, arguments);
		},
		sign : function(){
			return __class__.sign.apply(this, arguments);
		},
		getRouerPath : function(){
			return __class__.getRouerPath.apply(this, arguments);
		},
		
		_getPageUrl_ : function(){
			return window.location.href.replace(/#(.*)$/g, "");
		},
		scrollToTop : function(){
			$("body,html").scrollTop(0);
		},
		indexAction : function(){
			var _this = this;
			__class__.superClass.indexAction.apply(this, arguments);
			this.scrollToTop();
			this.container.on("click", "[data-act='exit']", function(e){
				e.preventDefault();
				_this.exit();
			}).on("blur", "input[type='number'], input[type='tel']", function(){
				this.value = _this.getString(this.value);
			});

			$("body").on("touchstart.defaultTouch", "[g-act-tap]", function (e) {
				 
				$(this).addClass("g-act-taped");
			}).on("touchend.defaultTouch touchcancel.defaultTouch", "[g-act-tap]", function(e){
				$(this).removeClass("g-act-taped");
			});  
		
			
			this.addUninstallAction(function(){
				console.log("clear msgTimer");
				this.stopMsgTimer();
				$("body").off("touchstart.defaultTouch touchend.defaultTouch touchcancel.defaultTouch");
				 
			});
			
		},
		exit : function(){
			this.deleteToken();
			this.redirect("index/index", {t : (new Date()).getTime()});
		},
		
		//根据模版字符串渲染组件
		renderWidget : function(tplString, data){
			data = data || {};
			data.self = this;
			return _.template(tplString, data);
		},
		//渲染url组件
		renderWidgetByUrl : function(tplUrl, data, loaded){
			data = data || {};
			loaded = loaded || function(){};
			this.require("text!" + tplUrl, function(tplString){
				loaded.call(this, this.renderWidget(tplString, data));
			});
		},
		 
		/**
		 * 判断是否登录
		 * @return {Boolean}
		*/
		isLogin : function(){
			return this.getToken() !== null;
		},
		/**
		 * 通过客户端的TOKEN_COOKIE对用户是否登录监听回调
		 * @param {Function} login_callback - 已登录回调 
		 * @param {Function} unlogin_callback - 未登录回调 
		*/
		loginListener : function(login_callback, unlogin_callback){
			var _this = this;
			login_callback = login_callback || function(){};
			unlogin_callback = unlogin_callback || function(){
				_this.goLogin();
			};	
			if(this.isLogin()){
				login_callback.call(this, this.userData);
			}else{
				unlogin_callback.call(this);
			}
		},
		/**
		 * 前往登录页面
		*/
		goLogin : function(){
			this.redirect("user/login");
		},
		
		/**
		 * ajax请求为未登录的code的回调函数
		*/
		unlogincallback : function(){
			this.goLogin();
		},
		redirectPrev : function(){
			if(this.prevPath){
				this.redirect(this.prevPath);
			}else{
				window.location.href = "/";
			}
		}
	}, SPAController);
	return __class__;
});
