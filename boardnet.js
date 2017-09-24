/**
 * Created by liang on 2017/8/25.
 */
"use strict";
var log = console.log.bind(console)
var BOARD_WIDTH = 500;
var BOARD_HEIGHT = 900;
var SQUARE_SIZE = 100;
var WORF_SIZE=95;
var SHEEP_SIZE=65;
var SQUARE_LEFT = (BOARD_WIDTH - SQUARE_SIZE * 4) /2;
var SQUARE_TOP = (BOARD_HEIGHT - SQUARE_SIZE * 8) /2;

var PIECE_NAME = [
    "oo","worf","sheep"
];
var PIECE_NAME_CHN = [
    "棋盘", "狼","羊"
];

// 棋子距离棋盘左边框的距离
function SQ_X(sq,type) {
    if(type==1){
        return SQUARE_LEFT + FILE_X(sq)  * SQUARE_SIZE-WORF_SIZE/2;
    }else {
        return SQUARE_LEFT + FILE_X(sq)  * SQUARE_SIZE-SHEEP_SIZE/2;
    }

}

// 棋子距离棋盘上边框的距离
function SQ_Y(sq,type) {
    if(type==1){
        return SQUARE_TOP + RANK_Y(sq)  * SQUARE_SIZE-WORF_SIZE/2;
    }else {
        return SQUARE_TOP + RANK_Y(sq)  * SQUARE_SIZE-SHEEP_SIZE/2;
    }
}

// Board对象的初始化代码，位于index.html中
function Board(container,sheepText,images) {
    this.sheepText=sheepText;
    this.images = images;			// 图片路径
    this.style = container.style;
    var style=this.style
    style.position = "relative";
    style.width = BOARD_WIDTH + "px";
    style.height = BOARD_HEIGHT + "px";
    style.background = "url(" + this.images + "board2.jpg)";
    this.container=container;
}
Board.prototype.endGame=function(){
    for (var sq = 0; sq < 45; sq ++) {
        if (IN_BOARD(sq)) {
            var img = this.imgSquares[sq];
            img.src = this.images +  "oo.gif";
        }
    }
}
Board.prototype.startGame=function(sheeps,lesssheeps,me,him,role){
    this.him=him
    this.me=me
    this.end=false;
    this.role=role; //0代表狼，1代表羊
    this.r=0;
    var t=this;
    this.previous=0
    me.on('getStep', function (data) {
        var sq=data.step;
        if(sq!= t.previous){
            t.drawStep(sq);
            t.previous=sq;
        }

    });
    this.lesssheeps=lesssheeps;
    this.imgSquares = [];			// img数组，对应棋盘上的90个位置区域
    this.pos = new Position(sheeps);

    if (this.role == 0) {
        this.sheepText.innerHTML = "你的身份：狼<br>" + "未下的羊：" + this.pos.sheeps + "<br>请狼走";
    } else {
        this.sheepText.innerHTML = "你的身份：羊<br>" + "未下的羊：" + this.pos.sheeps + "<br>请狼走";
    }



    this.pos.fromFen("9/9/2w/1sss/1s3s/1sss/2w/9/9 r - - 0 1");	// 根据FEN串初始化棋局
    var style=this.style
    style.position = "relative";
    style.width = BOARD_WIDTH + "px";
    style.height = BOARD_HEIGHT + "px";
    style.background = "url(" + this.images + "board2.jpg)";
    var this_ = this;
    for (var sq = 0; sq < 45; sq ++) {
        // 遍历虚拟棋盘的45个点
        // 1.判断该点是否位于真实棋盘
        if (!IN_BOARD(sq)) {
            this.imgSquares.push(null);
            continue;
        }

        // 2.棋盘上的45个区域，每个区域都会定义一个对应的img标签
        var img = document.createElement("img");
        var style = img.style;
        style.position = "absolute";

        style.zIndex = 0;
        // 3.每个棋盘区域都会绑定点击事件，参数sq_表示了具体点击的区域。（这里用到了“闭包”的知识吧）
        img.onmousedown = function(sq_) {
            return function() {
                this_.clickSquare(sq_);
            }
        } (sq);

        // 4.将定义好的img标签追加到html中
        this.container.appendChild(img);

        // 5.将img标签存储到imgSquares数组中，方便后续对该区域进行操作（比如，显示不同的棋子图片）
        this_.imgSquares.push(img);
    }

    // 显示棋子图片
    this.flushBoard();
}

