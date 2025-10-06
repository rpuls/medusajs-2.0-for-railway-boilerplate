# MinIO File Provider Module

This module provides MinIO integration for file storage in Medusa. It implements the file provider interface to handle file uploads, downloads, and deletions using MinIO as the storage backend.

## Configuration

The module requires the following environment variables:

```env
MINIO_ENDPOINT=your-minio-endpoint
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
MINIO_BUCKET=your-bucket-name  # Optional, defaults to 'medusa-media'
```

## Features

- Automatic bucket creation and configuration
- Default bucket name 'medusa-media' (can be overridden if needed)
- Automatic bucket policy configuration for public read access
- Unique file naming using ULID
- Proper content type and metadata handling
- Presigned URLs for secure file access
- Fallback to local storage if MinIO is not configured

## Usage

The module is automatically configured in medusa-config.js when the required environment variables are present:

```javascript
{
  resolve: './src/modules/minio-file',
  options: {
    endPoint: MINIO_ENDPOINT,
    accessKey: MINIO_ACCESS_KEY,
    secretKey: MINIO_SECRET_KEY,
    bucket: MINIO_BUCKET  // Optional, defaults to 'medusa-media'
  }
}
```

### Important Note About Configuration Changes

When changing configuration (especially the bucket name):
1. Stop the Medusa server
2. Delete the `.medusa/server` directory to clear cached configuration
3. Restart the server

This is necessary because Medusa caches environment variables in the `.medusa/server` directory.

### Automatic Setup

When the service starts:
1. It checks for the existence of the configured bucket (default: 'medusa-media')
2. Creates the bucket if it doesn't exist
3. Configures or updates the bucket policy for public read access
4. Logs all initialization steps for transparency

This happens only once when the service starts, not on every file operation.

### File Upload

Files are automatically uploaded to MinIO when using Medusa's file upload endpoints or services. Each file is stored with:
- A unique name generated using ULID
- The original file extension preserved
- Proper content type set
- Original filename stored in metadata
- Public read access enabled

### File Access

Files can be accessed in two ways:
1. Direct URL: `https://${MINIO_ENDPOINT}/${BUCKET_NAME}/${fileKey}`
   - Files are publicly accessible due to bucket policy configuration
2. Presigned URL: Generated on demand with 24-hour expiration
   - Useful for temporary access to files

### File Deletion

Files are automatically deleted from MinIO when using Medusa's file deletion endpoints or services.

## Implementation Details

- Port 443 and SSL are hardcoded as this is standard for production MinIO instances
- Files are given unique names using ULID to prevent collisions
- Original filenames are preserved in metadata
- Non-existent file deletions are logged but don't throw errors
- Presigned URLs are valid for 24 hours
- Bucket policy is automatically configured for public read access
- Files are uploaded with 'public-read' ACL

## Security Considerations

The module configures the MinIO bucket for public read access, which means:
- All uploaded files will be publicly accessible via their URLs
- This is suitable for public assets like product images
- For private files, consider using presigned URLs instead of direct access

## Migration Note

If you're migrating from another storage solution or have an existing bucket:
1. Set the MINIO_BUCKET environment variable to your existing bucket name
2. Delete the `.medusa/server` directory to clear cached configuration
3. Restart the server
4. The module will use your existing bucket and ensure it has the correct public read policy

## Troubleshooting

1. **Files uploading to wrong bucket**: 
   - Delete the `.medusa/server` directory to clear cached configuration
   - Restart the server
   - The correct bucket configuration will be used

2. **Bucket policy issues**:
   - The service attempts to set/update the bucket policy on startup
   - Check the logs for any policy-related errors
   - Ensure your MinIO credentials have sufficient permissions

## Additional Info & Documentation

This module is based on the official Medusa file provider interface. For more information, see:

* [How to Create a File Provider Module](https://docs.medusajs.com/resources/references/file-provider-module)
* [MinIO JavaScript Client API Reference](https://min.io/docs/minio/linux/developers/javascript/API.html)
* [MinIO Bucket Policy Documentation](https://min.io/docs/minio/linux/administration/identity-access-management/policy-based-access-control.html)
