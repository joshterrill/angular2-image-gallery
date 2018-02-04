import { ImageService } from "../services/image.service";
export declare class ViewerComponent {
    private ImageService;
    showViewer: boolean;
    private images;
    private currentIdx;
    private leftArrowVisible;
    private rightArrowVisible;
    private qualitySelectorShown;
    private qualitySelected;
    private categorySelected;
    private transform;
    private Math;
    constructor(ImageService: ImageService);
    readonly leftArrowActive: boolean;
    readonly rightArrowActive: boolean;
    pan(swipe: any): void;
    onResize(): void;
    showQualitySelector(): void;
    qualityChanged(newQuality: any): void;
    imageLoaded(image: any): void;
    /**
     * direction (-1: left, 1: right)
     * swipe (user swiped)
     */
    private navigate(direction, swipe);
    private hideNavigationArrows();
    private showNavigationArrows();
    private closeViewer();
    private updateImage();
    private updateQuality();
    private onKeydown(event);
    getImage(img: any): string;
}
