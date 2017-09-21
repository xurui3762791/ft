/**
 * @actionClass feitu/index/index - 首页
*/
define("app/feitu/controller/index/index", [], function(){
	var _class_ = XDK.Class.create({
		_init_ : function(){
			_class_.baseConstructor.apply(this, arguments);
			this.title = "飞兔福袋";
			this.prevUrl = null;
			this.busninessTender = [];
		},
		
		indexAction : function(){
			_class_.superClass.indexAction.apply(this, arguments);
			this.getInitData(function(){
				this.view("view/index/index.html", function(view){
					this.renderContainer(view);
					this.container.find(".page").html(this.render("tpl-main-view"));
				
				});
			});

		},	
		getInitData : function(callBack){
			var router = this.getApiRouter("Fudai/index");
			this.setXHR("Fudai/index", function(){
				return this.postData(router.url, router.data, function(json){
					if(json.errcode == 0){
						this.businessTenderList = json.data;
						console.log(this.businessTenderList)
						
					}
					
					callBack.call(this);
				});
			});
		}
		
	}, AppController);
	return _class_;
}); 

/**
 * @actionClass feitu/index/earnradish - 赚取萝卜
*/
define("app/feitu/controller/index/earnradish", [], function(){
	var _class_ = XDK.Class.create({
		_init_ : function(){
			_class_.baseConstructor.apply(this, arguments);
			this.title = "赚取萝卜";
			this.prevUrl = null;
			this.busninessTender = [];
		},
		
		indexAction : function(){
			_class_.superClass.indexAction.apply(this, arguments);
			this.view("view/index/earnradish.html", function(view){
					this.renderContainer(view);
					this.container.find(".page").html(this.render("tpl-main-view"));
				
			});

		},	
		
		
	}, AppController);
	return _class_;
}); 


/**
 * @actionClass feitu/index/about - 关于福袋
*/
define("app/feitu/controller/index/about", [], function(){
	var _class_ = XDK.Class.create({
		_init_ : function(){
			_class_.baseConstructor.apply(this, arguments);
			this.title = "关于福袋";
			this.prevUrl = null;
			this.busninessTender = [];
		},
		
		indexAction : function(){
			_class_.superClass.indexAction.apply(this, arguments);
			this.view("view/index/about.html", function(view){
					this.renderContainer(view);
					this.container.find(".page").html(this.render("tpl-main-view"));
				
			});

		},	
		
		
	}, AppController);
	return _class_;
}); 


/**
 * @actionClass feitu/index/about - 关联帐号
*/
define("app/feitu/controller/index/associatedaccount", [], function(){
	var _class_ = XDK.Class.create({
		_init_ : function(){
			_class_.baseConstructor.apply(this, arguments);
			this.title = "关联帐号";
			this.prevUrl = null;
			this.busninessTender = [];
		},
		indexAction : function(){
			_class_.superClass.indexAction.apply(this, arguments);
			this.getInitData(function(){
				this.view("view/index/associatedaccount.html", function(view){
					this.renderContainer(view);
					this.container.find(".page").html(this.render("tpl-main-view"));
				
				});
			});

		},	
		getInitData : function(callBack){
			var router = this.getApiRouter("Fudai/associatedAccount");
			this.setXHR("Fudai/associatedAccount", function(){
				return this.postData(router.url, router.data, function(json){
					if(json.errcode == 0){

						this.associatedAccount = json.data;
						this.associated = json;
						console.log(this.associatedAccount)
						
					}
					
					callBack.call(this);
				});
			});
		}
		
		
	}, AppController);
	return _class_;
}); 


/**
 * @actionClass feitu/index/radishshop - 萝卜商店
*/
define("app/feitu/controller/index/radishshop", [], function(){
	var _class_ = XDK.Class.create({
		_init_ : function(){
			_class_.baseConstructor.apply(this, arguments);
			this.title = "萝卜商店";
			this.prevUrl = null;
			this.busninessTender = [];
		},
		indexAction : function(){
			var _this = this;
			_class_.superClass.indexAction.apply(this, arguments);
			this.getInitData(function(){
				this.view("view/index/radishshop.html", function(view){
					this.renderContainer(view);
					this.container.find(".page").html(this.render("tpl-main-view"));
				
				});

				this.container.on("tap", ".goods", function(e){
					e.preventDefault();
					
					$(this).each(function(){
							var goodsid = $(this).attr("data-id");

							var router = _this.getApiRouter("Fudai/exchange",{
								goods_id : goodsid
							});
							_this.setXHR("Fudai/exchange", function(){
								return this.postData(router.url, router.data, function(json){
									console.log(json)
									if(json.errcode == 0){
										this.exchange = json;
										this.container.find(".pppp").html(this.render("newTender"));
										
									}
									
								});
							});
					})
				})

				this.container.on("tap", ".exchange", function(e){
						$(".bagdliongbox").remove();
				})
			});

		},	
		getInitData : function(callBack){
			var router = this.getApiRouter("Fudai/luoboList");
			this.setXHR("Fudai/luoboList", function(){
				return this.postData(router.url, router.data, function(json){
					if(json.errcode == 0){
						this.luoboList = json.data;
						console.log(this.luoboList)
					}
					
					callBack.call(this);
				});
			});
		}
		
		
	}, AppController);
	return _class_;
}); 



/**
 * @actionClass feitu/index/detail - 萝卜商店
*/
define("app/feitu/controller/index/detail", [], function(){
	var _class_ = XDK.Class.create({
		_init_ : function(){
			_class_.baseConstructor.apply(this, arguments);
			this.title = "萝卜商店";
			this.prevUrl = null;
			this.busninessTender = [];
		},
		indexAction : function(){
			var _this = this;
			_class_.superClass.indexAction.apply(this, arguments);
			this.getInitData(function(){
				this.view("view/index/detail.html", function(view){
					this.renderContainer(view);
					this.container.find(".page").html(this.render("tpl-main-view"));
				
				});

				
			});

		},	
		getInitData : function(callBack){
			var router = this.getApiRouter("Fudai/exchangeInfo");
			this.setXHR("Fudai/exchangeInfo", function(){
				return this.postData(router.url, router.data, function(json){
					if(json.errcode == 0){
						this.exchangeInfo = json.data;
						console.log(this.luoboList)
					}
					
					callBack.call(this);
				});
			});
		}
		
		
	}, AppController);
	return _class_;
}); 










