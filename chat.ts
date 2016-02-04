import User = require("./user");
import collections = require("./collections");

module Chat {
    export class ChatStore {
        items: collections.Queue<IMessage>;

        private messageLimit = 100;

        constructor() {
            this.items = new collections.Queue<IMessage>();
        }

        add(msg: IMessage): void {
            this.items.add(msg);
            this.cleanOldMessages();
        }

        private cleanOldMessages(): void {
            for (var over = this.items.size() - this.messageLimit; over > 0; over--)
                this.items.dequeue();
        }

        remove(msg: IMessage): boolean {
            let deleted = false;
            this.items.forEach((item: IMessage) => {
                if (item.date.getTime() === msg.date.getTime() && item.message === msg.message) {
                    item.message = "Wiadomość usunięta.";
                    deleted = true;
                    return false;
                }
                return true;
            });
            return deleted;
        }

        private getMessagePos(msg: IMessage): number {
            var found = -1;
            if (msg == null) return found;
            this.items.forEach((item: IMessage, key: number): boolean => {
                if (item.date.getTime() === msg.date.getTime() && item.message === msg.message) {
                    found = key;
                    console.log("found: " + key);
                    return false;
                }
                return true;
            });

            return found;
        }

        getMessagesBefore(msg: IMessage, amount: number): Array<IMessage> {
            let pos = this.getMessagePos(msg);
            if (pos < 0) {
                pos = this.items.size();
            }
            let messages: Array<IMessage> = [];

            let toLoad = amount;
            if (pos < toLoad)
                toLoad = pos;

            console.log("messages: " + this.items.size());
            console.log("pos: " + pos + " , to Load: " + toLoad);

            this.items.forEach((item: IMessage, key: number): boolean => {
                if (key === pos) return false;
                if (key >= pos - toLoad) {
                    messages.push(item);
                }
                return true;
            });

            return messages;
        }
    }

    export interface IInfo {
        message: string;
    }

    export interface IMessage extends IInfo {
        user: User.IUserData;
        date: Date;
        dateStr: string;
    }

    export enum EErrorCodes {
        BadRequest,
        NotFound,
        Unauthorized
    }

    export function getError(errorCode: EErrorCodes) : string {
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
}

export = Chat;