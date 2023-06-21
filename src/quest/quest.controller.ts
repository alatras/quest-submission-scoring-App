import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { QuestService } from './quest.service';
import { QuestDto } from './quest.dto';
import { QuestResponseDto } from './quest-response.dto';

@Controller('quest')
export class QuestController {
  constructor(private readonly questService: QuestService) {}

  @Post('submit')
  @HttpCode(HttpStatus.OK)
  async submitQuest(@Body() questDto: QuestDto): Promise<QuestResponseDto> {
    return this.questService.processQuest(questDto);
  }
}
