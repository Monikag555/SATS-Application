trigger CandidateTrigger on Candidate__c (before insert, before update) {
    // Collect all Job IDs from the Placement object
    Set<Id> jobIdsToExclude = new Set<Id>();
    
    for (Placement__c placement : [SELECT Job_Code__c FROM Placement__c]) {
        jobIdsToExclude.add(placement.Job_Code__c);
    }
    
    // Check if the selected Job ID is already in the Placement object
    for (Candidate__c candidate : Trigger.new) {
        if (candidate.Job_ID__c != null && jobIdsToExclude.contains(candidate.Job_ID__c)) {
            candidate.addError('The selected Job ID is already in placement and cannot be selected.');
        }
    }
}