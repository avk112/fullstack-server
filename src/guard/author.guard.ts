import {CanActivate, ExecutionContext} from '@nestjs/common'
import {Observable} from 'rxjs'

export class AuthorGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const {id, type} = request.params
    let entity

    // switch (type) {
    //     case 'transactions':

    //         break;

    //     case 'category':
    //         break

    //     default:
    //         break;
    // }
    return true
  }
}
