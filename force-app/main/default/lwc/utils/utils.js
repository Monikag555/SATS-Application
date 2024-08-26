// force-app/main/default/lwc/utils/utils.js

/**
 * Utility function to export data as CSV
 * @param {Array} headers - Column headers for CSV
 * @param {Array} items - Data to be exported
 * @param {String} fileTitle - Title of the file (optional)
 * @returns {String} - CSV formatted string
 */
export function exportCSVFile(headers, items, fileTitle) {
    if (!items || !items.length) {
        return null;
    }

    const jsonObject = JSON.stringify(items);
    const result = convertToCSV(jsonObject, headers);

    return result;
}

/**
 * Convert JSON object to CSV format
 * @param {Object} objArray - Array of JSON objects
 * @param {Array} headers - Column headers for CSV
 * @returns {String} - CSV formatted string
 */
function convertToCSV(objArray, headers) {
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