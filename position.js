"use strict";

// ���ӱ��
var PIECE_WORLF = 1;		// ��
var PIECE_SHEEP = 2;	// ��


// ���̷�Χ
var RANK_TOP = 0;
var RANK_BOTTOM = 8;
var FILE_LEFT = 0;
var FILE_RIGHT = 4;
var ADD_PIECE = false;	// �������
var DEL_PIECE = true;	// ɾ������
// �������飬�����ж������Ƿ���������
var IN_BOARD_ = [
    0, 0, 1, 0, 0,
    0, 1, 1, 1, 0,
    1, 1, 1, 1, 1,
    1, 1, 1, 1, 1,
    1, 1, 1, 1, 1,
    1, 1, 1, 1, 1,
    1, 1, 1, 1, 1,
    0, 1, 1, 1, 0,
    0, 0, 1, 0, 0,
];

// �ж�ĳλ���Ƿ�������
function IN_BOARD(sq) {
    return IN_BOARD_[sq] != 0;
}

// ����һά���󣬻�ȡ��ά��������
function RANK_Y(sq) {
    return Math.floor(sq / 5);
}

// ����һά���󣬻�ȡ��ά��������
function FILE_X(sq) {
    return sq % 5;
}

// ����ά����ת��Ϊһά����
function COORD_XY(x, y) {
    return x + (y * 5);
}

function CHR(n) {
    return String.fromCharCode(n);
}

function ASC(c) {
    return c.charCodeAt(0);
}
// ��ȡ�߷������
function SRC(mv) {
    return mv & 63;
}

// ��ȡ�߷����յ�
function DST(mv) {
    return mv >> 6;
}

// ��һ���߷��������յ㣬ת��Ϊһ����������
function MOVE(sqSrc, sqDst) {
    return sqSrc + (sqDst << 6);
}
function CHAR_TO_PIECE(c) {
    switch (c) {
        case "w":
            return PIECE_WORLF;
        case "s":
            return PIECE_SHEEP;
        default:
            return -1;
    }
}

function Position() {

}

// ��ʼ���������
Position.prototype.clearBoard = function() {
    this.sdPlayer = 1;	// ��˭���塣1-�ǣ�2-��
    this.squares = [];	// �������һά�������
    this.sheeps=22;
    this.liveSheeps=8;
    this.worfs=2;
    this.diedWorf=0;
    this.killSheep=0;
    for (var sq = 0; sq < 45; sq ++) {
        this.squares.push(0);
    }
}

// ������pc��ӽ�����е�spλ��
// Position.prototype.addPiece = function(sq, pc) {
//     this.squares[sq] = pc;
// }

// ͨ��FEN����ʼ�����

Position.prototype.fromFen = function(fen) {
    this.clearBoard();
    var y = RANK_TOP;
    var x = FILE_LEFT;
    var index = 0;
    if (index == fen.length) {
        return;
    }
    var c = fen.charAt(index);
    while (c != " ") {
        if (c == "/") {
            x = FILE_LEFT;
            y ++;
            if (y > RANK_BOTTOM) {
                break;
            }
        } else if (c >= "1" && c <= "9") {
            x = (ASC(c) - ASC("0"));
        } else if (c=='s' || c=='w') {
            if (x <= FILE_RIGHT) {
                var pt = CHAR_TO_PIECE(c);
                if (pt >= 0) {
                    this.addPiece(COORD_XY(x, y), pt);
                }
                x++;
            }
        }
        index ++;
        if (index == fen.length) {
            return;
        }
        c = fen.charAt(index);
    }
    index ++;
    if (index == fen.length) {
        return;
    }

}

// ��һ����
Position.prototype.makeMove = function(mv) {
    this.movePiece(mv);
    return true;
}

