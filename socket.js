/**
 * Created by liang on 2017/8/24.
 */
var socket = io.connect('http://101.236.29.78:3000');
socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
});