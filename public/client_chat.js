var port = process.env.PORT || 5000;
var socket = io.connect("ws://localhost:" + port);
var username = (Math.random() * 10 >= 5) ? "Arg" : "Arg2";
var isAdmin = false;

function addMessage(msg, front) {
    var tr = $("<div/>", {
        "class": "msg",
        "msg_date": msg.date,
        "msg_text": msg.message,
        "msg_user_id": msg.user.id
    });

    var msgDate = new Date(msg.date);

    var userText = $("<div/>", {
        "class": "msg_user"
    });

    if (msg.user.photo) {
        userText.prepend($("<img/>", {
            src: msg.user.photo,
            "class": "avatar"
        }));
    }
    userText.append($("<span/>").text(msg.user.username + ":"));
    tr.append(userText);

    tr.append($("<div/>", {
        "class": "msg_text"
    }).text(msg.message));

    tr.append($("<div/>", {
        "class": "msg_date"
    }).text(msg.date));

    if (isAdmin) {
        tr.append($("<div/>", {
            "class": "msg_remove"
        }).append($("<div/>", {
            "class" : "removeMessage"
        }).on("click", function(event) {
            event.preventDefault();

            var row = $(this).parent().parent();
            var newMsg = {
                dateStr: row.attr("msg_date"),
                message: row.attr("msg_text"),
                user: {
                    id: row.attr("msg_user_id")
                }
            };

            socket.emit("remove", {
                "adminKey": $("#adminKey").val(),
                "msg": newMsg
            });
        }).append($("<i/>", {
            "class": "fa fa-times"
        }))));
    }

    if (front) {
        $("#content").append(tr);
        $("#content").animate({ scrollTop: $("#content").height() }, "slow");
        return true;
    }

    var last;
    $("#content > div").each(function () {
        var thisDate = new Date($(this).attr("msg_date"));
        if (msgDate > thisDate)
            last = this;
        else
            return false;
        return true;
    });
    if (last)
        $(last).after(tr);
    else
        $("#content").prepend(tr);
    return true;
}

function addInfoMessage(msg) {
    var tr = $("<div/>", {
        "class": "msg"
    });

    tr.append($("<div/>", {
        "class": "msg_text"
    }).text(msg.message));

    $("#content").append(tr);
    $("#content").animate({ scrollTop: $("#content").height() }, "slow");
    return true;
}

socket.on("connect", function() {
    socket.emit("login", {
        id: Math.round(Math.random() * 10),
        username: username,
        photo: "https://www.petfinder.com/wp-content/uploads/2012/11/140272627-grooming-needs-senior-cat-632x475.jpg"
    });

    socket.emit("history", null);

    socket.on("message", function (msg) {
        addMessage(msg, true);
    });

    socket.on("history", function (msg) {
        addMessage(msg, false);
    });

    socket.on("update", function(msg) {
        $("#content > div").each(function() {
            if (msg.date === $(this).attr("date") && msg.user.id == $(this).attr("msg_user_id")) {
                $("#this").find(".msg_text").text(msg.message);
            }
        });
    });

    socket.on("info", function(info) {
        addInfoMessage(info);
    });
});

function sendMessage() {
    var text = $.trim($("#text").val());
    if (text === "")
        return;

    socket.emit("message", text);
    $("#text").val("");
    $("#text").focus();
}

$(function () {
    $("#username").val(username);
    isAdmin = $("#adminKey").val() !== "";

    $("#sendMessage").on("click", function (event) {
        event.preventDefault();
        sendMessage();
    });

    $("#text").on("keypress", function(e) {
        if (e.which === 13) {
            sendMessage();
        }
    });

    $("#loadMore").on("click", function (event) {
        event.preventDefault();
        $("#content").stop(true).animate({ scrollTop: 0 }, "slow");

        var lastMessage = $("#content > div").first();
        var msg = {
            dateStr: lastMessage.attr("msg_date"),
            message: lastMessage.attr("msg_text"),
            user: {
                id: lastMessage.attr("msg_user_id")
            }
        };

        socket.emit("history", msg);
    });
});

