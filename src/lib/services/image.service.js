"use strict";
var core_1 = require("@angular/core");
var Subject_1 = require("rxjs/Subject");
var ImageService = (function () {
    function ImageService() {
        this.imagesUpdatedSource = new Subject_1.Subject();
        this.imageSelectedIndexUpdatedSource = new Subject_1.Subject();
        this.showImageViewerSource = new Subject_1.Subject();
        this.imagesUpdated$ = this.imagesUpdatedSource.asObservable();
        this.imageSelectedIndexUpdated$ = this.imageSelectedIndexUpdatedSource.asObservable();
        this.showImageViewerChanged$ = this.showImageViewerSource.asObservable();
    }
    ImageService.prototype.updateImages = function (images) {
        this.imagesUpdatedSource.next(images);
    };
    ImageService.prototype.updateSelectedImageIndex = function (newIndex) {
        this.imageSelectedIndexUpdatedSource.next(newIndex);
    };
    ImageService.prototype.showImageViewer = function (show) {
        this.showImageViewerSource.next(show);
    };
    return ImageService;
}());
ImageService.decorators = [
    { type: core_1.Injectable },
];
/** @nocollapse */
ImageService.ctorParameters = function () { return []; };
exports.ImageService = ImageService;
//# sourceMappingURL=image.service.js.map