import { LightningElement, wire, track } from 'lwc';
import getJobPostingsByClient from '@salesforce/apex/Client_Score_Report.getJobPostingsByClient';

const columns = [
    { label: 'Client Name', fieldName: 'clientName', type: 'text' },
    { label: 'Job Count', fieldName: 'jobCount' }
];

// export default class ClientScoreCard extends LightningElement {
//     clientData;
//     columns = columns;
//     selectedTimeRange = '';
//     timeRangeOptions = [
//         { label: 'Weekly', value: 'weekly' },
//         { label: 'Monthly', value: 'monthly' },
//         { label: 'Yearly', value: 'yearly' }
//     ];
//     isTimeRangeModalOpen = false;

//     @wire(getJobPostingsByClient, { timeRange: '$selectedTimeRange' })
//     wiredClientData({ error, data }) {
//         if (data) {
//             this.clientData = data.map(record => ({
//                 ...record,
//                 id: record.clientName,
//                 count: record.jobCount
//             }));
//         } else if (error) {
//             console.error('Error retrieving client data:', error);
//         }
//     }
//     openTimeRangeModal() {
//         this.isTimeRangeModalOpen = true;
//     }

//     closeTimeRangeModal() {
//         this.isTimeRangeModalOpen = false;
//     }

//     handleTimeRangeChange(event) {
//         this.selectedTimeRange = event.detail.value;
//         this.isTimeRangeModalOpen = false;
//     }
// }
export default class ClientScoreReportDashboard extends LightningElement {
    data=[]
    error;
    calendarFilter = 'monthly';
    selectedValue=this.getDefaultSelectedValue();
    customStartDate = null;
    customEndDate = null;
    @track isModalOpen = false;
    columns = columns;

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
        { label: 'December', value: '12' },
    ];

    yearOptions = Array.from({ length: 1001 }, (_, i) => {
        const year = 2000 + i;
        return { label: year.toString(), value: year.toString() };
    });

    @wire(getJobPostingsByClient, { filter: '$calendarFilter', selectedValue: '$selectedValue', customStartDate: '$customStartDate', customEndDate: '$customEndDate' })
    wiredPlacements({ error, data }) {
        if (data) {
            this.data = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.data = undefined;
        }
    }

    handleCalendarChange(event) {
        this.calendarFilter = event.detail.value;
        if (this.calendarFilter === 'daily' || this.calendarFilter === 'weekly') {
            this.selectedValue = null;
        } else {
            this.selectedValue = this.getDefaultSelectedValue();
        }
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
        if (this.calendarFilter === 'monthly') {
            let today = new Date();
            return String(today.getMonth() + 1); // Default to current month
        } else if (this.calendarFilter === 'yearly') {
            let today = new Date();
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
        const maxTableHeight = 150; // Max height limit for the table

        const calculatedHeight = this.data.length * rowHeight + headerHeight;

        return `height: ${Math.min(calculatedHeight, maxTableHeight)}px;`;
    }
}