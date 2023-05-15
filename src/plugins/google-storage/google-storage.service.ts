import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { File, Storage } from '@google-cloud/storage';
import { PassThrough } from 'stream';

import appConfig from '../../config/app.config';

import { detectMimeTypeFromBase64 } from '../../utils/detect-mime-type.util';

import { UploadFileInput } from './dto/upload-file-input.dto';

@Injectable()
export class GoogleStorageService {
  private readonly storage: Storage;

  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
  ) {
    const { googleServiceAccount } = this.appConfiguration;

    this.storage = new Storage({
      projectId: googleServiceAccount.projectId,
      credentials: {
        client_email: googleServiceAccount.clientEmail,
        private_key: googleServiceAccount.privateKey,
        type: googleServiceAccount.type,
      },
    });
  }

  public async uploadFile(input: UploadFileInput): Promise<File> {
    const { bucketName, sourcePath, destinationPath } = input;

    const [response] = await this.storage
      .bucket(bucketName)
      .upload(sourcePath, {
        destination: destinationPath,
        metadata: {
          // Enable long-lived HTTP caching headers
          // Use only if the contents of the file will never change
          // (If the contents will change, use cacheControl: 'no-cache')
          // cacheControl: 'public, max-age=31536000'
          cacheControl: 'no-cache',
        },
      });

    return response;
  }

  public async uploadFileFromBase64(input: any): Promise<File> {
    const { bucketName, base64, destinationPath } = input;

    // create a buffer stream
    const bufferStream = new PassThrough();

    // convert base64 to buffer
    bufferStream.end(Buffer.from(base64, 'base64'));

    // get the bucket
    const existingBucket = this.storage.bucket(bucketName);

    // create a file
    const file = existingBucket.file(destinationPath);

    // get the mime type
    const mimeType = detectMimeTypeFromBase64(base64);

    // upload the file
    await new Promise<void>((resolve, reject) => {
      bufferStream
        .pipe(
          file.createWriteStream({
            metadata: {
              contentType: mimeType,
              // Enable long-lived HTTP caching headers
              // Use only if the contents of the file will never change
              // (If the contents will change, use cacheControl: 'no-cache')
              // cacheControl: 'public, max-age=31536000'
              cacheControl: 'no-cache',
            },
          }),
        )
        .on('error', function (err) {
          return reject(err);
        })
        .on('finish', function () {
          return resolve();
        });
    });

    return file;
  }
}
