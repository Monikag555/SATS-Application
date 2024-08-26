import { LightningElement } from 'lwc';
import FOOTER_IMAGE from '@salesforce/resourceUrl/Footer_Logo';

export default class Footer extends LightningElement {
    handleSubscribe() {
        window.location.href = 'https://mail.google.com/mail/?view=cm&fs=1&to=info@sprintpark.net';
    }
    footerImageUrl = FOOTER_IMAGE;
}