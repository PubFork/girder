import LayoutHeaderTemplate from 'girder/templates/layout/layoutHeader.jade';
import LayoutHeaderUserView from 'girder/views/layout/HeaderUserView';
import router               from 'girder/router';
import SearchFieldWidget    from 'girder/views/widgets/SearchFieldWidget';
import View                 from 'girder/view';

/**
 * This view shows the header in the layout.
 */
export var LayoutHeaderView = View.extend({
    events: {
        'click .g-app-title': function () {
            router.navigate('', {trigger: true});
        }
    },

    initialize: function () {
        this.userView = new LayoutHeaderUserView({
            parentView: this
        });

        this.searchWidget = new SearchFieldWidget({
            placeholder: 'Quick search...',
            types: ['item', 'folder', 'group', 'collection', 'user'],
            parentView: this
        }).on('g:resultClicked', function (result) {
            this.searchWidget.resetState();
            router.navigate(result.type + '/' + result.id, {
                trigger: true
            });
        }, this);
    },

    render: function () {
        this.$el.html(LayoutHeaderTemplate());

        this.userView.setElement(this.$('.g-current-user-wrapper')).render();
        this.searchWidget.setElement(this.$('.g-quick-search-container')).render();
    }
});