// �����߷��ƶ����ӣ�ɾ���յ�λ�õ����ӣ��������λ�õ����ӷ������յ��λ�á�
Position.prototype.movePiece = function(mv) {
    var sqSrc = SRC(mv);			// ���λ��
    var sqDst = DST(mv);			// �յ�λ��
    //var pc = this.squares[sqDst];	// �յ�λ�õ�����
    // if (pc > 0) {
    //     // �յ������ӣ�Ҫɾ��������
    //     this.addPiece(sqDst, pc, DEL_PIECE);
    // }
    var pc = this.squares[sqSrc];				// ���λ�õ�����
    this.addPiece(sqSrc, pc, DEL_PIECE);	// ɾ���������
    if(this.killSheep!=0){
        this.addPiece(this.killSheep, 1, DEL_PIECE);	// ɾ���������
        this.liveSheeps--;
        this.killSheep=0
    }
    this.addPiece(sqDst, pc, ADD_PIECE);	// ��ԭ������������ӵ��յ�
}
Position.prototype.addSheep = function(sq) {
    if(this.sheeps>0){
        this.addPiece(sq, 2, ADD_PIECE);	// ��ԭ������������ӵ��յ�
        this.sheeps--;
        this.liveSheeps++;
    }
}
// ���bDelΪfalse��������pc��ӽ�����е�spλ�ã����bDelΪtrue����ɾ��spλ�õ����ӡ�
Position.prototype.addPiece = function(sq, pc, bDel) {
    // var pcAdjust;
    this.squares[sq] = bDel ? 0 : pc;
}

