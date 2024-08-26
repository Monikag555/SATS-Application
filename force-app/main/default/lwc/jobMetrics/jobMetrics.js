import { LightningElement, track, wire } from 'lwc';
import chartjs from '@salesforce/resourceUrl/ChartJS';
import { loadScript } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getJobStatus from '@salesforce/apex/JobMetrics.getJobStatus';
import getActiveInactiveJobCounts from '@salesforce/apex/JobMetrics.getActiveInactiveJobCounts';
import { refreshApex } from '@salesforce/apex';
import getJobStatusInformation from '@salesforce/apex/JobMetrics.getJobStatusInformation';
import { exportCSVFile } from 'c/utils'; // Utility function for CSV export


const COLUMNS = [
    { label: 'Job Status', fieldName: 'status' },
    {
        label: 'Count',
        fieldName: 'count',
        type: 'button',
        typeAttributes: {
            label: { fieldName: 'count' },
            name: 'showDetails',
            variant: 'base'
        }
    }
];

const modalColumns = [
    { label: 'Job ID', fieldName: 'Name' },
    { label: 'Job Title', fieldName: 'Job_Title__c' },
    { label: 'Client Name', fieldName: 'Client_Account__r_Name' },  // Client Name column
    { label: 'Vendor Name', fieldName: 'Vendor_Account__r_Name'},
    { label: 'Pay Period', fieldName: 'Pay_Period__c' },
    { label: 'Pay Rate', fieldName: 'Pay_Rate__c' },
    { label: 'Sell Rate', fieldName: 'Sell_Rate__c' },
    { label: 'Job Status', fieldName: 'Job_Status__c' }
];


export default class JobStatusPieChartComponent extends LightningElement {
    chart;
    chartjsInitialized = false;
    @track modalData = [];
    modalColumns = modalColumns;

    @track showChart = false;
    @track jobStatusData;
    @track filteredData;
    @track columns = COLUMNS;
    @track isModalOpen = false;
    @track isModalOpen1 = false;

    calendarFilter = 'monthly';
    selectedValue = this.getDefaultSelectedValue();
    customStartDate = null;
    customEndDate = null;
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

    @wire(getJobStatus, { filter: '$calendarFilter', selectedValue: '$selectedValue', customStartDate: '$customStartDate', customEndDate: '$customEndDate' })
    // wiredJobStatus(result) {
    //     this.wiredJobStatusCountsResult = result;
    //     if (result.data) {
    //         this.filteredData = result.data;
    //         if (this.filteredData.length > 0) {
    //             this.showChart = true;
    //             if (this.chartjsInitialized) {
    //                 this.updateChart();
    //             }
    //         } else {
    //             this.showChart = false;
    //         }
    //     } else if (result.error) {
    //         console.error('Error fetching job status data:', result.error);
    //     }
    // }
    //{
    wiredJobStatus(result) {
        this.wiredJobStatusCountsResult = result;
        if (result.data) {
            if (result.data.some(item => item.count != 0)) {
                this.showChart = true;
                console.log('Not equal to zero.');
                this.filteredData = result.data;
                if (this.chartjsInitialized) {
                    this.updateChart();
                }
            } else {
                console.log('zero data.');
                this.showChart = false;
            }
        } else if (result.error) {
            console.error('Error fetching job status counts:', result.error);
        }
    }

    @wire(getActiveInactiveJobCounts, { filter: '$calendarFilter', selectedValue: '$selectedValue', customStartDate: '$customStartDate', customEndDate: '$customEndDate' })
    wiredActiveInactiveJobCounts(result) {
        if (result.data) {
            this.jobStatusData = result.data;
        } else if (result.error) {
            console.error('Error fetching active/inactive job counts:', result.error);
        }
    }

