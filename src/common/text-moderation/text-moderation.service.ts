import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TextModerationService {
  private readonly logger = new Logger(TextModerationService.name);

  /**
   * Checks if the given text contains profane words.
   ** This is a simple implementation that checks for one specific offensive word.
   ** A more complex solution like a text moderation API would be needed for a production application.
   * @param text The text to check.
   * @returns True if the text contains profane words, false otherwise.
   */
  async detectProfaneWords(text: string): Promise<boolean> {
    this.logger.debug(`Checking text for profanity: ${text}`);

    const inappropriateWords = ['badword1', 'badword2', 'badword3']; // replace with your own words

    for (let word of inappropriateWords) {
      if (text.toLowerCase().includes(word)) {
        this.logger.debug(`Text contains profanity: ${word}`);
        return true;
      }
    }

    this.logger.debug('Text does not contain profanity');
    return false;
  }
}
