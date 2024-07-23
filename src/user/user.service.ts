import {BadRequestException, Injectable} from '@nestjs/common'
import {CreateUserDto} from './dto/create-user.dto'
import {UpdateUserDto} from './dto/update-user.dto'
import {InjectRepository} from '@nestjs/typeorm'
import {User} from './entities/user.entity'
import {Repository} from 'typeorm'
import * as argon2 from 'argon2'
import {JwtService} from '@nestjs/jwt'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  async create(user: CreateUserDto) {
    try {
      const existUser = await this.userRepository.findOne({
        where: {
          email: user.email,
        },
      })

      if (existUser) throw new BadRequestException('This user already exist!')
      const password = await argon2.hash(user.password)

      const newUser = await this.userRepository.save({
        email: user.email,
        password: password,
      })

      const token = this.jwtService.sign({id: newUser?.id, email: user?.email})
      return {message: 'success', token}
    } catch (err) {
      throw new Error(err)
    }
  }

  async findAll() {
    const arr = await this.userRepository.find()

    // function recursive(arr: any[], parent_id: number = null) {
    //   const result = []
    //   for (let item of arr) {
    //     if (item.parent_id === parent_id) {
    //       const shortedArr = arr.filter((unit) => unit.id !== item.id)
    //       const children = recursive(shortedArr, item.id)

    //       if (children.length) {
    //         item.children = children
    //       }

    //       result.push(item)
    //     }
    //   }
    //   return result
    // }

    // return recursive(arr)
    return arr
  }

  findOne(email: string) {
    const user = this.userRepository.findOneBy({email: email})
    if (!user) throw new BadRequestException('No such user!')
    return user
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`
  }

  async delete(id: number) {
    const existUser = await this.userRepository.findOne({
      where: {
        id: id,
      },
    })
    if (!existUser) throw new BadRequestException("This user doesn't exist!")
    return await this.userRepository.delete(id)
  }
}
