class Controller {
    constructor($scope, $modal, $timeout, $filter, Resource, Search, Chat, Friend, Timer){
        this.$scope = $scope;
        this.$modal = $modal;
        this.$timeout = $timeout;
        this.$filter = $filter;
        this.Resource = Resource;
        this.Search = Search;
        this.Friend = Friend;
        this.API = Chat;
        this.Timer = Timer;

        this.dialogs = null;
        this.queryDialog = '';
        this.queryUser = '';
        this.filteredDialogs = [];
        this.searchedUsers = [];
        this.dialogsInterval = null;
        this.windows = [];
        this.mutedUsers = [];
        this.firendsList = [];
        this.chatsDuration = 5000;
        this.messagesDuration = 5000;
        this.loadingChats = false;
        this.loadingUsers = false;
        this.serverTime = 0;
        this.mode = 'dialogs'; // dialogs | new
        this.lastQueryUser = null;
        this.activeWindow = null;

        this.loadingChats = true;
        this.Friend.getFriends().then((data)=>{
            this.firendsList = data.friends;

            this.loadListChats(true);
        });

        this.dialogsInterval = this.Timer.addInterval(()=>{
            this.loadListChats();
        }, this.chatsDuration);

        this.$scope.$on("$destroy", ()=>{
            if (this.dialogsInterval) {
                this.Timer.cancelInterval(this.dialogsInterval);
                this.dialogsInterval = undefined;
            }

            _.each(this.windows, (chat)=>{
                if (chat.interval) {
                    this.Timer.cancelInterval(chat.interval);
                    chat.interval = undefined;
                }
            });
        });
    }

    focusOnChat(chat){
        if (!this.activeWindow || chat.id !== this.activeWindow.id) {
            this.activeWindow = chat;
            _.each(this.windows, (item)=>{
                item.isEnterMessage = false;
            });
            this.activeWindow.isEnterMessage = true;
        }
    }

    newChat(){
        this.mode = 'new';
        this.queryUser = '';
        this.searchedUsers = [];
    }

    loadListChats(isShowPreloader = false){
        if (isShowPreloader) this.loadingChats = true;

        this.API.getListChats().then((data)=>{
            if (!angular.equals(this.dialogs, data.list)) {
                var countUnreadedMessages = 0;

                this.dialogs = data.list;

                _.forEach(this.dialogs, (item)=>{
                    countUnreadedMessages += item.unread_messages;
                });

                this.$scope.home.unreadedMessages = countUnreadedMessages;

                this.filteredDialogs = this.queryDialog ? this.filteredDialogs : this.dialogs;
            };

            if (isShowPreloader) {
                this.timeDifference = data.timeDifference;
            }
        }).finally(()=>{
            if (isShowPreloader) this.loadingChats = false;
        });
    }

    filterDialogs(){
        if (this.dialogs) {
            if (this.queryDialog) {
                this.filteredDialogs = _.filter(this.dialogs, (room)=>{
                    var title = `${room.user.information.firstname || ''} ${room.user.information.lastname || ''} ${room.user.information.nickname || ''} ${room.user.email || ''} ${room.user.id || ''}`;
                    var reg = new RegExp(this.queryDialog, 'ig');

                    return reg.test(title);
                });
            } else {
                this.filteredDialogs = this.dialogs;
            }

            this.$timeout(()=>{
                this.rebuildDialogsScrollbar();
            }, 250);
        };
    }

    searchUsers(query){
        if (query) {
            this.lastQueryUser = query;

            if (!this.loadingUsers) {
                this.loadingUsers = true;

                this.Search.search(query).then((list)=>{
                    this.searchedUsers = _.union(list.friends, list.in, list.out, list.other);
                }).finally(()=>{
                    this.$timeout(()=>{
                        this.rebuildUsersScrollbar();
                        this.loadingUsers = false;
                    }, 250);

                    if (query !== this.lastQueryUser) this.searchUsers(this.lastQueryUser);
                });
            }
        } else {
            this.lastQueryUser = '';
            this.searchedUsers = [];

            this.$timeout(()=>{
                this.rebuildUsersScrollbar();
            }, 250);
        }
    }

    rebuildDialogsScrollbar(){
        this.$scope.$broadcast('scrollbar:rebuild:dialogs');
    }

