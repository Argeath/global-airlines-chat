import collections = require("./collections");
import Chat = require("./chat");

module User {
    export interface IUserData {
        id: number;
        username: string;
        thumbnail: string;
    }

    export class UserStore {
        items: collections.Dictionary<string, IUserData>;

        constructor() {
            this.items = new collections.Dictionary<string, IUserData>();
        }

        store(socketId: string, user: IUserData): void {
            this.items.setValue(socketId, user);
        }

        get(socketId: string) {
            return this.items.getValue(socketId);
        }

        remove(socketId: string) {
            this.items.remove(socketId);
        }
    }

    export interface IAdmin {
        adminKey: string;
    }

    export interface IAdminRemove extends IAdmin {
        msg: Chat.IMessage;
    }
}

export = User;