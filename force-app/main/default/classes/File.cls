public with sharing class File {
    @AuraEnabled(cacheable=true)
    public static String getLatestFileId() {
        // Query the latest ContentVersion based on CreatedDate
        ContentVersion latestContentVersion = [SELECT ContentDocumentId 
                                              FROM ContentVersion 
                                              WHERE Title = 'scanner-report' 
                                              ORDER BY CreatedDate DESC 
                                              LIMIT 1];
        return latestContentVersion.ContentDocumentId;
    }

    @AuraEnabled(cacheable=true)
    public static String getCSVFileContent(String fileId) {
        ContentVersion contentVersion = [SELECT VersionData 
                                         FROM ContentVersion 
                                         WHERE ContentDocumentId = :fileId 
                                         LIMIT 1];
        Blob fileBlob = contentVersion.VersionData;
        return EncodingUtil.base64Encode(fileBlob);
    }
}
