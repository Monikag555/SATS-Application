import { LightningElement, wire, track } from 'lwc';
import getData from '@salesforce/apex/Summary_Report.getData';
import getHighestStageRecord from '@salesforce/apex/Summary_Report.getHighestStageRecord';
import { exportCSVFile } from 'c/utils'; // Utility function for CSV export


const columns = [
    { label: 'Recruitment Manager', fieldName: 'Sales_Team_Member__c' },
    {
        label: 'Consultant Name',
        fieldName: 'First_Name__c',
        type: 'button',
        typeAttributes: {
            label: { fieldName: 'First_Name__c' },
            name: 'showDetails',
            variant: 'base'
        }
    }
];

export default class AtsDashboard extends LightningElement {
    @track isModalOpen = false;
    @track modalData = {}; // Changed to object for single candidate details
    @track data = [];
    error;
    calendarFilter = 'monthly';
    selectedValue = this.getDefaultSelectedValue();
    columns = columns;
    customStartDate = null;
    customEndDate = null;
    @track isModalOpen1 = false;


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

    @wire(getData, { filter: '$calendarFilter', selectedValue: '$selectedValue', customStartDate: '$customStartDate', customEndDate: '$customEndDate' })
    wiredCandidates({ error, data }) {
        if (data) {
            this.data = data.map((row, index) => ({
                ...row,
                id: `${row.Sales_Team_Member__c}-${row.First_Name__c}-${index}` // Assigning a unique key
            }));
            this.error = undefined;
            console.log('Candidates fetched successfully:', this.data);
        } else if (error) {
            this.error = error;
            this.data = [];
            console.error('Error fetching candidates:', error);
        }
    }

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

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        if (actionName === 'showDetails') {
            const consultantName = row.First_Name__c;
            this.fetchModalData(consultantName);
        }
    }

    fetchModalData(consultantName) {
        getHighestStageRecord({ consultantName })
            .then(candidate => {
                if (candidate) {
                    if (candidate.Interview_Status__c === 'Failed' && this.data.length === 1) {
                        // Case where there's only one record and its Interview_Status is Failed
                        this.modalData = [
                            {
                                key: `${candidate.Id}_stage1`,
                                text: `${candidate.First_Name__c} has only one record with Interview Failed`,
                                circleClass: 'circle re_color',
                                hasNext: false,
                                lineClass: ''
                            }
                        ];
                    } else {
                        // Normal workflow stages
                        this.modalData = [
                            {
                                key: `${candidate.Id}_stage1`,
                                text: `${candidate.First_Name__c} is assigned to ${candidate.Sales_Team_Member__c}`,
                                circleClass: 'circle color',
                                hasNext: true,
                                lineClass: 'vertical-line color'
                            },
                            {
                                key: `${candidate.Id}_stage2`,
                                text: candidate.Job_Submitted__c ? `Submitted to Vendor ${candidate.Vendor_Name__c}` : 'Submitted',
                                circleClass: candidate.Job_Submitted__c ? 'circle color' : 'circle flow_color',
                                hasNext: true,
                                lineClass: candidate.Job_Submitted__c ? 'vertical-line color' : 'vertical-line flow_color'
                            },
                            {
                                key: `${candidate.Id}_stage3`,
                                text: candidate.Interview_Schedule_Date__c ? `Interview Scheduled on ${candidate.Interview_Schedule_Date__c}` : 'Interview Scheduled',
                                circleClass: candidate.Interview_Schedule_Date__c ? 'circle color' : 'circle flow_color',
                                hasNext: true,
                                lineClass: candidate.Interview_Schedule_Date__c ? 'vertical-line color' : 'vertical-line flow_color'
                            },
                            {
                                key: `${candidate.Id}_stage4`,
                                text: candidate.Interview_Status__c === 'Cleared' ? 'Interview Cleared' :
                                      candidate.Interview_Status__c === 'Failed' ? 'Interview Failed' : 'Interview Status',
                                circleClass: candidate.Interview_Status__c === 'Cleared' ? 'circle color' :
                                candidate.Interview_Status__c === 'Failed' ? 'circle flow_color' : 'circle flow_color',
                                hasNext: true,
                                lineClass: candidate.Interview_Status__c === 'Cleared' ? 'vertical-line color' :
                                          candidate.Interview_Status__c === 'Failed' ? 'vertical-line flow_color' : 'vertical-line flow_color'
                            },
                            {
                                key: `${candidate.Id}_stage5`,
                                text: candidate.Interview_Status__c === 'Failed' ? `${candidate.First_Name__c} Re-Assigned to Job Pool` : 
                                candidate.Placement_Confirmed__c ? 'Placement Confirmed' : 'Placement Confirmation',
                                circleClass: candidate.Interview_Status__c === 'Failed' ? 'circle re_color' : 
                                candidate.Placement_Confirmed__c ? 'circle color' : 'circle flow_color',
                                hasNext: false,
                                lineClass: ''
                            }
                        ];
                    }
                } else {
                    this.modalData = [
                        {
                            key: 'no_data',
                            text: 'No data available',
                            circleClass: 'circle',
                            hasNext: false,
                            lineClass: ''
                        }
                    ];
                }
                this.isModalOpen = true;
                setTimeout(() => {
                    this.animateStages();
                }, 500);
            })
            .catch(error => {
                this.error = error;
                this.modalData = [
                    {
                        key: 'error',
                        text: 'Error loading data',
                        circleClass: 'circle',
                        hasNext: false,
                        lineClass: ''
                    }
                ];
            });
    }
    
    
    closeModal() {
        this.isModalOpen = false;
    }

    animateStages() {
        const stages = this.template.querySelectorAll('.flow-chart-stage .circle');
        let index = 0;
    
        const animateNextStage = () => {
            if (index < stages.length) {
                const stage = stages[index];
                stage.classList.add('flow_color'); // Add animation class
                
                // Optionally, remove the class after animation to reset
                setTimeout(() => {
                    stage.classList.remove('flow_color');
                    index++;
                    animateNextStage();
                }, 2000); // Duration for each stage
            }
        };
    
        animateNextStage();
    }

    //CSV File
    downloadCSV() {
        // Convert the data into CSV format
        const csvString = this.exportCSVFile(this.columns, this.data, 'Consultant_WorkFlow');

        // Create a temporary link element and trigger the download
        const hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvString);
        hiddenElement.target = '_self';
        hiddenElement.download = 'Consultant_WorkFlow.csv';  // File name
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

    get tableHeightStyle() {
        // Calculate the height based on the number of rows in the table
        const rowHeight = 30; // Average height for each row
        const headerHeight = 50; // Height for the table header
        const maxTableHeight = 150; // Max height limit for the table

        const calculatedHeight = this.data.length * rowHeight + headerHeight;

        return `height: ${Math.min(calculatedHeight, maxTableHeight)}px;`;
    }
    
}