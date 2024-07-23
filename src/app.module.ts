import {Module} from '@nestjs/common'
import {AppController} from './app.controller'
import {AppService} from './app.service'
import {UserModule} from './user/user.module'
import {CategoriesModule} from './categories/categories.module'
import {ConfigModule, ConfigService} from '@nestjs/config'
import {TypeOrmModule} from '@nestjs/typeorm'
import {TasksModule} from './tasks/tasks.module'
import {AuthModule} from './auth/auth.module'

@Module({
  imports: [
    AuthModule,
    UserModule,
    TasksModule,
    CategoriesModule,
    ConfigModule.forRoot({isGlobal: true}),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        synchronize: true,
        logging: true, // Enable logging
        entities: [__dirname + '/**/*entity{.js, .ts}'],
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
