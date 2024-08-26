public with sharing class JobMetrics {

    @AuraEnabled(cacheable=true)
    public static List<JobStatus> getJobStatus(String filter, String selectedValue, Date customStartDate, Date customEndDate) {
        Date[] dateRange = getDateRange(filter, selectedValue, customStartDate, customEndDate);
        Date startDate = dateRange[0];
        Date endDate = dateRange[1];

        System.debug('Entering getJobStatus method'); // Debug statement
        Map<String, Integer> statusCounts = new Map<String, Integer>{
            'Active' => 0,
            'Inactive' => 0
        };

        String query = 'SELECT Job_Status__c, COUNT(Id) FROM Job_Posting__c WHERE CreatedDate >= :startDate AND CreatedDate <= :endDate GROUP BY Job_Status__c';
        AggregateResult[] groupedResults = Database.query(query);
        
        for (AggregateResult ar : groupedResults) {
            String status = (String) ar.get('Job_Status__c');
            Integer count = Integer.valueOf(ar.get('expr0'));
            System.debug('Status: ' + status + ', Count: ' + count); // Debug statement
            if (statusCounts.containsKey(status)) {
                statusCounts.put(status, count);
            }
        }
        
        System.debug('Final status counts: ' + statusCounts); // Debug statement
        
        // Transform the map into a list of JobStatus objects
        List<JobStatus> result = new List<JobStatus>();
        for (String status : statusCounts.keySet()) {
            result.add(new JobStatus(status, statusCounts.get(status)));
        }
        return result;
    }

    @AuraEnabled(cacheable=true)
    public static List<JobStatus> getActiveInactiveJobCounts(String filter, String selectedValue, Date customStartDate, Date customEndDate) {
        Date[] dateRange = getDateRange(filter, selectedValue, customStartDate, customEndDate);
        Date startDate = dateRange[0];
        Date endDate = dateRange[1];

        // Initialize counts for Active and Inactive statuses
        Map<String, Integer> statusCounts = new Map<String, Integer>{
            'Active' => 0,
            'Inactive' => 0
        };

        // Query to get the counts of Active and Inactive jobs
        String query = 'SELECT Job_Status__c, COUNT(Id) FROM Job_Posting__c WHERE Job_Status__c IN (\'Active\', \'Inactive\') AND CreatedDate >= :startDate AND CreatedDate <= :endDate GROUP BY Job_Status__c';
        AggregateResult[] groupedResults = Database.query(query);

        for (AggregateResult ar : groupedResults) {
            String status = (String) ar.get('Job_Status__c');
            Integer count = Integer.valueOf(ar.get('expr0'));
            if (statusCounts.containsKey(status)) {
                statusCounts.put(status, count);
            }
        }

        // Prepare the result for Active and Inactive counts
        List<JobStatus> result = new List<JobStatus>();
        for (String status : statusCounts.keySet()) {
            result.add(new JobStatus(status, statusCounts.get(status)));
        }

        return result;
    }

    private static Date[] getDateRange(String filter, String selectedValue, Date customStartDate, Date customEndDate) {
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

        return new Date[] {startDate, endDate};
    }

    public class JobStatus {
        @AuraEnabled
        public String status { get; set; }
        @AuraEnabled
        public Integer count { get; set; }
        
        public JobStatus(String status, Integer count) {
            this.status = status;
            this.count = count;
        }
    }

    public static Integer daysInMonth(Integer year, Integer month) {
        if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) {
            return 31;
        } else if (month == 4 || month == 6 || month == 9 || month == 11) {
            return 30;
        } else if (month == 2) {
            return Date.isLeapYear(year) ? 29 : 28;
        }  else {
            throw new IllegalArgumentException('Invalid month: ' + month);
        }
    }

    @AuraEnabled(cacheable=true)
public static List<Job_Posting__c> getJobStatusInformation(String jobByStatus, String filter, String selectedValue, Date customStartDate, Date customEndDate) {
    Date[] dateRange = getDateRange(filter, selectedValue, customStartDate, customEndDate);
    Date startDate = dateRange[0];
    Date endDate = dateRange[1];

    List<Job_Posting__c> jobStatusList = [SELECT Id, Name, Job_Title__c, Pay_Period__c, Pay_Rate__c, Sell_Rate__c, Job_Status__c,
                                                 Client_Account__c, Client_Account__r.Name, Vendor_Account__c, Vendor_Account__r.Name
                                          FROM Job_Posting__c
                                          WHERE Job_Status__c = :jobByStatus
                                          AND CreatedDate >= :startDate AND CreatedDate <= :endDate];
    
    System.debug('Job Status: ' + jobByStatus + ', Filter: ' + filter + ', Data: ' + jobStatusList);
    return jobStatusList;
}

}