import { LightningElement, wire, track } from 'lwc';
import getVendorSubmissions from '@salesforce/apex/VendorSubmissions.getVendorSubmissions';
import { exportCSVFile } from 'c/utils'; // Utility function for CSV export


const columns = [
    { label: 'Job Name', fieldName: 'Job_ID__r_Name__c' },
    { label: 'Job Title', fieldName: 'Job_Title__c' },
    { label: 'Sell Rate', fieldName: 'Job_ID__r_Sell_Rate__c' },
    { label: 'Talent Bench ID', fieldName: 'Talent_Bench_ID__r_Name' },
    { label: 'Candidate Name', fieldName: 'First_Name__c' },
    { label: 'Email ID', fieldName: 'Email_Address__c' },
    { label: 'Mobile Number', fieldName: 'Phone_Number__c' },
    { label: 'LinkedIn Profile', fieldName: 'LinkedIn_Profile__c' },
    { label: 'Work Authorization', fieldName: 'Work_Authorization__c' },
    { label: 'Vendor Name', fieldName: 'Job_ID__r_Vendor_Account__r_Name__c' },
    { label: 'Bench Team Member', fieldName: 'Sales_Team_Member__c' },
    { label: 'Created Date', fieldName: 'CreatedDate' }
];

export default class vendorSubmissionsDashboard extends LightningElement {
    @track data = [];
    @track error;
    columns = columns;
    calendarFilter = 'monthly';
    selectedValue = this.getDefaultSelectedValue();
    customStartDate = null;
    customEndDate = null;
    @track isModalOpen = false;

    @wire(getVendorSubmissions, { filter: '$calendarFilter', selectedValue: '$selectedValue', customStartDate: '$customStartDate', customEndDate: '$customEndDate' })
    wiredVendorSubmissions({ error, data }) {
        if (data) {
            let transformedData = data.map(row => ({
                Id: row.Id,
                Job_ID__r_Name__c: row.Job_ID__r ? row.Job_ID__r.Name : '',
                Job_Title__c: row.Job_Title__c,
                Job_ID__r_Sell_Rate__c: row.Job_ID__r ? row.Job_ID__r.Sell_Rate__c : '',
                Job_ID__r_Vendor_Account__r_Name__c: row.Job_ID__r && row.Job_ID__r.Vendor_Account__r ? row.Job_ID__r.Vendor_Account__r.Name : '',
                Talent_Bench_ID__r_Name: row.Talent_Bench_ID__r.Name,
                First_Name__c: row.First_Name__c,
                Email_Address__c: row.Email_Address__c,
                Phone_Number__c: row.Phone_Number__c,
                LinkedIn_Profile__c: row.LinkedIn_Profile__c,
                Work_Authorization__c: row.Work_Authorization__c,
                Sales_Team_Member__c: row.Sales_Team_Member__c,
                CreatedDate: row.CreatedDate
            }));

            this.data = transformedData;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.data = undefined;
        }
    }

    calendarOptions = [
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Monthly', value: 'monthly' },
        { label: 'Yearly', value: 'yearly' },
        { label: 'Custom', value: 'custom' }
    ];

    monthOptions = [
        { label: 'January', value: '1' },
        { label: 'February', value: '2' },
        { label: 'March', value: '3' },
        { label: 'April', value: '4' },
        { label: 'May', value: '5' },
        { label: 'June', value: '6' },
        { label: 'July', value: '7' },
        { label: 'August', value: '8' },
        { label: 'September', value: '9' },
        { label: 'October', value: '10' },
        { label: 'November', value: '11' },
        { label: 'December', value: '12' }
    ];

    yearOptions = Array.from({ length: 1001 }, (_, i) => {
        const year = 2000 + i;
        return { label: year.toString(), value: year.toString() };
    });

    handleCalendarChange(event) {
        this.calendarFilter = event.detail.value;
        this.selectedValue = this.getDefaultSelectedValue();
    }

    handleValueChange(event) {
        this.selectedValue = event.detail.value;
    }

    handleCustomStartDateChange(event) {
        this.customStartDate = event.detail.value;
    }

    handleCustomEndDateChange(event) {
        this.customEndDate = event.detail.value;
    }

    getDefaultSelectedValue() {
        let today = new Date();
        if (this.calendarFilter === 'monthly') {
            return String(today.getMonth() + 1); // Default to current month
        } else if (this.calendarFilter === 'yearly') {
            return String(today.getFullYear()); // Default to current year
        }
        return null;
    }

    get isMonthlyOrYearly() {
        return this.calendarFilter === 'monthly' || this.calendarFilter === 'yearly';
    }

    get options() {
        if (this.calendarFilter === 'monthly') {
            return this.monthOptions;
        } else if (this.calendarFilter === 'yearly') {
            return this.yearOptions;
        }
        return [];
    }

    get isCustom() {
        return this.calendarFilter === 'custom';
    }

    //CSV File
    downloadCSV() {
        // Convert the data into CSV format
        const csvString = this.exportCSVFile(this.columns, this.data, 'Vendor_Submissions');

        // Create a temporary link element and trigger the download
        const hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvString);
        hiddenElement.target = '_self';
        hiddenElement.download = 'vendor_submissions.csv';  // File name
        document.body.appendChild(hiddenElement); // Required for FireFox
        hiddenElement.click(); // Trigger download
        document.body.removeChild(hiddenElement);
    }

    // Utility function to convert JSON to CSV
    exportCSVFile(headers, items, fileTitle) {
        if (!items || !items.length) {
            return null;
        }

        const jsonObject = JSON.stringify(items);
        const result = this.convertToCSV(jsonObject, headers);

        if (result === null) return null;

        return result;
    }

    convertToCSV(objArray, headers) {
        const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
        let str = '';
        let row = '';

        // Extract headers
        headers.forEach(header => {
            row += header.label + ',';
        });
        row = row.slice(0, -1);
        str += row + '\r\n';

        // Extract data rows
        array.forEach(item => {
            let line = '';
            headers.forEach(header => {
                line += item[header.fieldName] + ',';
            });
            line = line.slice(0, -1);
            str += line + '\r\n';
        });

        return str;
    }

    handleMaximize() {
        this.isModalOpen = true;
    }

    handleCloseModal() {
        this.isModalOpen = false;
    }
    closeModal() {
        this.isModalOpen = false;
    }

    get tableHeightStyle() {
        // Calculate the height based on the number of rows in the table
        const rowHeight = 30; // Average height for each row
        const headerHeight = 50; // Height for the table header
        const maxTableHeight = 148; // Max height limit for the table

        const calculatedHeight = this.data.length * rowHeight + headerHeight;

        return `height: ${Math.min(calculatedHeight, maxTableHeight)}px;`;
    }
}