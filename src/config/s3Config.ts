import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

// This is the S3 client configuration file. It initializes the S3 client with the necessary credentials and region.
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Upload a file to S3 bucket and return the file key
export const uploadToS3Bucket = async (
  file: Buffer | File,
  key: string,
  contentType: string
) => {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  try {
    await s3Client.send(command);
    console.log(`File uploaded successfully to S3: ${key}`);
    return { key };
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw new Error("Error uploading file to S3");
  }
};

// get a file from S3 bucket via the file key
export const getFromS3Bucket = async (key: string) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
  });
  try {
    const response = await s3Client.send(command);
    const body = await response.Body?.transformToByteArray();
    if (!body) {
      throw new Error("File not found in S3 bucket");
    }
    return Buffer.from(body);
  } catch (error) {
    console.error("Error retrieving file from S3:", error);
    throw new Error("Error retrieving file from S3");
  }
};

// delete a file from S3 bucket via the file key
export const deleteFromS3Bucket = async (key: string) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
  });

  try {
    await s3Client.send(command);
    console.log(`File deleted successfully from S3: ${key}`);
    return { key };
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    throw new Error("Error deleting file from S3");
  }
};
