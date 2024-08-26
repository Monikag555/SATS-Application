public with sharing class VendorSubmissions {
    @AuraEnabled(cacheable=true)
    public static List<Job_Submission__c> getVendorSubmissions(String filter, String selectedValue, Date customStartDate, Date customEndDate) {
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
            startDate = today;
            endDate = today;
        }

        system.debug('Start Date: ' + startDate + ', End Date: ' + endDate);

        String query = 'SELECT Job_ID__r.Name, Job_Title__c, Job_ID__r.Vendor_Account__r.Name, Job_ID__r.Sell_Rate__c, Talent_Bench_ID__r.Name, First_Name__c, Email_Address__c, Phone_Number__c, LinkedIn_Profile__c, Work_Authorization__c, Sales_Team_Member__c, CreatedDate FROM Job_Submission__c WHERE Job_Submitted__c = true AND CreatedDate >= :startDate AND CreatedDate <= :endDate';
        List<Job_Submission__c> results = Database.query(query);
        System.debug(results);
        return results;
    }

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