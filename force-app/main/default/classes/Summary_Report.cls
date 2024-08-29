public with sharing class Summary_Report {
    @AuraEnabled(cacheable=true)
    public static List<AggregateResult> getData(String filter, String selectedValue, Date customStartDate, Date customEndDate) {
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
            startDate = today; // Default to today if no valid filter
            endDate = today;
        }

        system.debug('Start Date: ' + startDate + ', End Date: ' + endDate);
        
        // Return the query results
        return [SELECT Sales_Team_Member__c, First_Name__c 
                FROM Job_Submission__c 
                WHERE Submitted_On__c >= :startDate 
                  AND Submitted_On__c <= :endDate
                GROUP BY Sales_Team_Member__c, First_Name__c];
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

    @AuraEnabled(cacheable=true)
    public static Job_Submission__c getHighestStageRecord(String consultantName) {
    if (String.isEmpty(consultantName)) {
        return null;
    }
    
    // Fetch all records for the given consultant name
    List<Job_Submission__c> jobSubmissions = [
        SELECT Sales_Team_Member__c, First_Name__c, Job_Submitted__c, Vendor_Name__c, Interview_Schedule_Date__c, Interview_Status__c, Placement_Confirmed__c
        FROM Job_Submission__c
        WHERE First_Name__c = :consultantName
    ];
    
    // Initialize variables to store the record with the highest stages and the max stage count
    Job_Submission__c highestStageRecord = null;
    Integer maxStageCount = -1; // Initialize to -1 to handle records with 0 stages
    
    // Check if there is only one record and its status is 'Failed'
    if (jobSubmissions.size() == 1 && jobSubmissions[0].Interview_Status__c == 'Failed') {
        return jobSubmissions[0];
    }
    
    for (Job_Submission__c submission : jobSubmissions) {
        // Ignore records where the interview status is 'Failed'
        if (submission.Interview_Status__c == 'Failed') {
            continue;
        }
        
        Integer stageCount = 0;
        
        // Check each stage condition and count the number of stages satisfied
        if (submission.Job_Submitted__c != null) stageCount++;
        if (submission.Interview_Schedule_Date__c != null) stageCount++;
        if (submission.Interview_Status__c == 'Cleared') stageCount++;
        if (submission.Placement_Confirmed__c == true) stageCount++;
        
        // Update the record if the current one has more stages satisfied
        if (stageCount > maxStageCount) {
            maxStageCount = stageCount;
            highestStageRecord = submission;
        }
    }
    
    return highestStageRecord;
}

    
    
}