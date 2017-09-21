/**
 * Created by Admini on 2016/8/10.
 */

window.utils={
    loaded:true,
    loadedCount:0,
    totalCount:0,
    isMobile:navigator.userAgent.toLowerCase().match(/(ipod|ipad|iphone|android|coolpad|mmp|smartphone|midp|wap|xoom|symbian|j2me|blackberry|win ce)/i) != null,
    loadImage:function(url){
        this.totalCount++;
        this.loaded=false;
        var image=new Image();
        image.src=url;
        image.onload=utils.itemLoaded;
        return image;
    },
    itemLoaded:function(){
        utils.loadedCount++;
        if(utils.loadedCount===utils.totalCount){
            utils.loaded=true;
            if(utils.start){
                utils.start();
                utils.start=undefined;
            }
        }
    },
    createAudio:function (arg)
{
    if (typeof arg == "string")
        arg = {src:arg};

    var audio = document.createElement("AUDIO");
    for ( var attr in arg)
        audio[attr] = arg[attr];
    return audio;
},
    rnd:function(n,m) {
        // Math.random()*(m-n)+n;  带小数
        return parseInt(Math.random()*(m-n+1)+n);
    },
    //圆形与矩形的碰撞检测
    computeCollision:function(w, h, r, rx, ry) {
        var dx = Math.min(rx, w * 0.5);
        var dx1 = Math.max(dx, -w * 0.5);
        var dy = Math.min(ry, h * 0.5);
        var dy1 = Math.max(dy, -h * 0.5);
        if((dx1 - rx) * (dx1 - rx) + (dy1 - ry) * (dy1 - ry)<= r * r){
            return true;
        }
    },
    intersects : function (rectA, rectB) {
        return !(rectA.x + rectA.width < rectB.x ||
        rectB.x + rectB.width < rectA.x ||
        rectA.y + rectA.height < rectB.y ||
        rectB.y + rectB.height < rectA.y);
    }
};
function Icon(){//
    this.x = 50;
    this.y = 105;
    this.cur=0;
    this.width=45;
    this.height=72;
    this.vx=1;
    this.vy=1;
    this.timer=null;
};
Icon.prototype.draw = function (context,json) {
    context.save();
    context.beginPath();
    //context.scale(-1, 1);
    //context.drawImage(json.src, document.documentElement.clientWidth-this.width-this.x, this.height*this.cur,this.width,this.height, this.x,this.y,this.width,this.height);
    context.drawImage(json.src, 0,this.height*this.cur,this.width,this.height, this.x,this.y,this.width,this.height);
    context.closePath();
    context.restore();
};
function Dog(){//小狗
    this.x = 50;
    this.y = 105;
    this.cur=0;
    this.width=57;
    this.height=62;
    this.vx=1;
    this.vy=1;
    this.timer=null;
};
Dog.prototype.draw = function (context,json) {
    context.save();
    context.beginPath();
    //context.scale(-1, 1);
    //context.drawImage(json.src, document.documentElement.clientWidth-this.width-this.x, this.height*this.cur,this.width,this.height, this.x,this.y,this.width,this.height);
    context.drawImage(json.src, 0,this.height*this.cur,this.width,this.height, this.x,this.y,this.width,this.height);
    context.closePath();
    context.restore();
};
Dog.prototype.action=function(time){
    var _this=this,timer;
    clearInterval(timer);
    timer=setInterval(function(){
        _this.cur++;
        if(_this.cur==2){
            _this.cur=0;
            // clearInterval(_this.timer);
        };
        //  fn&&fn();
        //  _this.action(fn,utils.rnd(80,1000))//控制道具掉落的时间
    },time)


}
function Hero(){
    this.x = 0;
    this.y = 0;
    this.width=64;
    this.height=102;
    this.radius=40;
    this.off=true;
}//萝框
Hero.prototype.draw = function (context,json) {
    context.save();
    context.beginPath();
    context.drawImage(json.src, 0,0,this.width,this.height, this.x,this.y,this.width,this.height);
    context.closePath();
    context.restore();
};
Hero.prototype.getBounds = function () {
    return {
        x: this.x ,
        y: this.y,
        width: this.width,
        height: 20,
    };
};
function Rope(){
    this.x = 0;
    this.y = 0;
    this.width=document.documentElement.clientWidth;
    this.height=3;
}//萝框
Rope.prototype.draw = function (context,json) {
    context.save();
    context.beginPath();
    context.drawImage(json.src, 0,0,this.width,this.height, this.x,this.y,this.width,this.height);
    context.closePath();
    context.restore();
};
function Box(){
    this.x = 0;
    this.y = 0;
    this.cur=0;
    this.width=30;
    this.height=30;
    this.vx=1;
    this.vy=1;
    this.chrH=30;
    this.timer=null;
    //this.action();
}
Box.prototype.draw = function (context,json) {
    context.save();
    context.beginPath();
    context.drawImage(json.src, 0,this.chrH*this.cur,this.width,this.height, this.x,this.y,this.width,this.height);
    context.closePath();
    context.restore();
};
Box.prototype.getBounds = function () {
    return {
        x: this.x+10 ,
        y: this.y,
        width: this.width-10,
        height: this.height-12,
    };
};
window.game=(function () {
    var config={
        heros:[],
        dogs : [],
        boxs:[],
        ropes:[],
        icons:[],
        rndNum:[0,0,1,0,1,0,1,1,1,1],
        now:0,
        plusCoupons:0,
        timer:null,
        totalTimer:null,
        bostimer:null,
        totalTime:60,
        integral:0,
        init:function () {
            window.canvas = document.getElementById('canvas'),
                window.modal=document.getElementById('modal'),
                window.backPlay=document.getElementById('backPlay'),
                window.startBtn=document.getElementById('startBtn'),
                window.share=document.getElementById('share'),
                window.recharge=document.getElementById('recharge'),
                window.telNumber=document.getElementById('telNumber'),
                window.enter=document.getElementById('enter'),
                window.img=utils.loadImage('static/img/game/hero.png'),
                window.carDog=utils.loadImage('static/img/game/dog.png'),
                window.dogtranslate=utils.loadImage('static/img/game/dogtranslate.png'),
                window.envelope=utils.loadImage('static/img/game/envelope.png'),
                window.die=utils.loadImage('static/img/game/die.png'),
                window.iconImg=utils.loadImage('static/img/game/iconCenter.png'),
                window.ropeImg=utils.loadImage('static/img/game/rope1.png'),
                window.bgm=utils.createAudio({src:'static/img/game/bgm.mp3',loop:true});
            window.wavclick=utils.createAudio({src:'static/img/game/click.wav',loop:false});
            window.wavcollision=utils.createAudio({src:'static/img/game/wavcollision.mp3',loop:false});
                window.oCount=document.getElementById('count');
            window.context = canvas.getContext('2d');
            canvas.width=document.documentElement.clientWidth;
            canvas.height=document.documentElement.clientHeight;
        },
        start:function () {

            wavcollision.pause();
           bgm.play();
            this.create();
            clearInterval(game.config.totalTimer);
            game.config.totalTimer=setInterval(function () {
                game.config.totalTime--;
                oCount.innerHTML='00:00:'+game.config.totalTime+' ';
                if(game.config.totalTime<=0){
                    clearInterval(game.config.totalTimer);
                    window.cancelAnimationFrame(game.config.timer);
                    clearInterval(game.config.bostimer);
                    wavcollision.play();
                    bgm.pause();
                    game.createDom();
                    modal.style.display='block';
                }
            },1000);
            function drawIcon(obj) {
                obj.draw(context,{src:iconImg});
            }
            function drawRope(obj) {
                obj.draw(context,{src:ropeImg});
            }
            function drawFn (obj) {
                game.config.intersectsFn(game.config.heros[0]);//碰撞
                game.config.drag(game.config.heros[0]);
                if(game.config.heros[0].off==true){
                    obj.draw(context,{src:img});
                }else{
                    obj.draw(context,{src:die});
                }

            };
            function drawBox(obj) {
                obj.vy +=4;

                obj.y += utils.rnd(3,8);
                obj.draw(context,{src:envelope});
                //  console.log(obj.vy);
            };
            function drawDog(obj){
                if(obj.x+obj.width>=canvas.width/2-136+34*8){
                    obj.vx=-3;
                };
                if(obj.x<canvas.width/2-136){
                    obj.vx=3;

                };
                obj.x+=obj.vx;
                if(obj.vx==-3){
                    obj.draw(context,{src:dogtranslate});
                }else{
                    obj.draw(context,{src:carDog});
                }


            };
            (function drawFrame () {
                game.config.timer=window.requestAnimationFrame(drawFrame, canvas);
                context.clearRect(0, 0, canvas.width, canvas.height);
                game.config.heros.forEach(drawFn);//萝框
                game.config.dogs.forEach(drawDog);//小狗
                game.config.boxs.forEach(drawBox);//道具
                game.config.ropes.forEach(drawRope);
                game.config.icons.forEach(drawIcon);
                context.fillStyle='white';
                context.font='20px 黑体';
                var str='体验金:'+game.config.integral+"元";
                var w=context.measureText(str).width;
                context.fillText(str,canvas.width/2-136+80,canvas.height/2-50);
                context.fillStyle='white';
                context.font='20px 黑体';
                var str1='加息券:0.'+game.config.plusCoupons+"%";
                var w1=context.measureText(str1).width;
                context.fillText(str1,canvas.width/2-136+80,canvas.height/2-80);
               // context.fillText(str,20,40);
            }());
        },
        intersectsFn:  function (obj){
            for(var i=0;i<game.config.boxs.length;i++){
                if (utils.intersects(obj.getBounds(), game.config.boxs[i].getBounds())) {
                    switch (game.config.boxs[i].cur){
                        case 0:
                            //增加一颗金币
                            game.config.integral+=50;
                            game.config.boxs.splice(i,1);
                            break;
                        case 1:
                            wavcollision.play();
                            //碰到炸弹，结束游戏
                            //alert('结束游戏');
                            game.config.boxs.splice(i,1);
                            game.config.heros[0].width=83;
                            game.config.heros[0].height=102;
                            game.config.heros[0].off=false;
                            window.cancelAnimationFrame(game.config.timer);
                            clearInterval(game.config.totalTimer);
                            clearInterval(game.config.bostimer);

                           bgm.pause();
                            modal.style.display='block';
                            game.createDom();
                            break;
                        case 2:
                            wavclick.play();
                            game.config.plusCoupons+=1;
                            game.config.boxs.splice(i,1);
                            break;
                    }
                }//碰撞检测，精确度不高
                if(game.config.boxs[i].y+game.config.boxs[i].height>=canvas.height)game.config.boxs.splice(i,1);//越界删除当前对象
            }
        },
        drag:function (hero) {
            var x=hero.x;
            var y=0;
            canvas.addEventListener('touchstart',function(ev){
                var obj=ev.targetTouches[0];
                if(obj.pageX>hero.x && obj.pageX<hero.x+hero.width && obj.pageY>hero.y && obj.pageY<hero.y+hero.height) {
                    var disX=ev.targetTouches[0].pageX-x;
                    var disY=ev.targetTouches[0].pageY-y;
                    function fnMove(ev){
                        x=ev.targetTouches[0].pageX-disX;
                        y=ev.targetTouches[0].pageY-disY;
                        if(x<0)x=0;
                        if(x>=canvas.width-hero.width)x=canvas.width-hero.width;
                        hero.x=x;
                    }
                    function fnEnd(){
                        document.removeEventListener('touchmove',fnMove,false);
                        document.removeEventListener('touchend',fnEnd,false);
                    }
                    document.addEventListener('touchmove',fnMove,false);
                    document.addEventListener('touchend',fnEnd,false);
                }

                ev.preventDefault();
            },false);
        },
        create:function () {
            var hero=new Hero(),rope=new Rope(),dog = new Dog(),icon=new Icon();
            dog.action(60);
            icon.x=canvas.width/2-136+20;
            icon.y=canvas.height/2-104;
            game.config.icons.push(icon);
            game.config.ropes.push(rope);
            game.config.dogs.push(dog);
            rope.y  =dog.y+dog.height;
            hero.x=canvas.width/2-136+100*1;
            hero.y=canvas.height-hero.height-30;
            game.config.heros.push(hero);
            clearInterval(game.config.bostimer);
            game.config.bostimer=setInterval(function () {
                var box=new Box();
                game.config.now++;
                if(game.config.now==40||game.config.now==10||game.config.now==60||game.config.now==100||game.config.now==130){
                    box.cur=2;
                }else {
                    box.cur=utils.rnd(game.config.rndNum[0],game.config.rndNum[9]);
                }
                //    box.y += utils.rnd(1,4);


                // console.log(utils.rnd(game.config.rndNum[0],game.config.rndNum[9]))
                switch (box.cur){
                    case 0:
                        box.chrH=0;
                        box.height=30;
                        box.x  = dog.x;
                        box.y  =dog.y+dog.height/2;
                        break;
                    case 1:
                        box.chrH=30;
                        box.height=31;
                        box.x  = utils.rnd(0,canvas.width);
                        box.y  =dog.y+dog.height/2;
                        break;
                    case 2:
                        box.chrH=31;
                        box.height=58;
                        box.x  = utils.rnd(0,canvas.width);
                        box.y  =dog.y+dog.height/2;
                        break;

                }

                game.config.boxs.push(box);
            },300)//控制道具出现频率
            return hero;
        },
        createDom:function () {
            var len=game.config.integral/50;
            var modalContainer=document.getElementById('modalContainer');
            modalContainer.innerHTML='';
            modalContainer.innerHTML='<div class="modal-bd-item"><div class="fl"><img src="static/img/game/flicon.png" width="46" height="46" alt=""></div> <div class="fr"><h4 class="title">'+game.config.integral+'元体验金</h4></div></div><div class="modal-bd-item"><div class="fl"><img src="static/img/game/flicons.png" width="57" height="46" alt=""></div> <div class="fr"><h4 class="title">0.'+game.config.plusCoupons+'%加息券</h4></div></div>';
        }
    };
    return {
        config:config,//
        init:config.init,//初始化
        start:config.start,//开始游戏
        intersectsFn:config.intersectsFn,//碰撞
        drag:config.drag,//左右划动
        create:config.create,
        createDom:config.createDom
    }
})()