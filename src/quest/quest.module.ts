import { Module } from '@nestjs/common';
import { QuestController } from './quest.controller';
import { QuestService } from './quest.service';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [QuestController],
  providers: [QuestService],
})
export class QuestModule {}
