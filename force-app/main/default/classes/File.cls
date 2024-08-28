public with sharing class File {
    @AuraEnabled(cacheable=true)
    public static List<Map<String, String>> getAllScannerReportFiles() {
        List<ContentVersion> contentVersions = [
            SELECT ContentDocumentId, Title, CreatedDate 
            FROM ContentVersion 
            WHERE Title LIKE 'Scanner Report%' 
            ORDER BY CreatedDate DESC
        ];

        List<Map<String, String>> files = new List<Map<String, String>>();
        for (ContentVersion cv : contentVersions) {
            Map<String, String> fileData = new Map<String, String>();
            fileData.put('id', cv.ContentDocumentId);
            fileData.put('label', cv.Title + ' - ' + cv.CreatedDate.format('yyyy-MM-dd HH:mm:ss'));
            files.add(fileData);
        }
        return files;
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
