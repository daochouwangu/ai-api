import { registerAs } from '@nestjs/config';

export default registerAs('spark', () => ({
  appId: process.env.SPARK_APP_ID,
  apiSecret: process.env.SPARK_API_SECRET,
  apiKey: process.env.SPARK_API_KEY,
  baseUrl: process.env.SPARK_API_BASE_URL,
}));
