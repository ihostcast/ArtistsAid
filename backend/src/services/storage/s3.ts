import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { services } from '../../config/services';

const s3Client = new S3Client({
  region: services.aws.region,
  credentials: {
    accessKeyId: services.aws.accessKeyId,
    secretAccessKey: services.aws.secretAccessKey
  }
});

export const uploadFile = async (key: string, body: Buffer, contentType: string) => {
  try {
    const command = new PutObjectCommand({
      Bucket: services.aws.s3Bucket,
      Key: key,
      Body: body,
      ContentType: contentType
    });
    await s3Client.send(command);
    return `https://${services.aws.s3Bucket}.s3.${services.aws.region}.amazonaws.com/${key}`;
  } catch (error) {
    throw new Error('Error uploading file to S3');
  }
};

export const getFile = async (key: string) => {
  try {
    const command = new GetObjectCommand({
      Bucket: services.aws.s3Bucket,
      Key: key
    });
    const response = await s3Client.send(command);
    return response.Body;
  } catch (error) {
    throw new Error('Error getting file from S3');
  }
};
