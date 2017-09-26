import {
    Component, ViewChild, ElementRef, HostListener, ViewChildren,
    ChangeDetectorRef, QueryList, OnInit, Input, SimpleChanges, OnChanges, Output, EventEmitter, OnDestroy
} from "@angular/core";
import {Http, Response} from "@angular/http";
import {ImageService} from "../services/image.service";
import {Subscription} from 'rxjs/Subscription';
import 'rxjs/add/operator/map';

// hack to get access to window
declare let window: any;

@Component({
    selector: 'gallery',
    templateUrl: './gallery.component.html',
    styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit, OnDestroy, OnChanges {
    @Input('flexBorderSize') providedImageMargin: number = 3;
    @Input('flexImageSize') providedImageSize: number = 7;
    @Input('galleryName') providedGalleryName: string = '';
    @Input('metadataUri') providedMetadataUri: string = undefined;
    @Input('metadataArray') providedMetadataArray: Array<any> = undefined;
    @Input('canRemoveImage') canRemoveImage: boolean = false;

    @Output() viewerChange = new EventEmitter<boolean>();
    @Output() selectedImage = new EventEmitter<boolean>();
    @Output() removeImage = new EventEmitter<boolean>();

    @ViewChild('galleryContainer') galleryContainer: ElementRef;
    @ViewChildren('imageElement') imageElements: QueryList<any>;

    // Replaced with window.addEventListener
    /*@HostListener('scroll', ['$event']) triggerCycle(event : any) {
        this.scaleGallery()
    }*/

    @HostListener('window:resize', ['$event']) windowResize(event : any) {

        if (this.galleryContainer.nativeElement.id === this.uuid) {
            this.containerWidth = this.galleryContainer.nativeElement.clientWidth === 0 ? this.galleryContainer.nativeElement.scrollWidth : this.galleryContainer.nativeElement.clientWidth;
        }

        this.render()
    }

    public gallery: any[] = [];
    public imageDataStaticPath: string = 'assets/img/gallery/';
    public imageDataCompletePath: string = '';
    public dataFileName: string = 'data.json';
    public images: any[] = [];
    public minimalQualityCategory = 'preview_xxs';
    public viewerSubscription: Subscription;
    public viewerShown : boolean;

    private isSelectedImageUsed: boolean = false;

    public uuid: string;

    public containerWidth: number;

    constructor(public ImageService: ImageService, public http: Http, public ChangeDetectorRef: ChangeDetectorRef) {
        window.addEventListener('scroll', e => {
            this.scaleGallery()
        }, true);
    }

    public ngOnInit() {
        this.fetchDataAndRender();
        this.viewerSubscription = this.ImageService.showImageViewerChanged$
            .subscribe((visibility: boolean) => {
                this.viewerChange.emit(visibility);
                this.viewerShown = visibility;
            });

        this.isSelectedImageUsed = this.selectedImage.observers.length > 0;

        this.uuid = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);

        this.containerWidth = this.galleryContainer.nativeElement.clientWidth === 0 ? this.galleryContainer.nativeElement.scrollWidth : this.galleryContainer.nativeElement.clientWidth;
    }

    public ngOnChanges(changes: SimpleChanges) {
        // input params changed
        if (changes["providedGalleryName"] != null)
            this.fetchDataAndRender();
        else
            this.render()
    }

    public ngOnDestroy() {
        if (this.viewerSubscription) {
            this.viewerSubscription.unsubscribe()
        }
    }

    public openImageViewer(img  : any) {
        // console.log(img);
        if (this.isSelectedImageUsed) {
            this.selectedImage.emit(img);
        } else {
            this.ImageService.updateImages(this.images);
            this.ImageService.updateSelectedImageIndex(this.images.indexOf(img));
            this.ImageService.showImageViewer(true);
        }
    }

    public removeMedia(img: any) {
        this.removeImage.emit(img)
    }

    private fetchDataAndRender() {
        if (this.providedMetadataUri && this.providedMetadataArray) {
            console.error('You have provided both [providedMetadataUri] and [providedMetadataArray]. Please choose one or the other.')
            return
        }

        if (this.providedMetadataUri) {
            this.imageDataCompletePath = this.providedMetadataUri

            if (!this.providedMetadataUri) {
                this.imageDataCompletePath = this.providedGalleryName != '' ?
                    this.imageDataStaticPath + this.providedGalleryName + '/' + this.dataFileName :
                    this.imageDataStaticPath + this.dataFileName
            }

            this.http.get(this.imageDataCompletePath)
                .map((res: Response) => res.json())
                .subscribe(
                    data => {
                        this.images = data;
                        this.ImageService.updateImages(this.images);

                        this.images.forEach((image) => {
                            image['galleryImageLoaded'] = false;
                            image['viewerImageLoaded'] = false;
                            image['srcAfterFocus'] = '';
                        });
                        // twice, single leads to different strange browser behaviour
                        this.render();
                        this.render();
                    },
                    err => this.providedMetadataUri ?
                        console.error("Provided endpoint '"+this.providedMetadataUri+"' did not serve metadata correctly or in the expected format. \n\nSee here for more information: https://github.com/BenjaminBrandmeier/angular2-image-gallery/blob/master/docs/externalDataSource.md,\n\nOriginal error: " + err) :
                        console.error("Did you run the convert script from angular2-image-gallery for your images first? Original error: " + err),
                    () => undefined)
        } else if(this.providedMetadataArray) {
            setTimeout(() => {
                this.images = this.providedMetadataArray;
                this.ImageService.updateImages(this.images);

                this.images.forEach((image) => {
                    image['galleryImageLoaded'] = false;
                    image['viewerImageLoaded'] = false;
                    image['srcAfterFocus'] = '';
                });
                // twice, single leads to different strange browser behaviour
                this.render();
                this.render();
            }, 250)
        }

    }

    private render() {
        this.gallery = [];

        let tempRow = [this.images[0]];
        let rowIndex = 0;
        let i = 0;

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
    }

    private shouldAddCandidate(imgRow: any[], candidate: any): boolean {
        let oldDifference = this.calcIdealHeight() - this.calcRowHeight(imgRow);
        imgRow.push(candidate);
        let newDifference = this.calcIdealHeight() - this.calcRowHeight(imgRow);

        return Math.abs(oldDifference) > Math.abs(newDifference);
    }

    private calcRowHeight(imgRow: any[]) {
        let originalRowWidth = this.calcOriginalRowWidth(imgRow);
        let ratio = (this.getGalleryWidth() - (imgRow.length - 1) * this.calcImageMargin()) / originalRowWidth;
        return imgRow[0][this.minimalQualityCategory]['height'] * ratio;
    }

    private calcImageMargin() {
        let galleryWidth = this.getGalleryWidth();
        let ratio = galleryWidth / 1920;
        return Math.round(Math.max(1, this.providedImageMargin * ratio));
    }

    private calcOriginalRowWidth(imgRow: any[]) {
        let originalRowWidth = 0;
        imgRow.forEach((img) => {
            let individualRatio = this.calcIdealHeight() / img[this.minimalQualityCategory]['height'];
            img[this.minimalQualityCategory]['width'] = img[this.minimalQualityCategory]['width'] * individualRatio;
            img[this.minimalQualityCategory]['height'] = this.calcIdealHeight();
            originalRowWidth += img[this.minimalQualityCategory]['width'];
        });

        return originalRowWidth;
    }

    private calcIdealHeight() {
        return this.getGalleryWidth() / (80 / this.providedImageSize) + 100;
    }

    private getGalleryWidth() {
        return this.containerWidth;
    }

    private scaleGallery() {
        let imageCounter = 0;
        let maximumGalleryImageHeight = 0;

        this.gallery.forEach((imgRow) => {
            let originalRowWidth = this.calcOriginalRowWidth(imgRow);

            let ratio = 1;

            if (imgRow !== this.gallery[this.gallery.length - 1]) {
                ratio = (this.getGalleryWidth() - (imgRow.length - 1) * this.calcImageMargin()) / originalRowWidth;
            }
            imgRow.forEach((img : any) => {
                img['width'] = img[this.minimalQualityCategory]['width'] * ratio;
                img['height'] = img[this.minimalQualityCategory]['height'] * ratio;
                maximumGalleryImageHeight = Math.max(maximumGalleryImageHeight, img['height']);
                this.checkForAsyncLoading(img, imageCounter++);
            })
        });

        this.minimalQualityCategory = maximumGalleryImageHeight > 375 ? 'preview_xs' : 'preview_xxs';

        this.ChangeDetectorRef.detectChanges()
    }

    private checkForAsyncLoading(image : any, imageCounter: number) {
        let imageElements = this.imageElements.toArray();

        if (image['galleryImageLoaded'] || (imageElements.length > 0 && this.isScrolledIntoView(imageElements[imageCounter].nativeElement))) {
            image['galleryImageLoaded'] = true;
            image['srcAfterFocus'] = image[this.minimalQualityCategory]['path'];
        }
        else {
            image['srcAfterFocus'] = '';
        }
    }

    private isScrolledIntoView(element : any) {
        let elementTop = element.getBoundingClientRect().top;
        let elementBottom = element.getBoundingClientRect().bottom;

        return elementTop < window.innerHeight && elementBottom >= 0 && (elementBottom > 0 || elementTop > 0)
    }
}