Board.prototype.drawStep = function(sq_){
    if(this.end){
        return
    }
    var sq = sq_;						// 点击的位置

    var pc = this.pos.squares[sq];	// 点击的棋子

    if(pc==0&&this.sqSelected==0&&this.pos.sdPlayer==2){
        this.addSheep(sq);
        this.worfLive();
        this.worfLive();
        this.flushBoard();
    }
    if (pc && pc==this.pos.sdPlayer) {
        // 点击了己方棋子，直接选中该子

        // if (this.mvLast != 0) {
        //     this.drawSquare(SRC(this.mvLast), false);
        //     this.drawSquare(DST(this.mvLast), false);
        // }
        if(pc==2&&this.pos.sheeps>0){
            return;
        }
        if (this.sqSelected) {
            this.drawSquare(this.sqSelected, false);
        }
        this.drawSquare(sq, true);
        this.sqSelected = sq;

    } else if (pc==0&&this.sqSelected > 0) {
        // 点击的不是己方棋子（对方棋子或者无子的位置），但有子选中了(一定是自己的子)，那么执行这个走法
        this.addMove(MOVE(this.sqSelected, sq));
        this.worfLive();
        this.worfLive();
        this.flushBoard();

    }
    log(this.pos.sheeps);
    log(this.pos.liveSheeps);
    log(this.pos.worfs);
    if(this.pos.worfs<=0){
        if(!this.end){
            alert("羊胜利！")
            this.end=true
        }

    }
    if(this.pos.liveSheeps<=this.lesssheeps&&this.pos.sheeps==0){
        if(this.end){
            alert("狼胜利！")
            this.end=true
        }

    }
    if(this.pos.sdPlayer==1){
        if(this.role==0){
            this.sheepText.innerHTML="你的身份：狼<br>"+"未下的羊："+this.pos.sheeps+"<br>请狼走";
        }else{
            this.sheepText.innerHTML="你的身份：羊<br>"+"未下的羊："+this.pos.sheeps+"<br>请狼走";
        }

    }
    if(this.pos.sdPlayer==2){
        if(this.role==0){
            this.sheepText.innerHTML="你的身份：狼<br>"+"未下的羊："+this.pos.sheeps+"<br>请羊走";
        }else{
            this.sheepText.innerHTML="你的身份：羊<br>"+"未下的羊："+this.pos.sheeps+"<br>请羊走";
        }

    }



}
// 点击棋盘的响应函数。点击棋盘（棋子或者空位置），就会调用该函数。sq_是点击的位置

