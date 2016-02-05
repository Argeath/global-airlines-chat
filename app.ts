/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/node/node.d.ts" />
/// <reference path="typings/express/express.d.ts" />
/// <reference path="typings/serve-static/serve-static.d.ts" />
/// <reference path="typings/socket.io/socket.io.d.ts" />

import User = require("./user");
import Chat = require("./chat");

import * as express from "express";
import * as socketio from "socket.io";

var app = express();
var http = require("http").Server(app);
var io = socketio(http);

var port = process.env.PORT || 3000;
process.env.PWD = process.cwd();

app.use("/static", express.static("public"));

app.get("/", (req : express.Request, res: express.Response) => { res.sendfile("index.html"); });

var chatObj = new Chat.ChatStore();
var userObj = new User.UserStore();

var adminKey = "761a5ecac072274f6df2fd973b66a774a2b062652bd89aceeaaebbda40687143";

io.on("connection", (socket) => {
    socket.on("login", (userData : User.IUserData) => {
        userObj.store(socket.id, userData);
    });

    socket.on("history", (msg: Chat.IMessage) => {
        if(msg)
            msg.date = new Date(msg.dateStr);

        var messages = chatObj.getMessagesBefore(msg, 10);
        messages.forEach((message: Chat.IMessage) => {
            socket.emit("history", message);
        });
        console.log("Messages: " + messages.length);
    });
    
    socket.on("message", (msg: string) => {
        if (msg == null) return;

        var message: Chat.IMessage = {
            user: userObj.get(socket.id),
            message: msg,
            date: new Date(),
            dateStr: new Date().toString()
        };

        chatObj.add(message);
        io.emit("message", message);
        console.log(message.user.username + ": " + message.message);
    });

    socket.on("remove", (data: User.IAdminRemove) => {
        if (data) {
            if (data.adminKey === adminKey && data.msg) {
                data.msg.date = new Date(data.msg.dateStr);

                if (chatObj.remove(data.msg)) {
                    data.msg.message = "Wiadomość usunięta.";
                    io.emit("update", data.msg);
                } else {
                    const info: Chat.IInfo = { message: Chat.getError(Chat.EErrorCodes.BadRequest) };
                    socket.emit("info", info);
                }
            } else {
                const info: Chat.IInfo = { message: Chat.getError(Chat.EErrorCodes.Unauthorized) };
                socket.emit("info", info);
            }
        }
    });

    socket.on("disconnect", () => {
        userObj.remove(socket.id);
    });
});

http.listen(port, () => {
    console.log("listening on *:" + port);
});