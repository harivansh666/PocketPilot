import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AttributesModule } from './attributes/attributes.module';
import { ExpenseModule } from './expense/expense.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [AttributesModule, UserModule, ExpenseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
