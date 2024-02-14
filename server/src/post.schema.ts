import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Post {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  caption: string;

  @Prop({ required: true })
  userProfileUrl: string;

  @Prop({ required: true })
  userName: string;

  @Prop({ type: [String], default: [] }) // Likes is an array of user IDs
  likes: string[]; // Change likes to be an array of strings

  @Prop({ default: 0 }) // Default likes count to 0
  likesCount: number; // Add a separate field for likes count


  @Prop({ type: [{ userId: String, comment: String }] }) // Array of comments
  comments: { userId: string; comment: string }[];
}

export type PostDocument = Post & Document;

export const PostSchema = SchemaFactory.createForClass(Post);