Position.prototype.legalMoveWalk = function(src,dst) {
    var sub=dst-src;
    switch (src){
        case 2:
            return (sub==4 || sub==5 || sub ==6)
        case 36:
        case 6:
            return (sub==-4 || sub==1 || sub==6)
        case 37:
        case 27:
        case 23:
        case 21:
        case 17:
        case 7:
            return (sub==-5 || sub==-1 || sub==5 || sub==1)
        case 38:
        case 8:
            return (sub==4 || sub==-1 || sub==-6)
        case 10:
            return (sub==5 || sub==1 ||sub==6)
        case 13:
        case 11:
            return (sub==-1 || sub==1 || sub==5)
        case 33:
        case 31:
            return (sub==-1 || sub==1 || sub==-5)
        case 14:
            return (sub==5|| sub==-1 ||sub==4)
        case 15:
        case 25:
            return (sub==-5 || sub==5 ||sub==1)
        case 29:
        case 19:
            return (sub==-5 || sub==5 ||sub==-1)
        case 30:
            return (sub==-5|| sub==1 || sub==-4)
        case 34:
            return (sub==-5|| sub==-1 ||sub==-6)
        case 12:
        case 16:
        case 18:
        case 22:
        case 26:
        case 28:
        case 32:
            return (sub==-5 || sub==-1 || sub==5 || sub==1 || sub==-6 || sub==-4 || sub==4 || sub==6)
        case 20:
            return (sub==-5 || sub==5 || sub==-4|| sub==6 || sub==1)
        case 24:
            return (sub==-5 || sub==5 || sub==4 || sub==-6 || sub==-1)
        case 42:
            return (sub==-4 || sub==-5 || sub ==-6)
        default:
            return false
    }
}
Position.prototype.legalMoveJump = function(src,dst) {
    var pcDst = this.squares[(src+dst)/2];
    if(pcDst!=2){
        return false;
    }
    this.killSheep=(src+dst)/2;
    var sub=dst-src;
    switch (src){
        case 2:
            return sub==10
        case 36:
            return (sub==2 || sub==-8)
        case 6:
            return (sub==12 || sub==2)
        case 7:
            return sub==10
        case 17:
        case 27:
            return (sub==-10 || sub==-2 || sub==10 || sub==2)
        case 37:
            return -10
        case 23:
            return (sub==-10 || sub==-2 || sub==10 )
        case 21:
            return (sub==-10 || sub==2 || sub==10 )

        case 8:
            return (sub==-2 || sub==8)
        case 38:
            return (sub==-2 || sub==-12)
        case 10:
            return (sub==10 || sub==2 ||sub==12)

        case 11:
            return (sub==2 || sub==10)
        case 13:
            return (sub==-2 || sub==10)
        case 33:
            return (sub==-2 || sub==-10)
        case 31:
            return (sub==2 || sub==-10)
        case 14:
            return (sub==10|| sub==-2 ||sub==8)
        case 15:
            return (sub==10 ||sub==2)
        case 25:
            return (sub==-10 ||sub==2)
        case 29:
            return (sub==-10 ||sub==-2)
        case 19:
            return (sub==10 ||sub==-2)
        case 30:
            return (sub==-10|| sub==2 || sub==-8)
        case 34:
            return (sub==-10|| sub==-2 ||sub==-12)
        case 12:
            return (sub==-10 || sub==-2 || sub==10 || sub==2 || sub==8 || sub==12)
        case 16:
            return ( sub==10 || sub==2 || sub==-8 || sub==12)
        case 18:
            return (sub==-2 || sub==10  || sub==-12 || sub==8)
        case 22:
            return (sub==-10 || sub==-2 || sub==10 || sub==2 || sub==-12 || sub==-8 || sub==8 || sub==12)
        case 26:
            return (sub==-10  || sub==2 || sub==-8  || sub==12)
        case 28:
            return (sub==-10 || sub==-2 || sub==-12  || sub==8 )
        case 32:
            return (sub==-10 || sub==-2 || sub==10 || sub==2 || sub==-12 || sub==-8 )
        case 20:
            return (sub==-10 || sub==10 || sub==-8|| sub==12 || sub==2)
        case 24:
            return (sub==-10 || sub==10 || sub==8 || sub==-12 || sub==-2)
        case 42:
            return sub==-10
        default:
            return false
    }
}
Position.prototype.worfLive = function() {
    if(this.worfGetLife()){
        this.worfs++
    }
    if(this.isWalk()){
        this.worfs--;
    }
}
Position.prototype.worfGetLife = function() {
    if(this.diedWorf!=0 && this.squares[this.diedWorf]==1){
        this.diedWorf=0;
        return true;
    }

}
Position.prototype.isWalkDetection = function() {
    for (var i = 0; i < arguments.length; i++) {
        if(!(this.squares[arguments[i]]==2||this.squares[arguments[i]]==1)){
            return false;
        }
    }
    return true;
}
Position.prototype.isWalk = function() {
    for (var sq = 0; sq < 45; sq ++) {
        if(this.squares[sq]==1){
            if(sq==this.diedWorf){
                continue;
            }
            switch (sq){
                case 2:
                   if(this.isWalkDetection(6,7,8,12)){
                       this.diedWorf=sq;
                       return true;
                   }
                   break;
                case 6:
                    if(this.isWalkDetection(2,7,8,12,18)){
                        this.diedWorf=sq;
                        return true;
                    }
                    break;
                case 7:
                    if(this.isWalkDetection(2,6,8,12,17)){
                        this.diedWorf=sq;
                        return true;
                    }
                    break;
                case 8:
                    if(this.isWalkDetection(2,6,7,12,16)){
                        this.diedWorf=sq;
                        return true;
                    }
                    break;
                case 10:
                    if(this.isWalkDetection(11,12,15,20,16,22)){
                        this.diedWorf=sq;
                        return true;
                    }
                    break;
                case 11:
                    if(this.isWalkDetection(10,16,21,12,13)){
                        this.diedWorf=sq;
                        return true;
                    }
                    break;
                case 12:
                    if(this.isWalkDetection(11,7,13,17,10,22,14,2,16,18,20,24)){
                        this.diedWorf=sq;
                        return true;
                    }
                    break;
                case 13:
                    if(this.isWalkDetection(11,18,14,12,23)){
                        this.diedWorf=sq;
                        return true;
                    }
                    break;
                case 14:
                    if(this.isWalkDetection(13,18,19,12,22,24)){
                        this.diedWorf=sq;
                        return true;
                    }
                case 15:
                    if(this.isWalkDetection(10,16,20,17)){
                        this.diedWorf=sq;
                        return true;
                    }
                    break;
                case 16:
                    if(this.isWalkDetection(10,11,12,17,22,21,20,15,8,18,28,26)){
                        this.diedWorf=sq;
                        return true;
                    }
                    break;
                case 17:
                    if(this.isWalkDetection(12,18,22,16,7,19,27,15)){
                        this.diedWorf=sq;
                        return true;
                    }
                    break;
                case 18:
                    if(this.isWalkDetection(12,13,14,19,24,23,22,17,6,28,26,16)){
                        this.diedWorf=sq;
                        return true;
                    }
                    break;
                case 19:
                    if(this.isWalkDetection(14,18,24,29,17)){
                        this.diedWorf=sq;
                        return true;
                    }
                case 20:
                    if(this.isWalkDetection(15,16,21,26,25,10,30,32,22,12)){
                        this.diedWorf=sq;
                        return true;
                    }
                    break;
                case 21:
                    if(this.isWalkDetection(16,20,26,22,23,11,31)){
                        this.diedWorf=sq;
                        return true;
                    }
                    break;
                case 22:
                    if(this.isWalkDetection(16,17,18,23,28,27,26,21,10,12,14,24,34,32,30,20)){
                        this.diedWorf=sq;
                        return true;
                    }
                    break;
                case 23:
                    if(this.isWalkDetection(18,22,28,24,13,21,33)){
                        this.diedWorf=sq;
                        return true;
                    }
                    break;
                case 24:
                    if(this.isWalkDetection(19,18,23,28,29,22,12,14,34,32)){
                        this.diedWorf=sq;
                        return true;
                    }
                    break;
                case 25:
                    if(this.isWalkDetection(20,30,26,27)){
                        this.diedWorf=sq;
                        return true;
                    }
                    break;
                case 26:
                    if(this.isWalkDetection(20,21,22,27,32,31,30,25,16,28,18,38)){
                        this.diedWorf=sq;
                        return true;
                    }
                case 27:
                    if(this.isWalkDetection(22,26,28,32,17,25,37,29)){
                        this.diedWorf=sq;
                        return true;
                    }
                    break;
                case 28:
                    if(this.isWalkDetection(24,29,34,33,32,27,22,23,18,16,26,36)){
                        this.diedWorf=sq;
                        return true;
                    }
                    break;
                case 29:
                    if(this.isWalkDetection(24,28,34,27,19)){
                        this.diedWorf=sq;
                        return true;
                    }
                    break;
                case 30:
                    if(this.isWalkDetection(25,26,31,20,22,32)){
                        this.diedWorf=sq;
                        return true;
                    }
                    break;
                case 31:
                    if(this.isWalkDetection(26,30,32,33,21)){
                        this.diedWorf=sq;
                        return true;
                    }
                    break;
                case 32:
                    if(this.isWalkDetection(36,37,38,42,27,26,28,20,22,24,30,31,33,34)){
                        this.diedWorf=sq;
                        return true;
                    }
                    break;
                case 33:
                    if(this.isWalkDetection(32,34,28,31,23)){
                        this.diedWorf=sq;
                        return true;
                    }
                    break;
                case 34:
                    if(this.isWalkDetection(33,29,28,22,24,32)){
                        this.diedWorf=sq;
                        return true;
                    }
                    break;
                case 36:
                    if(this.isWalkDetection(32,37,42,38,28)){
                        this.diedWorf=sq;
                        return true;
                    }
                    break;
                case 37:
                    if(this.isWalkDetection(36,38,42,32,27)){
                        this.diedWorf=sq;
                        return true;
                    }
                    break;
                case 38:
                    if(this.isWalkDetection(36,37,42,32,26)){
                        this.diedWorf=sq;
                        return true;
                    }
                    break;
                case 42:
                    if(this.isWalkDetection(32,36,37,38)){
                        this.diedWorf=sq;
                        return true;
                    }
                    break;
                default:
                    return false
            }
        }
    }

}

Position.prototype.legalMove = function(mv) {
    var sqSrc = SRC(mv);						// ��ȡ�߷������λ��
    var pcSrc = this.squares[sqSrc];			// ��ȡ���λ�õ�����
    var sqDst = DST(mv);				// ��ȡ�߷����յ�λ��
    if(pcSrc==1){
        return this.legalMoveWalk(sqSrc,sqDst) || this.legalMoveJump(sqSrc,sqDst)
    }
    if(pcSrc==2){
        return this.legalMoveWalk(sqSrc,sqDst)
    }
}