import {Injectable} from '@nestjs/common'

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!'
  }

  getProfile(): string {
    return 'This is my profile'
  }
}
