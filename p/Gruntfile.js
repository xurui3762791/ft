  module.exports = function(grunt) {
		function getFile(f){
			return "static/js/lib/spa-source/src/" + f + ".js";
		}
        grunt.initConfig({
            pkg: grunt.file.readJSON('package.json'),    
            
            uglify : {
                options: {
                        banner: '/*! feitu-ui -  <%= grunt.template.today("yyyy-mm-dd") %> */\n',//添加banner
                        mangle : false, //是否混淆变量名
						preserveComments : false, //不删除注释，还可以为 false（删除全部注释），some（保留@preserve @license @cc_on等注释）
                },    
               	//移动端js打包
				FeiTu : {   
					options: {
						banner: '/*! spamvc-feitu-v1.0.1.js -  <%= grunt.template.today("yyyy-mm-dd") %> */\n'//添加banner
					}, 
                    files: {
                        'static/js/lib/spamvc-feitu-v1.0.1.js': [
                            getFile("jquery"),
							getFile("jquery.mobile.touch.min"),
							getFile("layout-1.0.0"),
							getFile("xdk-v1.1.min"),
							getFile("fixdialog"),
							getFile("backunderscore.min"),
							getFile("asyvalidator-1.0.0.min"),
							getFile("dragloader"),
							getFile("xdk.widget.pager"),
							getFile("swiper"),
							getFile("require"),
							getFile("require-css"),
							getFile("require-image"),
							getFile("text-v2.0.10"),
							getFile("spamvc"),
							getFile("spacontroller"),
							getFile("appcontroller"),
							getFile("app-build")
                       ]
                    }
                }
            }
		});
		require('load-grunt-tasks')(grunt);
		grunt.registerTask('default', [ 
			"uglify:FeiTu"
		]); 
    };
