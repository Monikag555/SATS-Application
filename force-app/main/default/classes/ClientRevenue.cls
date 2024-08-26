public with sharing class ClientRevenue {
    @AuraEnabled(cacheable=true)
    public static List<AggregateResult> getClientRevenue(String filter, String selectedValue, Date customStartDate, Date customEndDate) {
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
        }
        else {
            startDate = today; // Default to today if no valid filter
            endDate = today;
        }

        system.debug('Start Date: ' + startDate + ', End Date: ' + endDate);
        
        // Return the query results
        return [SELECT Client_Name__c, COUNT(Id) jobCount, SUM(Total_Revenue__c) totalRevenue, SUM(Future_Revenue__c) futureRevenue
                FROM Placement__c 
                WHERE CreatedDate >= :startDate AND CreatedDate <= :endDate
                GROUP BY Client_Name__c];
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

    // Helper method to convert month name to month number
    // public static Integer monthFromName(String monthName) {
    //     Map<String, Integer> monthMap = new Map<String, Integer>{
    //         'January' => 1, 'February' => 2, 'March' => 3, 'April' => 4,
    //         'May' => 5, 'June' => 6, 'July' => 7, 'August' => 8,
    //         'September' => 9, 'October' => 10, 'November' => 11, 'December' => 12
    //     };
    //     if (monthMap.containsKey(monthName)) {
    //         return monthMap.get(monthName);
    //     } else {
    //         throw new IllegalArgumentException('Invalid month name: ' + monthName);
    //     }
    // }

    @AuraEnabled(cacheable=true)
    public static List<Job_Information__c> getJobInformationForSubmittedCandidates(String clientByName) {
        List<Job_Information__c> jobInformation = [SELECT id, Vendor_Name__c, Submitted_By__c, Consultant_Name__c, Consultant_Email__c, Job_Code__c, Client_Name__c, Job_Title__c, Phone_Number__c, Location__c, Status_Changed_On__c
            FROM Job_Information__c
            WHERE Client_Name__c = :clientByName];
        system.debug(clientByName+'test'+jobInformation);
        return jobInformation;
    }
    
     @AuraEnabled(cacheable=true)
    public static List<Job_Information__c> getJobInformationByClientName(String clientByName) {
       
        List<Job_Information__c> jobInformationList = [SELECT id,Vendor_Name__c,Submitted_By__c,Consultant_Name__c,Consultant_Email__c,Job_Code__c,Client_Name__c,Job_Title__c,Phone_Number__c,Location__c,Status_Changed_On__c
            FROM Job_Information__c
            WHERE Client_Name__c = :clientByName];
        system.debug(clientByName+'test'+jobInformationList);
        return jobInformationList;
    }
}