"use strict";
var core_1 = require("@angular/core");
var http_1 = require("@angular/http");
var image_service_1 = require("../services/image.service");
require("rxjs/add/operator/map");
var GalleryComponent = (function () {
    function GalleryComponent(ImageService, http, ChangeDetectorRef) {
        var _this = this;
        this.ImageService = ImageService;
        this.http = http;
        this.ChangeDetectorRef = ChangeDetectorRef;
        this.providedImageMargin = 3;
        this.providedImageSize = 7;
        this.providedGalleryName = '';
        this.providedMetadataUri = undefined;
        this.providedMetadataArray = undefined;
        this.canRemoveImage = false;
        this.viewerChange = new core_1.EventEmitter();
        this.selectedImage = new core_1.EventEmitter();
        this.removeImage = new core_1.EventEmitter();
        this.gallery = [];
        this.imageDataStaticPath = 'assets/img/gallery/';
        this.imageDataCompletePath = '';
        this.dataFileName = 'data.json';
        this.images = [];
        this.minimalQualityCategory = 'preview_xxs';
        this.isSelectedImageUsed = false;
        window.addEventListener('scroll', function (e) {
            _this.scaleGallery();
        }, true);
    }
    // Replaced with window.addEventListener
    /*@HostListener('scroll', ['$event']) triggerCycle(event : any) {
        this.scaleGallery()
    }*/
    GalleryComponent.prototype.windowResize = function (event) {
        if (this.galleryContainer.nativeElement.id === this.uuid) {
            this.containerWidth = this.galleryContainer.nativeElement.clientWidth === 0 ? this.galleryContainer.nativeElement.scrollWidth : this.galleryContainer.nativeElement.clientWidth;
        }
        this.render();
    };
    GalleryComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.fetchDataAndRender();
        this.viewerSubscription = this.ImageService.showImageViewerChanged$
            .subscribe(function (visibility) {
            _this.viewerChange.emit(visibility);
            _this.viewerShown = visibility;
        });
        this.isSelectedImageUsed = this.selectedImage.observers.length > 0;
        this.uuid = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        this.containerWidth = this.galleryContainer.nativeElement.clientWidth === 0 ? this.galleryContainer.nativeElement.scrollWidth : this.galleryContainer.nativeElement.clientWidth;
    };
    GalleryComponent.prototype.ngOnChanges = function (changes) {
        // input params changed
        if (changes["providedGalleryName"] != null)
            this.fetchDataAndRender();
        else
            this.render();
    };
    GalleryComponent.prototype.ngOnDestroy = function () {
        if (this.viewerSubscription) {
            this.viewerSubscription.unsubscribe();
        }
    };
    GalleryComponent.prototype.openImageViewer = function (img) {
        // console.log(img);
        if (this.isSelectedImageUsed) {
            this.selectedImage.emit(img);
        }
        else {
            this.ImageService.updateImages(this.images);
            this.ImageService.updateSelectedImageIndex(this.images.indexOf(img));
            this.ImageService.showImageViewer(true);
        }
    };
    GalleryComponent.prototype.removeMedia = function (img) {
        this.removeImage.emit(img);
    };
    GalleryComponent.prototype.fetchDataAndRender = function () {
        var _this = this;
        if (this.providedMetadataUri && this.providedMetadataArray) {
            console.error('You have provided both [providedMetadataUri] and [providedMetadataArray]. Please choose one or the other.');
            return;
        }
        if (this.providedMetadataUri) {
            this.imageDataCompletePath = this.providedMetadataUri;
            if (!this.providedMetadataUri) {
                this.imageDataCompletePath = this.providedGalleryName != '' ?
                    this.imageDataStaticPath + this.providedGalleryName + '/' + this.dataFileName :
                    this.imageDataStaticPath + this.dataFileName;
            }
            this.http.get(this.imageDataCompletePath)
                .map(function (res) { return res.json(); })
                .subscribe(function (data) {
                _this.images = data;
                _this.ImageService.updateImages(_this.images);
                _this.images.forEach(function (image) {
                    image['galleryImageLoaded'] = false;
                    image['viewerImageLoaded'] = false;
                    image['srcAfterFocus'] = '';
                });
                // twice, single leads to different strange browser behaviour
                _this.render();
                _this.render();
            }, function (err) { return _this.providedMetadataUri ?
                console.error("Provided endpoint '" + _this.providedMetadataUri + "' did not serve metadata correctly or in the expected format. \n\nSee here for more information: https://github.com/BenjaminBrandmeier/angular2-image-gallery/blob/master/docs/externalDataSource.md,\n\nOriginal error: " + err) :
                console.error("Did you run the convert script from angular2-image-gallery for your images first? Original error: " + err); }, function () { return undefined; });
        }
        else if (this.providedMetadataArray) {
            setTimeout(function () {
                _this.images = _this.providedMetadataArray;
                _this.ImageService.updateImages(_this.images);
                _this.images.forEach(function (image) {
                    image['galleryImageLoaded'] = false;
                    image['viewerImageLoaded'] = false;
                    image['srcAfterFocus'] = '';
                });
                // twice, single leads to different strange browser behaviour
                _this.render();
                _this.render();
            }, 250);
        }
    };
    GalleryComponent.prototype.render = function () {
        this.gallery = [];
        var tempRow = [this.images[0]];
        var rowIndex = 0;
        var i = 0;
        for (i; i < this.images.length; i++) {
            while (this.images[i + 1] && this.shouldAddCandidate(tempRow, this.images[i + 1])) {
                i++;
            }
            if (this.images[i + 1]) {
                tempRow.pop();
            }
            this.gallery[rowIndex++] = tempRow;
            tempRow = [this.images[i + 1]];
        }
        this.scaleGallery();
    };
    GalleryComponent.prototype.shouldAddCandidate = function (imgRow, candidate) {
        var oldDifference = this.calcIdealHeight() - this.calcRowHeight(imgRow);
        imgRow.push(candidate);
        var newDifference = this.calcIdealHeight() - this.calcRowHeight(imgRow);
        return Math.abs(oldDifference) > Math.abs(newDifference);
    };
    GalleryComponent.prototype.calcRowHeight = function (imgRow) {
        var originalRowWidth = this.calcOriginalRowWidth(imgRow);
        var ratio = (this.getGalleryWidth() - (imgRow.length - 1) * this.calcImageMargin()) / originalRowWidth;
        return imgRow[0][this.minimalQualityCategory]['height'] * ratio;
    };
    GalleryComponent.prototype.calcImageMargin = function () {
        var galleryWidth = this.getGalleryWidth();
        var ratio = galleryWidth / 1920;
        return Math.round(Math.max(1, this.providedImageMargin * ratio));
    };
    GalleryComponent.prototype.calcOriginalRowWidth = function (imgRow) {
        var _this = this;
        var originalRowWidth = 0;
        imgRow.forEach(function (img) {
            var individualRatio = _this.calcIdealHeight() / img[_this.minimalQualityCategory]['height'];
            img[_this.minimalQualityCategory]['width'] = img[_this.minimalQualityCategory]['width'] * individualRatio;
            img[_this.minimalQualityCategory]['height'] = _this.calcIdealHeight();
            originalRowWidth += img[_this.minimalQualityCategory]['width'];
        });
        return originalRowWidth;
    };
    GalleryComponent.prototype.calcIdealHeight = function () {
        return this.getGalleryWidth() / (80 / this.providedImageSize) + 100;
    };
    GalleryComponent.prototype.getGalleryWidth = function () {
        return this.containerWidth;
    };
    GalleryComponent.prototype.scaleGallery = function () {
        var _this = this;
        var imageCounter = 0;
        var maximumGalleryImageHeight = 0;
        this.gallery.forEach(function (imgRow) {
            var originalRowWidth = _this.calcOriginalRowWidth(imgRow);
            var ratio = 1;
            if (imgRow !== _this.gallery[_this.gallery.length - 1]) {
                ratio = (_this.getGalleryWidth() - (imgRow.length - 1) * _this.calcImageMargin()) / originalRowWidth;
            }
            imgRow.forEach(function (img) {
                img['width'] = img[_this.minimalQualityCategory]['width'] * ratio;
                img['height'] = img[_this.minimalQualityCategory]['height'] * ratio;
                maximumGalleryImageHeight = Math.max(maximumGalleryImageHeight, img['height']);
                _this.checkForAsyncLoading(img, imageCounter++);
            });
        });
        this.minimalQualityCategory = maximumGalleryImageHeight > 375 ? 'preview_xs' : 'preview_xxs';
        this.ChangeDetectorRef.detectChanges();
    };
    GalleryComponent.prototype.checkForAsyncLoading = function (image, imageCounter) {
        var imageElements = this.imageElements.toArray();
        if (image['galleryImageLoaded'] || (imageElements.length > 0 && this.isScrolledIntoView(imageElements[imageCounter].nativeElement))) {
            image['galleryImageLoaded'] = true;
            image['srcAfterFocus'] = image[this.minimalQualityCategory]['path'];
        }
        else {
            image['srcAfterFocus'] = '';
        }
    };
    GalleryComponent.prototype.isScrolledIntoView = function (element) {
        var elementTop = element.getBoundingClientRect().top;
        var elementBottom = element.getBoundingClientRect().bottom;
        return elementTop < window.innerHeight && elementBottom >= 0 && (elementBottom > 0 || elementTop > 0);
    };
    return GalleryComponent;
}());
GalleryComponent.decorators = [
    { type: core_1.Component, args: [{
                selector: 'gallery',
                templateUrl: './gallery.component.html',
                styleUrls: ['./gallery.component.css']
            },] },
];
/** @nocollapse */
GalleryComponent.ctorParameters = function () { return [
    { type: image_service_1.ImageService, },
    { type: http_1.Http, },
    { type: core_1.ChangeDetectorRef, },
]; };
GalleryComponent.propDecorators = {
    'providedImageMargin': [{ type: core_1.Input, args: ['flexBorderSize',] },],
    'providedImageSize': [{ type: core_1.Input, args: ['flexImageSize',] },],
    'providedGalleryName': [{ type: core_1.Input, args: ['galleryName',] },],
    'providedMetadataUri': [{ type: core_1.Input, args: ['metadataUri',] },],
    'providedMetadataArray': [{ type: core_1.Input, args: ['metadataArray',] },],
    'canRemoveImage': [{ type: core_1.Input, args: ['canRemoveImage',] },],
    'viewerChange': [{ type: core_1.Output },],
    'selectedImage': [{ type: core_1.Output },],
    'removeImage': [{ type: core_1.Output },],
    'galleryContainer': [{ type: core_1.ViewChild, args: ['galleryContainer',] },],
    'imageElements': [{ type: core_1.ViewChildren, args: ['imageElement',] },],
    'windowResize': [{ type: core_1.HostListener, args: ['window:resize', ['$event'],] },],
};
exports.GalleryComponent = GalleryComponent;
//# sourceMappingURL=gallery.component.js.map