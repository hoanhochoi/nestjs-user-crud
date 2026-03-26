import { SetMetadata } from '@nestjs/common';

export const THROTTLER_MESSAGE_KEY = 'throttler_message';
export const ThrottlerMessage = (message: string) => 
  SetMetadata(THROTTLER_MESSAGE_KEY, message);