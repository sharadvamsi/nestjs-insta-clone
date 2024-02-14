import { Injectable, NotFoundException } from '@nestjs/common';
import { User, UserDocument } from './user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {MulterFile} from 'multer'
import { v4 as uuid } from 'uuid';
import { Storage } from '@google-cloud/storage';
import { Readable } from 'stream';

@Injectable()
export class AppService {
  constructor(@InjectModel (User.name) private UserModel: Model <UserDocument>) {}
  async login({email,name,image} : {email:string,name:string,image:string}): Promise<any> {

    const userExists = await this.UserModel.findOne({
      email:email
    })

    if(!userExists){
      const createdUser = new this.UserModel({
        email,name,image
      })
      await createdUser.save()

      return createdUser
    }else{
      return userExists
    }
    
    
  }




  async updateUserProfileImage(userId: string, profileImage: MulterFile): Promise<User> {
    try {
      const user = await this.UserModel.findById(userId);
  
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      // Remove the old profile image from the storage bucket if it exists
      if (user.image) {
        try {
          await this.deleteImage(user.image);
        } catch (deleteError) {
          // Log or handle the error if deletion fails
          console.error('Failed to delete old profile image:', deleteError);
        }
      }
  
      // Upload the new profile image and update the user's profile image URL
      user.image = await this.uploadProfileImage(profileImage);
      await user.save();
  
      return user;
    } catch (error) {
      throw error;
    }
  }

  private async uploadProfileImage(file: MulterFile ): Promise<string> {
    const storage = new Storage()
    const bucketName = process.env.GCP_BUCKET_NAME;
    const fileName = `${uuid()}_${file.originalname}`;

    const fileStream = new Readable();
    fileStream.push(file.buffer);
    fileStream.push(null);

    const writeStream = storage.bucket(bucketName).file(fileName).createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    fileStream.pipe(writeStream);

    await new Promise((resolve, reject) => {
      writeStream
        .on('finish', resolve)
        .on('error', (error) => {
          reject(error);
        });
    });

    const imageUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
    return imageUrl;
  }


  




  async deleteUser(userId: string): Promise<void> {
    try {
      // Find the user by their userId
      const user = await this.UserModel.findById(userId);
  
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      // Delete the user's profile image from the storage bucket if it exists
      if (user.image) {
        try {
          await this.deleteImage(user.image);
        } catch (deleteError) {
          // Log or handle the error if deletion fails
          console.log("image doesn't exists")
        }
      }
  
      // Delete the user from the database
      await this.UserModel.findByIdAndDelete(userId);
    } catch (error) {
      throw error;
    }
  }
  

  

  private async deleteImage(imageUrl: string): Promise<void> {
    const storage = new Storage()
    const bucketName = process.env.GCP_BUCKET_NAME;
    const fileName = imageUrl.split('/').pop();

    await storage.bucket(bucketName).file(fileName).delete();
  }
}