    rebuildUsersScrollbar(){
        this.$scope.$broadcast('scrollbar:rebuild:users');
    }

    rebuildMessagesScrollbar(chat){
        this.$timeout(()=>{
            this.$scope.$broadcast(`scrollbar:rebuild:chat-${chat.id}`);
        }, 250);
    }

    openChat(user){
        var chat, room, limit;

        if (this.mode === 'new') this.mode = 'dialogs';

        chat = {
            id: user.id,
            user: user,
            messages: [],
            message: '',
            isLoading: true,
            isOpenMenu: false,
            isEnterMessage: true,
            interval: null,
            points: {},
            styles: {}
        };

        room = _.find(this.dialogs, (room)=>{
            return room.user.id === user.id;
        });

        limit = room ? room.unread_messages + 10 : 10;

        this.API.getHistory(user, limit).then((data)=>{
            var points = data.meta.CHAT_DAILY_MESSAGE_REWARD ? data.meta.CHAT_DAILY_MESSAGE_REWARD : 0;

            this.addPointsToUser(points);

            chat.messages = data.messages;
            chat.points = data.meta.CHAT_DAILY_REWARDED_MESSAGES;

            chat.interval = this.Timer.addInterval(()=>{
                this.loadMessages(user).then((response)=>{
                    var points = response.meta.CHAT_DAILY_MESSAGE_REWARD ? response.meta.CHAT_DAILY_MESSAGE_REWARD : 0;

                    this.addPointsToUser(points);

                    chat.messages = _.union(chat.messages, response.messages);
                    _.extend(chat.points, response.meta.CHAT_DAILY_REWARDED_MESSAGES);
                });
            }, this.messagesDuration);
        }).finally(()=>{
            chat.isLoading = false;
        });

        this.windows.push(chat);

        this.focusOnChat(chat);
    }

    // update jelly points and animate them
    addPointsToUser(points){
        if (points > 0) {
            var wallet = _.findWhere(this.$scope.user.model.wallets, { type: 'JELLY' });

            wallet.value += points;
            this.$scope.user.updatePoints(points);
        }
    }

    toggleChat(user){
        if (this.isActiveUser(user)) {
            var chat = _.findWhere(this.windows, { id: user.id });

            this.Timer.cancelInterval(chat.interval);
            this.windows.splice(_.indexOf(this.windows, chat), 1);

            if (this.activeWindow.id === chat.id) {
                this.activeWindow = this.windows.length ? this.windows[this.windows.length - 1] : null;
            }
        } else {
            this.openChat(user);
        }
    }

    isActiveUser(user){
        return angular.isDefined(_.findWhere(this.windows, { id: user.id }));
    }

    loadMessages(user){
        return this.API.getMessagesFromUser(user);
    }

    openMuteDialog(chat){
        chat.isOpenMenu = false;

        var modalInstance = this.$modal.open({
            templateUrl: this.mutedUsers[chat.user.id] ? 'chat-unmute.html' : 'chat-mute.html',
            controller: 'ChatModal as modal',
            windowClass: 'confirm-modal'
        });

        modalInstance.result.then((action)=>{
            switch (action){
                case 'mute':
                    this.mutedUsers[chat.user.id] = true;
                    break;
                case 'unmute':
                    this.mutedUsers[chat.user.id] = false;
                    break;
            };
        });
    }

    getTitleOfRoom(user){
        var title = '';

        if (angular.isObject(user)) {
            if (user.information.firstname && user.information.lastname) {
                title = `${user.information.firstname} ${user.information.lastname}`;
            } else if (user.information.nickname) {
                title = user.information.nickname;
            } else if (user.email) {
                title = user.email;
            } else {
                title = `#${user.id}`;
            }
        }

        return title;
    }

    sendMessage(event, chat){
        if (event.which == 13) {
            if (event.ctrlKey === false && event.altKey === false && event.shiftKey === false) {
                event.preventDefault();

                this.API.sendMessageToUser(chat.user, chat.message).then((message)=>{
                    chat.messages.push(message);
                });

                chat.message = '';
            }
        }
    }

    getRelativeDate(timestamp){
        return this.$filter('relativeDate')(new Date((parseInt(timestamp, 10) * 1000) - this.timeDifference));
    }
}

export default Controller;
