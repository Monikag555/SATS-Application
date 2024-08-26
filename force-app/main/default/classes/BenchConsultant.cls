public with sharing class BenchConsultant {

    @AuraEnabled(cacheable=true)
    public static List<Talent_Bench__c> getBenchConsultant(String filter, String selectedValue, Date customStartDate, Date customEndDate) {
        Map<String, Date> dateRange = getDateRange(filter, selectedValue, customStartDate, customEndDate);
        Date startDate = dateRange.get('startDate');
        Date endDate = dateRange.get('endDate');
        
        system.debug('Start Date: ' + startDate + ', End Date: ' + endDate);

        // Return the query results
        String query = 'SELECT Name, First_Name__c, Last_Name__c, Email_Address__c, Phone_Number__c, LinkedIn_URL__c, Work_Authhorization__c, State__c, Country__c, CreatedDate ' +
                       'FROM Talent_Bench__c ' +
                       'WHERE Bench_Status__c = \'Active\' AND CreatedDate >= :startDate AND CreatedDate <= :endDate';
        List<Talent_Bench__c> results = Database.query(query);
        return results;
    }

//     @AuraEnabled(cacheable=true)
// public static Integer getBenchIdCount(String filter, String selectedValue, Date customStartDate, Date customEndDate) {
//     Map<String, Date> dateRange = getDateRange(filter, selectedValue, customStartDate, customEndDate);
//     Date startDate = dateRange.get('startDate');
//     Date endDate = dateRange.get('endDate');
    
//     // Query to get the count of Bench_Id where Bench_Status is Active
//     String countQuery = 'SELECT COUNT() FROM Candidate__c WHERE Bench_Status__c = \'Active\' AND CreatedDate >= :startDate AND CreatedDate <= :endDate';
//     Integer count = Database.countQuery(countQuery);
    
//     return count;
// }


    private static Map<String, Date> getDateRange(String filter, String selectedValue, Date customStartDate, Date customEndDate) {
        Date today = Date.today();
        Date startDate;
        Date endDate;

        // Determine the date range based on the filter
        if (filter == 'daily') {
            startDate = today;
            endDate = today;
        } else if (filter == 'weekly') {
            startDate = today.toStartOfWeek();
            endDate = startDate.addDays(6);
        } else if (filter == 'monthly') {
            Integer month = Integer.valueOf(selectedValue);
            Integer year = today.year();
            startDate = Date.newInstance(year, month, 1);
            endDate = Date.newInstance(year, month, daysInMonth(year, month));
        } else if (filter == 'yearly') {
            Integer year = Integer.valueOf(selectedValue);
            startDate = Date.newInstance(year, 1, 1);
            endDate = Date.newInstance(year, 12, 31);
        } else if (filter == 'custom') {
            if (customStartDate != null && customEndDate != null) {
                startDate = customStartDate;
                endDate = customEndDate;
            } else {
                throw new IllegalArgumentException('Custom dates must be provided for the custom filter');
            }
        } else {
            startDate = today; // Default to today if no valid filter
            endDate = today;
        }

        Map<String, Date> dateRange = new Map<String, Date>();
        dateRange.put('startDate', startDate);
        dateRange.put('endDate', endDate);
        return dateRange;
    }

    // Helper method to get the number of days in a month for a given year and month
    public static Integer daysInMonth(Integer year, Integer month) {
        if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) {
            return 31;
        } else if (month == 4 || month == 6 || month == 9 || month == 11) {
            return 30;
        } else if (month == 2) {
            return Date.isLeapYear(year) ? 29 : 28;
        } else {
            throw new IllegalArgumentException('Invalid month: ' + month);
        }
    }
}