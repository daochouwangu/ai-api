export default abstract class BasicProxyAdapter {
  constructor() {
    console.log('BasicProxyAdapter');
  }
  abstract isHealthy(): Promise<boolean>;
  abstract getModels(): Promise<any>;
  abstract proxy(data: any, path: string): Promise<any>;
}