Board.prototype.clickSquare = function(sq_) {
    if(this.end){
        return
    }
    log("r:"+this.r)
    if(this.role==0){
        if(this.r%2==1){
            return;
        }
    }
    if(this.role==1){
        if(this.r%2==0){
            return;
        }
    }
    var sq = sq_;					// 点击的位置

    if(!isNaN(sq)){
        if( this.previous!=sq){
            this.me.emit('setStep',{ step : sq, user_id : this.him})
            this.previous=sq;
        }

    }

    var pc = this.pos.squares[sq];	// 点击的棋子

    if(pc==0&&this.sqSelected==0&&this.pos.sdPlayer==2){
        this.addSheep(sq);
        this.worfLive();
        this.worfLive();
        this.flushBoard();
    }
    if (pc && pc==this.pos.sdPlayer) {
        // 点击了己方棋子，直接选中该子

        // if (this.mvLast != 0) {
        //     this.drawSquare(SRC(this.mvLast), false);
        //     this.drawSquare(DST(this.mvLast), false);
        // }
        if(pc==2&&this.pos.sheeps>0){
            return;
        }
        if (this.sqSelected) {
            this.drawSquare(this.sqSelected, false);
        }
        this.drawSquare(sq, true);
        this.sqSelected = sq;

    } else if (pc==0&&this.sqSelected > 0) {
        // 点击的不是己方棋子（对方棋子或者无子的位置），但有子选中了(一定是自己的子)，那么执行这个走法
        this.addMove(MOVE(this.sqSelected, sq));
        this.worfLive();
        this.worfLive();
        this.flushBoard();

    }
    log(this.pos.sheeps);
    log(this.pos.liveSheeps);
    log(this.pos.worfs);
    if(this.pos.worfs<=0){
        if(!this.end){
            alert("羊胜利！")
            this.end=true
        }

    }
    if(this.pos.liveSheeps<=this.lesssheeps&&this.pos.sheeps==0){
        if(!this.end){
            alert("狼胜利！")
            this.end=true
        }

    }
    if(this.pos.sdPlayer==1){
        if(this.role==0){
            this.sheepText.innerHTML="你的身份：狼<br>"+"未下的羊："+this.pos.sheeps+"<br>请狼走";
        }else{
            this.sheepText.innerHTML="你的身份：羊<br>"+"未下的羊："+this.pos.sheeps+"<br>请狼走";
        }

    }
    if(this.pos.sdPlayer==2){
        if(this.role==0){
            this.sheepText.innerHTML="你的身份：狼<br>"+"未下的羊："+this.pos.sheeps+"<br>请羊走";
        }else{
            this.sheepText.innerHTML="你的身份：羊<br>"+"未下的羊："+this.pos.sheeps+"<br>请羊走";
        }

    }





}
// 判断这步棋是否合法，如果合法，则执行这步棋
Board.prototype.addMove = function(mv) {
    // 判断这步棋是否合法
    if (!this.pos.legalMove(mv)) {
        return ;
    }
    this.r++;
    this.pos.movePiece(mv)
    this.sqSelected = 0;
    if(this.pos.sdPlayer==1){
        this.pos.sdPlayer=2;
    }else{
        this.pos.sdPlayer=1;
    }

}
Board.prototype.addSheep=function (sq) {
    if(!this.pos.addSheep(sq)){
        return
    }
    this.r++;
    this.sqSelected = 0;
    if(this.sdPlayer==1){
        this.pos.sdPlayer=2;
    }else{
        this.pos.sdPlayer=1;
    }

}
Board.prototype.worfLive = function() {
    this.pos.worfLive();
}



// 显示sq位置的棋子图片。如果该位置没棋子，则显示一张透明的图片。如果selected为true，则要显示棋子选中时的边框。
Board.prototype.drawSquare = function(sq, selected) {
    var img = this.imgSquares[sq];
    var type=this.pos.squares[sq];
    img.style.left = SQ_X(sq,type);
    img.style.top = SQ_Y(sq,type);
    img.style.width = SHEEP_SIZE;
    img.style.height = SHEEP_SIZE
    if(type==1){
        img.style.width = WORF_SIZE;
        img.style.height = WORF_SIZE;
    }
    img.src = this.images + PIECE_NAME[this.pos.squares[sq]] + ".gif";

    img.width=img.style.width
    img.height=img.style.height
    if(selected){
        if(1==this.pos.sdPlayer){
            img.src = this.images + "worf_select.gif";
        }else{
            img.src = this.images + "sheep_select.gif";
        }

    }
    if(sq==this.pos.diedWorf){
        img.style.width = WORF_SIZE;
        img.style.height = WORF_SIZE;
        img.src = this.images + "worf_died.gif";
    }


}

// 重新显示棋盘上的棋子
Board.prototype.flushBoard = function() {
    for (var sq = 0; sq < 45; sq ++) {
        if (IN_BOARD(sq)) {
            this.drawSquare(sq);
        }
    }

}


