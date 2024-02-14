import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken'; // Import jsonwebtoken module
import { User } from '../user.schema';

@Injectable()
export class AuthService {
  constructor() {}

  async generateToken(user: User): Promise<string> {
    // Generate JWT token
    const payload = {
      email: user.email,
      displayName: user.name,
      profileImageUrl: user.image,
    };
    const token = jwt.sign(payload, 'your_secret_key', { expiresIn: '1h' });

    return token;
  }
}
