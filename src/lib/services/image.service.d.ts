import { Observable } from "rxjs/Observable";
export declare class ImageService {
    private imagesUpdatedSource;
    private imageSelectedIndexUpdatedSource;
    private showImageViewerSource;
    imagesUpdated$: Observable<any[]>;
    imageSelectedIndexUpdated$: Observable<number>;
    showImageViewerChanged$: Observable<boolean>;
    updateImages(images: any[]): void;
    updateSelectedImageIndex(newIndex: number): void;
    showImageViewer(show: boolean): void;
}
