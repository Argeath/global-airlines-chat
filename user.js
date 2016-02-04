var collections = require("./collections");
var User;
(function (User) {
    var UserStore = (function () {
        function UserStore() {
            this.items = new collections.Dictionary();
        }
        UserStore.prototype.store = function (socketId, user) {
            this.items.setValue(socketId, user);
        };
        UserStore.prototype.get = function (socketId) {
            return this.items.getValue(socketId);
        };
        UserStore.prototype.remove = function (socketId) {
            this.items.remove(socketId);
        };
        return UserStore;
    })();
    User.UserStore = UserStore;
})(User || (User = {}));
module.exports = User;
//# sourceMappingURL=user.js.map