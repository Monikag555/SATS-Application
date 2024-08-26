import { LightningElement, wire, track } from 'lwc';
//import { loadScript } from 'lightning/platformResourceLoader';
import getBenchConsultant from '@salesforce/apex/BenchConsultant.getBenchConsultant';
//import getBenchIdCount from '@salesforce/apex/BenchConsultant.getBenchIdCount';
//import chartjs from '@salesforce/resourceUrl/ChartJS';
import { exportCSVFile } from 'c/utils'; // Utility function for CSV export


const columns = [
    { label: 'Bench ID', fieldName: 'Name',minColumnWidth: 150, maxColumnWidth: 300 },
    { label: 'Consultant First Name', fieldName: 'First_Name__c',minColumnWidth: 150, maxColumnWidth: 300 },
    { label: 'Consultant Last Name', fieldName: 'Last_Name__c',minColumnWidth: 150, maxColumnWidth: 300 },
    { label: 'Email ID', fieldName: 'Email_Address__c',minColumnWidth: 150, maxColumnWidth: 300 },
    { label: 'Mobile Number', fieldName: 'Phone_Number__c',minColumnWidth: 150, maxColumnWidth: 300 },
    { label: 'LinkedIn Profile', fieldName: 'LinkedIn_URL__c' ,minColumnWidth: 150, maxColumnWidth: 300},
    { label: 'Work Authorization', fieldName: 'Work_Authhorization__c' ,minColumnWidth: 150, maxColumnWidth: 300},
    { label: 'Country', fieldName: 'Country__c',minColumnWidth: 150, maxColumnWidth: 300 },
    { label: 'State', fieldName: 'State__c',minColumnWidth: 150, maxColumnWidth: 300 },
    { label: 'Created Date', fieldName: 'CreatedDate',minColumnWidth: 150, maxColumnWidth: 300 }
];

export default class BenchConsultantDashboard extends LightningElement {
    @track data = [];
    @track error;
    @track activeBenchCount = 0; // Initialize with 0 or null
    @track calendarFilter = 'monthly';
    @track selectedValue = this.getDefaultSelectedValue();
    @track customStartDate = null;
    @track customEndDate = null;
    @track showNoRecords = false; // Track whether to show no records message
    columns = columns;
    @track isModalOpen = false;

    //isChartJsInitialized = false;
    //chartInstance; // Variable to hold the Chart.js instance

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

    constructor() {
        super();
        this.selectedValue = this.getDefaultSelectedValue();
    }

    // connectedCallback() {
    //     // Load Chart.js script when the component connects
    //     Promise.all([
    //         loadScript(this, chartjs)
    //     ])
    //     .then(() => {
    //         this.isChartJsInitialized = true;
    //         this.renderChart(); // Render the chart once Chart.js is loaded
    //     })
    //     .catch(error => {
    //         this.error = error;
    //     });
    // }

    @wire(getBenchConsultant, { filter: '$calendarFilter', selectedValue: '$selectedValue', customStartDate: '$customStartDate', customEndDate: '$customEndDate' })
    wiredCandidates({ error, data }) {
        if (data) {
            this.data = data.map(row => ({
                ...row,
                id: row.Client_Name__c // Assigning a unique key
            }));
            this.error = undefined;
            this.showNoRecords = this.data.length === 0; // Check if data is empty to show no records message
            console.log('Candidates fetched successfully:', this.data);
        } else if (error) {
            this.error = error;
            this.data = [];
            this.showNoRecords = true; // Show no records message on error
            console.error('Error fetching submitted candidates:', error);
        }
        //this.renderChart(); // Always attempt to render chart after data update
    }

    // @wire(getBenchIdCount, { filter: '$calendarFilter', selectedValue: '$selectedValue', customStartDate: '$customStartDate', customEndDate: '$customEndDate' })
    // wiredBenchIdCount({ error, data }) {
    //     if (data) {
    //         this.activeBenchCount = data; // Assuming data is a numeric count
    //         this.error = undefined;
    //         this.renderChart(); // Render the chart when count data is available
    //     } else if (error) {
    //         this.error = error;
    //         this.activeBenchCount = 0; // Handle error case, initialize with appropriate value
    //         console.error('Error fetching active Bench ID count:', error);
    //         this.renderChart(); // Attempt to render chart on error as well
    //     }
    // }

    handleCalendarChange(event) {
        this.calendarFilter = event.detail.value;
        this.selectedValue = this.getDefaultSelectedValue();
        this.customStartDate = null; // Reset custom date inputs
        this.customEndDate = null;
    }

    handleValueChange(event) {
        this.selectedValue = event.detail.value;
    }

    handleCustomStartDateChange(event) {
        this.customStartDate = event.target.value;
    }

    handleCustomEndDateChange(event) {
        this.customEndDate = event.target.value;
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

    // get datatableClass() {
    //     const rowCount = this.data.length;
    //     if (rowCount > 20) {
    //         return 'scrollable-table large';
    //     } else if (rowCount > 10) {
    //         return 'scrollable-table medium';
    //     } else {
    //         return 'scrollable-table small';
    //     }
    // }


    // renderedCallback() {
    //     if (this.isChartJsInitialized && this.data && this.data.length > 0) {
    //         this.renderChart(); // Ensure chart is rendered when data is available
    //     }
    // }

    // renderChart() {
    //     if (!this.isChartJsInitialized) {
    //         return;
    //     }

    //     // Ensure the chart container is available in the DOM
    //     const chartContainer = this.template.querySelector('canvas.chart');
    //     if (!chartContainer) {
    //         return;
    //     }

    //     const ctx = chartContainer.getContext('2d');
    //     if (!ctx) {
    //         return;
    //     }

    //     if (this.chartInstance) {
    //         this.chartInstance.destroy(); // Destroy previous instance if exists
    //     }

    //     this.chartInstance = new window.Chart(ctx, {
    //         type: 'pie',
    //         data: {
    //             labels: ['Active Bench IDs'],
    //             datasets: [{
    //                 data: [this.activeBenchCount],
    //                 backgroundColor: ['#FF6384'],
    //             }],
    //         },
    //         options: {
    //             responsive: true,
    //             maintainAspectRatio: false,
    //         }
    //     });
    // }

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