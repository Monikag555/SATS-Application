import { LightningElement } from 'lwc';
import Performance_Image from '@salesforce/resourceUrl/Performance_Img';
import Cost_Image from '@salesforce/resourceUrl/Cost_Efficient_Img';
import Security_Image from '@salesforce/resourceUrl/Security_Img';
import Maintainance_Image from '@salesforce/resourceUrl/Maintainance_Img';
import Offer_Image from '@salesforce/resourceUrl/Offer_Img';






export default class Features extends LightningElement {
    slides = [
        { id: 1, src: Performance_Image},
        { id: 2, src: Cost_Image },
        { id: 3, src: Security_Image },
        { id: 4, src: Maintainance_Image }
    ];

    currentIndex = 0;

    connectedCallback() {
        this.startAutoScroll();
    }

    startAutoScroll() {
        setInterval(() => {
            this.currentIndex = (this.currentIndex + 1) % this.slides.length;
            const offset = -this.currentIndex * 100;
            this.template.querySelector('.carousel').style.transform = `translateX(${offset}%)`;
        }, 3000); // Change slide every 3 seconds
    }
    OfferUrl=Offer_Image;
}