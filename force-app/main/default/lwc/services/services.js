import { LightningElement, track } from 'lwc';
import Staffing_Image from '@salesforce/resourceUrl/Staffing';
import Consulting_Image from '@salesforce/resourceUrl/Consulting_Services';
import HR_Image from '@salesforce/resourceUrl/HR_Services';
import Technology_Image from '@salesforce/resourceUrl/Technology_Solutions';

const AUTO_SCROLL_INTERVAL = 4000; // Interval in milliseconds (5 seconds)

export default class Services extends LightningElement {
    @track currentSlide = 0;
    autoScrollIntervalId;

    slides = [
        {
            id: 'slide1',
            cards: [
                {
                    id: 'card1',
                    image: Staffing_Image,
                    text: 'Staffing',
                    sub_text: 'In this fiercely competitive industry, hiring the appropriate personnel is critical to the long-term success of any firm.'
                },
                {
                    id: 'card2',
                    image: Consulting_Image,
                    text: 'Consulting Services',
                    sub_text: 'By contributing their strategic advice and skills, our consultants assist businesses overcoming challenging barriers.'
                }
            ]
        },
        {
            id: 'slide2',
            cards: [
                {
                    id: 'card3',
                    image: HR_Image,
                    text: 'HR Services',
                    sub_text: 'SprintPark offers a wide range of services to assist companies in efficiently managing their labor force.'
                },
                {
                    id: 'card4',
                    image: Technology_Image,
                    text: 'Technology Solutions',
                    sub_text: 'Advanced network engineering, cybersecurity, big data analytics, artificial intelligence, Salesforce solutions, Java.'
                }
            ]
        }
    ];

    connectedCallback() {
        // Start auto-scrolling on component initialization
        this.startAutoScroll();
    }

    disconnectedCallback() {
        // Clean up and stop auto-scrolling when component is removed
        this.stopAutoScroll();
    }

    startAutoScroll() {
        this.autoScrollIntervalId = setInterval(() => {
            this.nextSlide();
        }, AUTO_SCROLL_INTERVAL);
    }

    stopAutoScroll() {
        clearInterval(this.autoScrollIntervalId);
    }

    get computedSlides() {
        return this.slides.map((slide, index) => {
            return {
                ...slide,
                carouselItemClass: index === this.currentSlide ? 'carousel-item active' : 'carousel-item'
            };
        });
    }

    prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.stopAutoScroll(); // Stop auto-scrolling on manual slide change
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    }
}