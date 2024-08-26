import { LightningElement, track } from 'lwc';
import getPlacements from '@salesforce/apex/HireCount.getPlacements';
import getPlacementDetails from '@salesforce/apex/HireCount.getPlacementDetails';
import { exportCSVFile } from 'c/utils'; // Utility function for CSV export

export default class PlacementVisualizer extends LightningElement {
    @track filterType = 'last5years';
    @track selectedValue = '';
    @track placements = [];
    @track selectedValueOptions = [];
    @track isModalOpen1 = false;
    @track placementDetails = [];
    @track isModalOpen = false;
    @track isModalOpen1 = false;

    filterOptions = [
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Monthly', value: 'monthly' },
        { label: 'Yearly', value: 'yearly' },
        { label: 'Last 5 Years', value: 'last5years' }
    ];

    monthlyOptions = [
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

    yearlyOptions = Array.from({ length: 1001 }, (_, i) => {
        const year = 2000 + i;
        return { label: year.toString(), value: year.toString() };
    });

    columns = [
        { label: 'Selected Value', fieldName: 'selectedValue' },
        {
            label: 'Count of Placements',
            fieldName: 'count',
            type: 'button',
            typeAttributes: {
                label: { fieldName: 'count' },
                name: 'showDetails',
                variant: 'base'
            }
        }
    ];

    detailColumns = [
        { label: 'Name', fieldName: 'Name' },
        { label: 'Candidate Name', fieldName: 'Candidate_Name__c' },
        { label: 'Bench ID', fieldName: 'Bench_ID__c' },
        { label: 'Job Code', fieldName: 'Job_Code__c' },
        { label: 'Job Title', fieldName: 'Job_Title__c' },
        { label: 'Submitted By', fieldName: 'Submitted_By__c' }
    ];

    connectedCallback() {
        this.initializeDefaults();
        this.fetchPlacements();
    }

    initializeDefaults() {
        const today = new Date();
        const currentMonth = (today.getMonth() + 1).toString(); // Months are zero-indexed
        const currentYear = today.getFullYear().toString();

        switch (this.filterType) {
            case 'monthly':
                this.selectedValue = currentMonth;
                this.selectedValueOptions = this.monthlyOptions;
                break;
            case 'yearly':
                this.selectedValue = currentYear;
                this.selectedValueOptions = this.yearlyOptions;
                break;
            case 'daily':
                this.selectedValue = today.toISOString().split('T')[0]; // Format YYYY-MM-DD
                this.selectedValueOptions = [];
                break;
            case 'weekly':
            case 'last5years':
                this.selectedValue = '';
                this.selectedValueOptions = [];
                break;
            default:
                this.selectedValue = '';
                this.selectedValueOptions = [];
                break;
        }
    }
    handleFilterChange(event) {
        this.filterType = event.detail.value;
        this.initializeDefaults();
        this.fetchPlacements();
    }

    handleValueChange(event) {
        this.selectedValue = event.detail.value;
        this.fetchPlacements();
    }

    fetchPlacements() {
        getPlacements({ 
            filterType: this.filterType, 
            selectedValue: this.selectedValue 
        })
        .then(data => {
            this.placements = data;
        })
        .catch(error => {
            console.error('Error fetching placements:', error);
        });
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const selectedValue = event.detail.row.selectedValue; // This should be the month number (1, 2, 3, etc.)
    
        console.log('Action Name:', actionName);
        console.log('Selected Value (Month):', selectedValue);
    
        if (actionName === 'showDetails') {
            this.fetchPlacementDetails(this.filterType, selectedValue);
        }
    }
    
    fetchPlacementDetails(filterType, selectedValue) {
        console.log('Fetching placement details for filterType:', filterType, 'and selectedValue (Month):', selectedValue);
    
        getPlacementDetails({ filterType, selectedValue })
            .then(data => {
                console.log('Fetched Placement Details:', data);
                this.placementDetails = data;
                this.isModalOpen = true; // Open the modal to display the details
            })
            .catch(error => {
                console.error('Error fetching placement details:', error);
            });
    }
    
    
    
    
    
    closeModal() {
        this.isModalOpen = false;
    }
    

    //CSV File
    downloadCSV() {
        // Convert the data into CSV format
        const csvString = this.exportCSVFile(this.detailColumns, this.placementDetails, 'Placement_Metrics');

        // Create a temporary link element and trigger the download
        const hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvString);
        hiddenElement.target = '_self';
        hiddenElement.download = 'Placement_Metrics.csv';  // File name
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
}