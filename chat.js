var collections = require("./collections");
var Chat;
(function (Chat) {
    var ChatStore = (function () {
        function ChatStore() {
            this.messageLimit = 100;
            this.items = new collections.Queue();
        }
        ChatStore.prototype.add = function (msg) {
            this.items.add(msg);
            this.cleanOldMessages();
        };
        ChatStore.prototype.cleanOldMessages = function () {
            for (var over = this.items.size() - this.messageLimit; over > 0; over--)
                this.items.dequeue();
        };
        ChatStore.prototype.remove = function (msg) {
            var deleted = false;
            this.items.forEach(function (item) {
                if (item.date.getTime() === msg.date.getTime() && item.message === msg.message) {
                    item.message = "Wiadomość usunięta.";
                    deleted = true;
                    return false;
                }
                return true;
            });
            return deleted;
        };
        ChatStore.prototype.getMessagePos = function (msg) {
            var found = -1;
            if (msg == null)
                return found;
            this.items.forEach(function (item, key) {
                if (item.date.getTime() === msg.date.getTime() && item.message === msg.message) {
                    found = key;
                    console.log("found: " + key);
                    return false;
                }
                return true;
            });
            return found;
        };
        ChatStore.prototype.getMessagesBefore = function (msg, amount) {
            var pos = this.getMessagePos(msg);
            if (pos < 0) {
                pos = this.items.size();
            }
            var messages = [];
            var toLoad = amount;
            if (pos < toLoad)
                toLoad = pos;
            console.log("messages: " + this.items.size());
            console.log("pos: " + pos + " , to Load: " + toLoad);
            this.items.forEach(function (item, key) {
                if (key === pos)
                    return false;
                if (key >= pos - toLoad) {
                    messages.push(item);
                }
                return true;
            });
            return messages;
        };
        return ChatStore;
    })();
    Chat.ChatStore = ChatStore;
    (function (EErrorCodes) {
        EErrorCodes[EErrorCodes["BadRequest"] = 0] = "BadRequest";
        EErrorCodes[EErrorCodes["NotFound"] = 1] = "NotFound";
        EErrorCodes[EErrorCodes["Unauthorized"] = 2] = "Unauthorized";
    })(Chat.EErrorCodes || (Chat.EErrorCodes = {}));
    var EErrorCodes = Chat.EErrorCodes;
    function getError(errorCode) {
        switch (errorCode) {
            case EErrorCodes.BadRequest:
                return "ERROR 400: Bad Request.";
            case EErrorCodes.NotFound:
                return "ERROR 404: Not Found.";
            case EErrorCodes.Unauthorized:
                return "ERROR 401. Unauthorized.";
            default:
                return "ERROR 499. Unknown error.";
        }
    }
    Chat.getError = getError;
})(Chat || (Chat = {}));
module.exports = Chat;
//# sourceMappingURL=chat.js.map