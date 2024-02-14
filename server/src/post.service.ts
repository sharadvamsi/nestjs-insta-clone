import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { MulterFile } from 'multer';
import { v4 as uuid } from 'uuid';
import { Storage } from '@google-cloud/storage';
import { Readable } from 'stream';
import { Post, PostDocument } from './post.schema';
import { User, UserDocument } from './user.schema';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>
    
  ) {}

  async getUserProfileData(userId: string): Promise<{ imageUrl: string; name: string }> {
    try {
      const user = await this.userModel.findById(userId); // Find the user by ID
  
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      return { imageUrl: user.image, name: user.name };
    } catch (error) {
      throw error;
    }
  }
  

  async createPost(userId: string, file: MulterFile, caption: string): Promise<PostDocument> {
    try {
      // Fetch user's profile URL from UserService
      const userProfileUrl = await this.getUserProfileData(userId);
      

      // Upload post image to GCP
      const imageUrl = await this.uploadPostImage(file);

      // Create new post document
      const post = new this.postModel({
        userId,
        imageUrl,
        caption,
        userProfileUrl: userProfileUrl.imageUrl,
        userName: userProfileUrl.name
      });

      // Save the new post document
      return post.save();
    } catch (error) {
      throw error;
    }
  }

  async uploadPostImage(file: MulterFile): Promise<string> {
    const storage = new Storage();
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

  async getAllPosts(): Promise<PostDocument[]> {
    try {
      return await this.postModel.find().exec();
    } catch (error) {
      throw error;
    }
  }

  async likePost(postId: string, userId: string): Promise<PostDocument> {
    try {
      const post = await this.postModel.findById(postId);

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      // Check if the user already liked the post
      const alreadyLiked = post.likes.includes(userId);
      if (alreadyLiked) {
        // Remove like if already liked
        post.likes = post.likes.filter(like => like !== userId);
      } else {
        // Add like if not already liked
        post.likes.push(userId);
      }

      // Update the likes count
      post.likesCount = post.likes.length;

      // Save the updated post
      return await post.save();
    } catch (error) {
      throw error;
    }
  }


  async addCommentToPost(postId: string, userId: string, comment: string): Promise<PostDocument> {
    try {
      const post = await this.postModel.findById(postId);
      if (!post) {
        throw new NotFoundException('Post not found');
      }

      post.comments.push({
        userId: userId,
        comment: comment,
      });

      return await post.save();
    } catch (error) {
      throw error;
    }
  }
}
