import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import axios from 'axios';
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
@Processor('myQueue') // 指定该处理器处理 myQueue 队列中的任务
export class MyTaskProcessor {
  @Process('myTask') // 处理名为 'myTask' 的任务
  async handleTask(job: Job) {
    const { userId } = job.data;

    console.log('Processing job with userId:', userId);

    try {
      await delay(5000);
      // 准备请求体
      const requestBody = {
        name: userId
      };

      // 发出 POST 请求
      const response = await axios.post(
        'https://www.feishu.cn/flow/api/trigger-webhook/c8eece8d9476172370b075ed03aa6956',
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      // 处理响应
      console.log('飞书 webhook 响应:', response.data);
    } catch (error) {
      console.error('飞书 webhook 请求失败:', error.message);
    }
  }
}