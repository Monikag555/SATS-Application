public with sharing class Client_Score_Report {
    @AuraEnabled(cacheable=true)
    // public static List<AggregateResult> getJobPostingsByClient() {
    //     return [
    //         SELECT Client_Account__c, Client_Account__r.Name, COUNT(Id) jobCount
    //         FROM Job_Posting__c
    //         GROUP BY Client_Account__c, Client_Account__r.Name
    //     ];
    // }
    public static List<AggregateResult> getJobPostingsByClient(String filter, String selectedValue, Date customStartDate, Date customEndDate) {
        Date today = Date.today();
        Date startDate;
        Date endDate;

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
            endDate = Date.newInstance(year, month, Date.daysInMonth(year, month));
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
        }
        else {
            startDate = today; // Default to today if no valid filter
            endDate = today;
        }

        return [
            SELECT Client_Account__c, Client_Account__r.Name clientName, COUNT(Id) jobCount, Job_Posted_On__c
            FROM Job_Posting__c
            WHERE Job_Posted_On__c >= :startDate AND Job_Posted_On__c <= :endDate AND Client_Account__r.Type_of_Account__c = 'Client'
            GROUP BY Client_Account__c, Client_Account__r.Name, Job_Posted_On__c
        ];
    }

    // Helper method to get the number of days in a month for a given year and month
    public static Integer daysInMonth(Integer year, Integer month) {
        if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) {
            return 31;
        } else if (month == 4 || month == 6 || month == 9 || month == 11) {
            return 30;
        } else if (month == 2) {
            if (Date.isLeapYear(year)) {
                return 29;
            } else {
                return 28;
            }
        } else {
            throw new IllegalArgumentException('Invalid month: ' + month);
        }
    }
}