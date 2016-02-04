var User = require("./user");
var Chat = require("./chat");
var express = require("express");
var socketio = require("socket.io");
var app = express();
var http = require("http").Server(app);
var io = socketio(http);
var port = process.env.PORT || 3000;
app.get("/", function (req, res) { res.sendfile("chat/index.html"); });
var chatObj = new Chat.ChatStore();
var userObj = new User.UserStore();
var adminKey = "761a5ecac072274f6df2fd973b66a774a2b062652bd89aceeaaebbda40687143";
io.on("connection", function (socket) {
    socket.on("login", function (userData) {
        userObj.store(socket.id, userData);
    });
    socket.on("history", function (msg) {
        if (msg)
            msg.date = new Date(msg.dateStr);
        var messages = chatObj.getMessagesBefore(msg, 10);
        messages.forEach(function (message) {
            socket.emit("history", message);
        });
        console.log("Messages: " + messages.length);
    });
    socket.on("message", function (msg) {
        if (msg == null)
            return;
        var message = {
            user: userObj.get(socket.id),
            message: msg,
            date: new Date(),
            dateStr: new Date().toString()
        };
        chatObj.add(message);
        io.emit("message", message);
        console.log(message.user.username + ": " + message.message);
    });
    socket.on("remove", function (data) {
        if (data) {
            if (data.adminKey === adminKey && data.msg) {
                data.msg.date = new Date(data.msg.dateStr);
                if (chatObj.remove(data.msg)) {
                    data.msg.message = "Wiadomość usunięta.";
                    io.emit("update", data.msg);
                }
                else {
                    var info = { message: Chat.getError(Chat.EErrorCodes.BadRequest) };
                    socket.emit("info", info);
                }
            }
            else {
                var info = { message: Chat.getError(Chat.EErrorCodes.Unauthorized) };
                socket.emit("info", info);
            }
        }
    });
    socket.on("disconnect", function () {
        userObj.remove(socket.id);
    });
});
http.listen(port, function () {
    console.log("listening on *:" + port);
});
//# sourceMappingURL=app.js.map