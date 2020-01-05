import Collection from '@girder/core/collections/Collection';
import FolderModel from '@girder/core/models/FolderModel';

const FolderCollection = Collection.extend({
    resourceName: 'folder',
    model: FolderModel,

    pageLimit: 100
});

export default FolderCollection;
