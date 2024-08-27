import { LightningElement, track } from 'lwc';
import getLatestFileId from '@salesforce/apex/File.getLatestFileId';
import getCSVFileContent from '@salesforce/apex/File.getCSVFileContent';

export default class CsvTable extends LightningElement {
    @track data = [];
    @track columns = [];
    @track error;

    connectedCallback() {
        this.loadFileIdAndData();
    }

    loadFileIdAndData() {
        getLatestFileId()
            .then(fileId => {
                return getCSVFileContent({ fileId: fileId });
            })
            .then(result => {
                const csvData = atob(result); // Decode base64
                this.processCSVData(csvData);
            })
            .catch(error => {
                this.error = 'Error loading CSV data: ' + error.body.message;
            });
    }

    processCSVData(csvData) {
        const rows = csvData.split('\n');
        if (rows.length > 0) {
            const headers = rows[0].split(',');
            this.columns = headers.map(header => ({ label: header, fieldName: header }));
            this.data = rows.slice(1).map(row => {
                const values = row.split(',');
                const obj = {};
                headers.forEach((header, index) => {
                    obj[header] = values[index];
                });
                return obj;
            });
        }
    }
}
