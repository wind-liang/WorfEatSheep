"use strict";
var log = console.log.bind(console)
var BOARD_WIDTH = 500;
var BOARD_HEIGHT = 900;
var SQUARE_SIZE = 100;
var WORF_SIZE=75;
var SHEEP_SIZE=50;
var SQUARE_LEFT = (BOARD_WIDTH - SQUARE_SIZE * 4) /2;
var SQUARE_TOP = (BOARD_HEIGHT - SQUARE_SIZE * 8) /2;

var PIECE_NAME = [
    "oo","worf","sheep"
];
var PIECE_NAME_CHN = [
    "����", "��","��"
];

// ���Ӿ���������߿�ľ���
function SQ_X(sq,type) {
    if(type==1){
        return SQUARE_LEFT + FILE_X(sq)  * SQUARE_SIZE-WORF_SIZE/2;
    }else {
        return SQUARE_LEFT + FILE_X(sq)  * SQUARE_SIZE-SHEEP_SIZE/2;
    }

}

// ���Ӿ��������ϱ߿�ľ���
function SQ_Y(sq,type) {
    if(type==1){
        return SQUARE_TOP + RANK_Y(sq)  * SQUARE_SIZE-WORF_SIZE/2;
    }else {
        return SQUARE_TOP + RANK_Y(sq)  * SQUARE_SIZE-SHEEP_SIZE/2;
    }
}

// Board����ĳ�ʼ�����룬λ��index.html��
function Board(container, images) {
    this.images = images;			// ͼƬ·��
    this.imgSquares = [];			// img���飬��Ӧ�����ϵ�90��λ������
    this.pos = new Position();
    this.pos.fromFen("9/9/2w/1sss/1s3s/1sss/2w/9/9 r - - 0 1");	// ����FEN����ʼ�����

    var style = container.style;
    style.position = "relative";
    style.width = BOARD_WIDTH + "px";
    style.height = BOARD_HEIGHT + "px";
    style.background = "url(" + images + "board2.jpg)";
    var this_ = this;
    for (var sq = 0; sq < 45; sq ++) {
        // �����������̵�45����
        // 1.�жϸõ��Ƿ�λ����ʵ����
        if (!IN_BOARD(sq)) {
            this.imgSquares.push(null);
            continue;
        }

        // 2.�����ϵ�90������ÿ�����򶼻ᶨ��һ����Ӧ��img��ǩ
        var img = document.createElement("img");
        var style = img.style;
        style.position = "absolute";

        style.zIndex = 0;
        // 3.ÿ���������򶼻�󶨵���¼�������sq_��ʾ�˾����������򡣣������õ��ˡ��հ�����֪ʶ�ɣ�
        img.onmousedown = function(sq_) {
            return function() {
                this_.clickSquare(sq_);
            }
        } (sq);

        // 4.������õ�img��ǩ׷�ӵ�html��
        container.appendChild(img);

        // 5.��img��ǩ�洢��imgSquares�����У���������Ը�������в��������磬��ʾ��ͬ������ͼƬ��
        this_.imgSquares.push(img);
    }

    // ��ʾ����ͼƬ
    this.flushBoard();
}

// ������̵���Ӧ������������̣����ӻ��߿�λ�ã����ͻ���øú�����sq_�ǵ����λ��
Board.prototype.clickSquare = function(sq_) {
    var sq = sq_;						// �����λ��
    var pc = this.pos.squares[sq];	// ���������

    if(pc==0&&this.sqSelected==0&&this.pos.sdPlayer==2){
        this.addSheep(sq);
        this.worfLive();
        this.worfLive();
        this.flushBoard();
    }
    if (pc && pc==this.pos.sdPlayer) {
        // ����˼������ӣ�ֱ��ѡ�и���

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
        // ����Ĳ��Ǽ������ӣ��Է����ӻ������ӵ�λ�ã���������ѡ����(һ�����Լ�����)����ôִ������߷�
        this.addMove(MOVE(this.sqSelected, sq));
        this.worfLive();
        this.worfLive();
        this.flushBoard();

    }


    log(this.pos.sheeps);
    log(this.pos.liveSheeps);
    log(this.pos.worfs);
    if(this.pos.worfs<=0){
        alert("��ʤ����")
    }
}
// �ж��ⲽ���Ƿ�Ϸ�������Ϸ�����ִ���ⲽ��
Board.prototype.addMove = function(mv) {
    // �ж��ⲽ���Ƿ�Ϸ�
    if (!this.pos.legalMove(mv)) {
        return;
    }
    this.pos.movePiece(mv)
    this.sqSelected = 0;
    if(this.pos.sdPlayer==1){
        this.pos.sdPlayer=2;
    }else{
        this.pos.sdPlayer=1;
    }
}
Board.prototype.addSheep=function (sq) {
    this.pos.addSheep(sq);
    this.sqSelected = 0;
    if(this.pos.sdPlayer==1){
        this.pos.sdPlayer=2;
    }else{
        this.pos.sdPlayer=1;
    }
}
Board.prototype.worfLive = function() {
    this.pos.worfLive();
}



// ��ʾsqλ�õ�����ͼƬ�������λ��û���ӣ�����ʾһ��͸����ͼƬ�����selectedΪtrue����Ҫ��ʾ����ѡ��ʱ�ı߿�
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
            img.src = this.images + "bkm.gif";
        }else{
            img.src = this.images + "ra.gif";
        }

    }
    if(sq==this.pos.diedWorf){
        img.style.width = WORF_SIZE;
        img.style.height = WORF_SIZE;
        img.src = this.images + "bkm.gif";
    }


}

// ������ʾ�����ϵ�����
Board.prototype.flushBoard = function() {
    for (var sq = 0; sq < 45; sq ++) {
        if (IN_BOARD(sq)) {
            this.drawSquare(sq);
        }
    }
}


