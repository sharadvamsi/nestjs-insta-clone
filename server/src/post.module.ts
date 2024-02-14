import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppModule } from './app.module'; // Import AppModule
import { PostSchema } from './post.schema';

@Module({
  imports: [
    AppModule, // Import AppModule to access PostModel
    MongooseModule.forFeature([{ name: 'Post', schema: PostSchema }]), // Use 'Post' as the name
  ],
})
export class PostModule {}
