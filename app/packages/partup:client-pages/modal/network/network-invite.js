Template.modal_network_invite.onCreated(function() {
    var self = this;
    self.userIds = new ReactiveVar([]);
    self.subscription = new ReactiveVar();
    self.suggestionsOptions = new ReactiveVar({});

    // Submit filter form
    self.submitFilterForm = function() {
        Meteor.defer(function() {
            var form = self.find('form#suggestionsQuery');
            $(form).submit();
        });
    };

    // Location filter datamodel
    self.location = {
        value: new ReactiveVar(),
        selectorState: new ReactiveVar(false, function(a, b) {
            if (!b) return;

            // Focus the searchfield
            Meteor.defer(function() {
                var searchfield = self.find('form#locationSelector').elements.search;
                if (searchfield) searchfield.focus();
            });
        }),
        selectorData: function() {
            var DROPDOWN_ANIMATION_DURATION = 200;

            return {
                onSelect: function(location) {
                    self.location.selectorState.set(false);

                    Meteor.setTimeout(function() {
                        self.location.value.set(location);
                        self.submitFilterForm();
                    }, DROPDOWN_ANIMATION_DURATION);
                }
            };
        }
    };

    self.autorun(function() {
        var networkId = self.data.networkId;
        var options = self.suggestionsOptions.get();

        Meteor.call('networks.user_suggestions', networkId, options, function(err, userIds) {
            if (err) {
                Partup.client.notify.error(err.reason);
                return;
            }

            self.userIds.set(userIds);
            self.subscription.set(self.subscribe('users.by_ids', userIds));
        });
    });
});

Template.modal_network_invite.helpers({
    suggestions: function() {
        var sub = Template.instance().subscription.get();
        if (!sub || !sub.ready()) return;

        var suggestions = [];
        var userIds = Template.instance().userIds.get();
        for (var i = 0; i < userIds.length; i++) {
            suggestions.push(Meteor.users.findOne({_id: userIds[i]}));
        }

        return suggestions;
    },

    // Location
    locationValue: function() {
        return Template.instance().location.value.get();
    },
    locationSelectorState: function() {
        return Template.instance().location.selectorState;
    },
    locationSelectorData: function() {
        return Template.instance().location.selectorData;
    }
});

Template.modal_network_invite.events({
    'click [data-invite-id]': function(event, template) {
        var networkId = template.data.networkId;
        var userId = event.target.dataset.inviteId;

        Meteor.call('networks.invite', networkId, userId, function(err) {
            if (err) {
                Partup.client.notify.error(err.reason);
                return;
            }

            Partup.client.notify.success(__('pages-modal-network_invite-invite-success'));
        });
    },

    'submit form#suggestionsQuery': function(event, template) {
        event.preventDefault();

        var form = event.currentTarget;

        template.suggestionsOptions.set({
            query: form.elements.search_query.value || undefined,
            locationId: form.elements.location_id.value || undefined
        });

        window.scrollTo(0, 0);
    },

    // Location selector events
    'click [data-open-locationselector]': function(event, template) {
        var current = template.location.selectorState.get();
        template.location.selectorState.set(!current);
    },
    'click [data-reset-selected-location]': function(event, template) {
        event.stopPropagation();
        template.location.value.set('');
        template.submitFilterForm();
    }
});