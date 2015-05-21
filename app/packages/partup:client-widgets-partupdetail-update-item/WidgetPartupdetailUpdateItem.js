/*************************************************************/
/* Widget onCreated */
/*************************************************************/
Template.WidgetPartupdetailUpdateItem.onCreated(function () {
    this.commentInputFieldExpanded = new ReactiveVar(false);
});

/*************************************************************/
/* Widget helpers */
/*************************************************************/
Template.WidgetPartupdetailUpdateItem.helpers({
    partupId: function helperPartupId () {
        return Router.current().params._id;
    },
    activityData: function helperActivityData () {
        var activityId = Template.instance().data.update.type_data.activity_id;
        return Activities.findOne({_id: activityId});
    },
    isDetail: function helperIsDetail (){
        var update_id = Router.current().params.update_id;
        if(update_id) {
            return true;
        } else {
            return false;
        }
    },
    titleKey: function helperTitleKey() {
        return 'partupdetail-update-item-type-' + this.update.type + '-title';
    },

    updateUpper: function helperUpdateUpper() {
        var user = Meteor.users.findOne({_id: this.update.upper_id});

        if (user.profile && user.profile.image) {
            user.profile.image = Images.findOne({_id: user.profile.image});
        }

        return user;
    },

    getImageUrlById: function helperGetImageUrlById(imageId) {
        var image = Images.findOne({_id: imageId});
        if(image) return image.url();
        return '';
    },

    commentInputFieldExpanded: function helperCommentInputFieldExpanded () {
        var commentsPresent = this.update.comments && this.update.comments.length > 0;
        var commentButtonPressed = Template.instance().commentInputFieldExpanded.get();
        return commentsPresent || commentButtonPressed;
    }

});

/*************************************************************/
/* Widget events */
/*************************************************************/
Template.WidgetPartupdetailUpdateItem.events({
    'click [data-expand-comment-field]': function eventClickExpandCommentField (event, template) {
        template.commentInputFieldExpanded.set(true);
        console.log(template);
    }
});