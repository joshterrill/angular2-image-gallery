"use strict";
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var http_1 = require("@angular/http");
var animations_1 = require("@angular/platform-browser/animations");
var image_service_1 = require("./services/image.service");
var gallery_component_1 = require("./gallery/gallery.component");
var viewer_component_1 = require("./viewer/viewer.component");
var demo_component_1 = require("./demo/demo.component");
var common_1 = require("@angular/common");
var Angular2ImageGalleryModule = (function () {
    function Angular2ImageGalleryModule() {
    }
    return Angular2ImageGalleryModule;
}());
Angular2ImageGalleryModule.decorators = [
    { type: core_1.NgModule, args: [{
                declarations: [
                    gallery_component_1.GalleryComponent,
                    viewer_component_1.ViewerComponent,
                    demo_component_1.DemoComponent
                ],
                imports: [
                    common_1.CommonModule,
                    forms_1.FormsModule,
                    http_1.HttpModule,
                    animations_1.BrowserAnimationsModule
                ],
                providers: [
                    image_service_1.ImageService
                ],
                bootstrap: [
                    demo_component_1.DemoComponent
                ],
                exports: [
                    gallery_component_1.GalleryComponent,
                    viewer_component_1.ViewerComponent
                ]
            },] },
];
/** @nocollapse */
Angular2ImageGalleryModule.ctorParameters = function () { return []; };
exports.Angular2ImageGalleryModule = Angular2ImageGalleryModule;
//# sourceMappingURL=angular2imagegallery.module.js.map