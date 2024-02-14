import { Module,  } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { AuthService } from './auth/auth.service';
import { Post,PostSchema } from './post.schema';
import {  PostService } from './post.service';


@Module({
  imports: [ConfigModule.forRoot(),
  MongooseModule.forRoot(process.env.MONGO_URI),
  MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  MongooseModule.forFeature([{ name: Post.name, schema: PostSchema  }])
],
  controllers: [AppController],
  providers: [AppService,AuthService,PostService],
})
export class AppModule {}
