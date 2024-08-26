public with sharing class Placement_Report {
    @AuraEnabled(cacheable=true)
    public static List<Placement__c> getPlacements(String filter, String selectedValue, Date customStartDate, Date customEndDate) {
        // public static List<Placement__c> getPlacements(String filter, Date selectedDate) {
        // List<Placement__c> placements;
        
        // if (filter == 'daily') {
        //     placements = [
        //         SELECT Name, Bench_ID__c, Candidate_Name__c, Job_Code__c, Job_Title__c, Email__c, Phone_Number__c, Submitted_By__c, Client_Bill_Rate__c, Pay_Rate__c, Submitted_On__c 
        //         FROM Placement__c
        //         WHERE Submitted_On__c = :selectedDate
        //     ];
        // } else if (filter == 'weekly') {
        //     Date startOfWeek = selectedDate.toStartOfWeek();
        //     Date endOfWeek = startOfWeek.addDays(6);
        //     placements = [
        //         SELECT Name, Bench_ID__c, Candidate_Name__c, Job_Code__c, Job_Title__c, Email__c, Phone_Number__c, Submitted_By__c, Client_Bill_Rate__c, Pay_Rate__c, Submitted_On__c 
        //         FROM Placement__c
        //         WHERE Submitted_On__c >= :startOfWeek AND Submitted_On__c <= :endOfWeek
        //     ];
        // } else if (filter == 'monthly') {
        //     Integer year = selectedDate.year();
        //     Integer month = selectedDate.month();
        //     placements = [
        //         SELECT Name, Bench_ID__c, Candidate_Name__c, Job_Code__c, Job_Title__c, Email__c, Phone_Number__c, Submitted_By__c, Client_Bill_Rate__c, Pay_Rate__c, Submitted_On__c 
        //         FROM Placement__c
        //         WHERE CALENDAR_YEAR(Submitted_On__c) = :year AND CALENDAR_MONTH(Submitted_On__c) = :month
        //     ];
        // } else if (filter == 'yearly') {
        //     Integer year = selectedDate.year();
        //     placements = [
        //         SELECT Name, Bench_ID__c, Candidate_Name__c, Job_Code__c, Job_Title__c, Email__c, Phone_Number__c, Submitted_By__c, Client_Bill_Rate__c, Pay_Rate__c, Submitted_On__c 
        //         FROM Placement__c
        //         WHERE CALENDAR_YEAR(Submitted_On__c) = :year
        //     ];
        // } else {
        //     placements = new List<Placement__c>();
        // }

        // return placements;
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
        }else if (filter == 'custom') {
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

        return [
            SELECT Name, Bench_ID__c, Candidate_Name__c, Job_Code__c, Job_Title__c, Email__c, Phone_Number__c, Submitted_By__c, Client_Bill_Rate__c, Pay_Rate__c, Submitted_On__c 
            FROM Placement__c
            WHERE Submitted_On__c >= :startDate AND Submitted_On__c <= :endDate
        ];
    }

    // Helper method to get the number of days in a month for a given year and month
    public static Integer daysInMonth(Integer year, Integer month) {
        if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) {
            return 31;
        } else if (month == 4 || month == 6 || month == 9 || month == 11) {
            return 30;
        } else if (month == 2) {
            return 28;
        } else {
            throw new IllegalArgumentException('Invalid month: ' + month);
        }
    }
}