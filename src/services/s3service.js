import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  //   credentials: {
  //     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  //     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  //   },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

class S3Service {
  // Add S3 related methods here
  async uploadFile(fileBuffer, fileName, contentType) {
    // Implementation for uploading a file to S3
    const key = `uploads/${fileName}`;
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    });
    await s3Client.send(command);
    return key;
    // return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }

  async getFileUrl(fileKey) {
    // Implementation for generating a pre-signed URL for accessing a file
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL valid for 1 hour
    return url;
  }

  async getFile(fileKey) {
    // Implementation for retrieving a file from S3
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });
    const response = await s3Client.send(command);

    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }
}

export default new S3Service();
