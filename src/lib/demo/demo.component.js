"use strict";
var core_1 = require("@angular/core");
var DemoComponent = (function () {
    function DemoComponent() {
        this.flexBorderSize = 3;
        this.flexImageSize = 7;
        this.galleryName = '';
    }
    DemoComponent.prototype.ngOnInit = function () {
    };
    DemoComponent.prototype.onViewerVisibilityChanged = function (isVisible) {
        console.log('viewer visible: ' + isVisible);
    };
    return DemoComponent;
}());
DemoComponent.decorators = [
    { type: core_1.Component, args: [{
                selector: 'app-demo',
                templateUrl: './demo.component.html',
                styleUrls: ['./demo.component.css']
            },] },
];
/** @nocollapse */
DemoComponent.ctorParameters = function () { return []; };
exports.DemoComponent = DemoComponent;
//# sourceMappingURL=demo.component.js.map