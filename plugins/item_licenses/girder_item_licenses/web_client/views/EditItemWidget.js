import $ from 'jquery';
import _ from 'underscore';

import EditItemWidget from '@girder/core/views/widgets/EditItemWidget';
import { wrap } from '@girder/core/utilities/PluginUtils';

import SelectLicenseWidget from './SelectLicenseWidget';

/**
 * Add select license widget to the edit item widget.
 */
wrap(EditItemWidget, 'render', function (render) {
    render.call(this);

    if (_.has(this.parentView, 'licenses')) {
        let currentLicense = null;
        if (this.item && this.item.has('license')) {
            currentLicense = this.item.get('license');
        }

        const selectLicenseWidget = new SelectLicenseWidget({
            licenses: this.parentView.licenses,
            currentLicense: currentLicense,
            parentView: this
        }).render();

        $('.modal-body > .form-group').last().after(selectLicenseWidget.el);

        delete this.parentView.licenses;
    }

    return this;
});

/**
 * Extend edit item widget to add license field when updating an item.
 */
wrap(EditItemWidget, 'updateItem', function (updateItem) {
    const fields = arguments[1];
    fields['license'] = this.$('#g-license').val();
    updateItem.call(this, fields);
    return this;
});

/**
 * Extend edit item widget to add license field when creating an item.
 */
wrap(EditItemWidget, 'createItem', function (createItem) {
    const fields = arguments[1];
    fields['license'] = this.$('#g-license').val();
    createItem.call(this, fields);
    return this;
});
