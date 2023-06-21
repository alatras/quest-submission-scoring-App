import { Module } from '@nestjs/common';
import { TextModerationService } from './text-moderation/text-moderation.service';

@Module({
  providers: [TextModerationService],
  exports: [TextModerationService],
})
export class CommonModule {}
