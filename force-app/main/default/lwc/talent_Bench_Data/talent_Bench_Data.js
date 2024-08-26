import { LightningElement, wire, track, api } from 'lwc';
import getTalentBenchRecords from '@salesforce/apex/Talent_Bench_Data.getTalentBenchRecords';
import getJobDetails from '@salesforce/apex/Talent_Bench_Data.getJobDetails';

export default class TalentBenchDetailsModal extends LightningElement {
    @track data = [];  // Data for the main datatable
    @track isModalOpen = false;  // Modal visibility state
    @track jobData = [];  // Data for the modal datatable
    @track talentBenchId;  
    @api recordId;// ID of the selected Talent Bench record

    // Columns for the initial datatable
    columns = [
        { 
            label: 'Talent Bench ID', 
            fieldName: 'Name', 
            type: 'button', 
            typeAttributes: { 
                label: { fieldName: 'Name' }, 
                name: 'showDetails',
                variant: 'base' 
            }
        },
        { label: 'First Name', fieldName: 'First_Name__c' },
        { label: 'Last Name', fieldName: 'Last_Name__c' },
        { label: 'Email Address', fieldName: 'Email_Address__c' },
        { label: 'Phone Number', fieldName: 'Phone_Number__c' }
    ];

    // Columns for the modal datatable
    modalColumns = [
        { label: 'Talent Bench Name', fieldName: 'Talent_Bench_Name' },
        { label: 'First Name', fieldName: 'First_Name__c' },
        { label: 'Last Name', fieldName: 'Last_Name__c' },
        { label: 'Job ID', fieldName: 'Job_ID_Name' },
        { label: 'Job Title', fieldName: 'Job_Title__c' },
        { label: 'Email Address', fieldName: 'Email_Address__c' },
        { label: 'Phone Number', fieldName: 'Phone_Number__c' }
    ];

    // Fetch all Talent Bench records
    @wire(getTalentBenchRecords,{recordId:'$recordId'})
    wiredRecords({ error, data }) {
        if (data) {
            this.data = data;
        } else if (error) {
            console.error('Error fetching Talent Bench records:', error);
        }
    }

    // Handle row action for opening the modal
    handleRowAction(event) {
        const row = event.detail.row;
        this.talentBenchId = row.Id; // Get selected Talent Bench ID
        this.openModal();
    }

    // Fetch job details related to the selected Talent Bench record and open the modal
    openModal() {
        if (this.talentBenchId) {
            getJobDetails({ talentBenchId: this.talentBenchId })
            .then(result => {
                // Map the result to include Talent_Bench_ID__r.Name as Talent_Bench_Name
                this.jobData = result.map(item => ({
                    ...item,
                    Talent_Bench_Name: item.Talent_Bench_ID__r.Name,
                    Job_ID_Name: item.Job_ID__r.Name
                }));
                this.isModalOpen = true; // Assuming you want to open the modal
                console.log('Job::'+JSON.stringify(this.jobData));
            })
            .catch(error => {
                console.error('Error fetching job details:', error);
            });
    }
}

    // Close the modal
    closeModal() {
        this.isModalOpen = false;
        this.jobData = [];  // Clear the job data when closing the modal
    }
}