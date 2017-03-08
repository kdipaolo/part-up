Template.DropdownChatNotifications.onCreated(function () {
    var template = this;
    template.isPrivateChat = new ReactiveVar(true);
    template.newMessage = new ReactiveVar(undefined);
    template.latestMessage = 0;
    
    /**
     * The variable name 'dropdownOpen' is very important as it is used by the
     * 'ClientDropdowns' event handler to set the dropdown state. 
     */
    template.dropdownOpen = new ReactiveVar(false);

    template.subscribe('chats.for_loggedin_user', { networks: true, private: true }, {});
});
Template.DropdownChatNotifications.onRendered(function () {
    var template = this;

    ClientDropdowns.addOutsideDropdownClickHandler(
        template,
        '[data-clickoutside-close]',
        '[data-toggle-menu=chat-notifications]',
        function () {
            ClientDropdowns.partupNavigationSubmenuActive.set(false);
        });

    Router.onBeforeAction(function (req, res, next) {
        template.dropdownOpen.set(false);
        next();
    });
});
Template.DropdownChatNotifications.onDestroyed(function () {
    var template = this;
    ClientDropdowns.removeOutsideDropdownClickHandler(template);
});

Template.DropdownChatNotifications.helpers({
    isPrivateChat: function () {
        return Template.instance().isPrivateChat.get();
    },
    dropdownOpen: function () {
        return Template.instance().dropdownOpen.get();
    },
    chatData: function () {
        var template = Template.instance();
        var userId = Meteor.userId();

        if (!userId) return;
        var currentActiveChatId = Session.get('partup-current-active-chat');

        var privateChats =
            Chats.findForUser(userId, { private: true }, { fields: { _id: 1, counter: 1, created_at: 1 }, sort: { updated_at: -1 } })
                .map(function (chat) {
                    chat.creator =
                        Meteor.users.findOne({ _id: { $nin: [userId] }, chats: { $in: [chat._id] } });
                    chat.message =
                        ChatMessages.findOne({ chat_id: chat._id }, { sort: { created_at: -1 }, limit: 1 });
                    return chat;
                });
        var networkChats =
            Chats.findForUser(userId, { networks: true }, { fields: { _id: 1, counter: 1, created_at: 1 }, sort: { updated_at: -1 } })
                .map(function (chat) {
                    chat.message =
                        ChatMessages.findOne({ chat_id: chat._id }, { sort: { created_at: -1 }, limit: 1 });
                    if (chat.message) {
                        chat.message.creator =
                            Meteor.users.findOne({ _id: chat.message.creator_id });
                    }
                    return chat;
                });

        var totalChatMessages = function (chatCollection) {
            return chatCollection
                .map((chat) => {
                    return chat._id === currentActiveChatId ? 0 : chat.unreadCount();
                }).reduce((prev, curr) => {
                    return prev + curr;
                }, 0);
        };

        return {
            chats: template.isPrivateChat.get() ? privateChats : networkChats,
            totalPrivateMessages: totalChatMessages(privateChats),
            totalNetworkMessages: totalChatMessages(networkChats),
            hasNewMessages: function () {

                var latestPrivate =
                    _.max(privateChats.map((chat) => Date.parse(chat.message.created_at)), (milliseconds) => milliseconds);
                var latestNetwork =
                    _.max(networkChats.map((chat) => Date.parse(chat.message.created_at)), (milliseconds) => milliseconds);
                var latest = latestPrivate > latestNetwork ? latestPrivate : latestNetwork;

                var currentState = template.newMessage.get();
                //Logging current state so you can see how many calls are made, the amount annoys me but I guess it's a meteor thing.
                console.log(currentState);
                if (currentState == undefined) {
                    if (this.totalPrivateMessages || this.totalNetworkMessages) {
                        template.newMessage.set(true);
                        template.latestMessage = latest;
                    }
                } else {
                    if (latest > template.latestMessage) {
                        template.newMessage.set(true);
                        template.latestMessage = latest;
                    }
                }
                return template.newMessage.get();
            }
        };
    },
    notificationClickHandler: function () {
        return function () {
            Template.instance().dropdownOpen.set(false);
        };
    },
    appStoreLink: function () {
        return Partup.client.browser.getAppStoreLink();
    }
});

Template.DropdownChatNotifications.events({
    'DOMMouseScroll [data-preventscroll], mousewheel [data-preventscroll]': Partup.client.scroll.preventScrollPropagation,
    //'click [data-toggle-menu]': ClientDropdowns.dropdownClickHandler.bind(null, 'top-level'), //Old implementation.
    'click [data-toggle-menu]': function (event, template) {
        template.newMessage.set(false);
        ClientDropdowns.dropdownClickHandler(event, template);
    },
    'click [data-private]': function (event, template) {
        event.preventDefault();
        template.isPrivateChat.set(true);
    },
    'click [data-network]': function (event, template) {
        event.preventDefault();
        template.isPrivateChat.set(false);
    }
});
