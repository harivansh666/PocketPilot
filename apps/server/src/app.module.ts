import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AttributesModule } from './attributes/attributes.module';
import { ExpenseModule } from './expense/expense.module';
import { UserModule } from './user/user.module';
import { UpdatesModule } from './updates/updates.module';

@Module({
  imports: [AttributesModule, UserModule, ExpenseModule, UpdatesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
