import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import s3Client from "../config/upload/s3.js";
import env from "../config/env.js";

export default class UploadRepo {
  async uploadFile(buffer, fileName, mimeType, folder) {
    const key = `${folder}/${randomUUID()}-${fileName}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    );

    return `https://${env.S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
  }

  async deleteFile(key) {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
      }),
    );
  }
}