    config = {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [],
                backgroundColor: [
                    // 'rgb(228,204,184)',
                    // 'rgba(167,89,147,255)',
                    //Sample1
                    // '#cea9bc',
                    // '#8464a0',

                    //sample2
                    '#72b4eb',
                    '#0a417a',
                ],
                label: 'Job Status Counts'
            }],
            labels: []
        },
        options: {
            responsive: true,
            legend: {
                position: 'right'
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    };

    renderedCallback() {
        if (this.chartjsInitialized) {
            this.updateChart();
           /// return;
        }

        loadScript(this, chartjs)
            .then(() => {
                if (!window.Chart) {
                    throw new Error('Chart.js not loaded correctly');
                }
                const canvas = this.template.querySelector('canvas.pie-chart');
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    this.chart = new window.Chart(ctx, this.config);
                    this.chartjsInitialized = true;
                    this.updateChart(); // Initialize with existing data if available
                } else {
                    console.error('Canvas element not found');
                }
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error loading ChartJS',
                        message: error.message,
                        variant: 'error',
                    }),
                );
            });
    }

    updateChart() {
        if (!this.chart) {
            console.error('Chart instance is not initialized');
            return;
        }

        if (!this.filteredData || !Array.isArray(this.filteredData)) {
            console.error('No valid data provided to initialize or update chart');
            return;
        }

        const labels = this.filteredData.map(record => record.status);
        const values = this.filteredData.map(record => record.count);

        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = values;
        this.chart.update();
    }

    handleCalendarChange(event) {
        this.calendarFilter = event.detail.value;
        this.selectedValue = (this.calendarFilter === 'daily' || this.calendarFilter === 'weekly') ? null : this.getDefaultSelectedValue();
        refreshApex(this.wiredJobStatusCountsResult);
    }

    handleValueChange(event) {
        this.selectedValue = event.detail.value;
        refreshApex(this.wiredJobStatusCountsResult);
    }

    handleCustomStartDateChange(event) {
        this.customStartDate = event.detail.value;
        refreshApex(this.wiredJobStatusCountsResult);
    }

    handleCustomEndDateChange(event) {
        this.customEndDate = event.detail.value;
        refreshApex(this.wiredJobStatusCountsResult);
    }

    getDefaultSelectedValue() {
        let today = new Date();
        return (this.calendarFilter === 'monthly') ? String(today.getMonth() + 1) : String(today.getFullYear());
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

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        if (actionName === 'showDetails') {
            const jobByStatus = row.status;
            this.fetchModalData(jobByStatus);
        }
    }

    fetchModalData(jobByStatus) {
        getJobStatusInformation({ 
            jobByStatus,
            filter: this.calendarFilter,
            selectedValue: this.selectedValue,
            customStartDate: this.customStartDate,
            customEndDate: this.customEndDate 
        })
        .then(result => {
            // Handle cases where Client_Account__r might be undefined
            this.modalData = result.map(item => ({
                ...item,
                Name: item.Name,
                Job_Title__c:item.Job_Title__c,
                Client_Account__r_Name: item.Client_Account__r.Name,
                Vendor_Account__r_Name: item.Vendor_Account__r.Name,
                Pay_Period__c: item.Pay_Period__c,
                Pay_Rate__c: item.Pay_Rate__c,
                Sell_Rate__c: item.Sell_Rate__c,
                Job_Status__c: item.Job_Status__c
            }));
            this.isModalOpen = true;
            console.log('Modal data fetched successfully:', this.modalData);
        })
        .catch(error => {
            this.modalData = [];
            console.error('Error fetching modal data:', error);
        });
    }
    
    



    //CSV File
    downloadCSV() {
        // Convert the data into CSV format
        const csvString = this.exportCSVFile(this.modalColumns, this.modalData, 'Job_Metrics');

        // Create a temporary link element and trigger the download
        const hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvString);
        hiddenElement.target = '_self';
        hiddenElement.download = 'Job_Metrics.csv';  // File name
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
        this.isModalOpen1 = true;
    }

    handleCloseModal() {
        this.isModalOpen1 = false;
    }

    closeModal1() {
        this.isModalOpen1 = false;
    }
    closeModal() {
        this.isModalOpen = false;
    }

}