public with sharing class Talent_Bench_Data {
    @AuraEnabled(cacheable=true)
    public static List<Talent_Bench__c> getTalentBenchRecords(string recordId) {
        return [SELECT Name, First_Name__c, Last_Name__c, Email_Address__c, Phone_Number__c
                FROM Talent_Bench__c WHERE ID=:recordId];
    }

    @AuraEnabled(cacheable=true)
    public static List<Job_Submission__c> getJobDetails(String talentBenchId) {
        List<Job_Submission__c> jobSubmissionList = [SELECT Talent_Bench_ID__c, Talent_Bench_ID__r.Name, First_Name__c, Last_Name__c, Job_Id__c, Job_ID__r.Name, Job_Title__c, Email_Address__c, Phone_Number__c
                FROM Job_Submission__c
                WHERE Talent_Bench_ID__c = :talentBenchId];
        
        System.debug('Job Submission Data::' + jobSubmissionList);
        return jobSubmissionList;
    }
}