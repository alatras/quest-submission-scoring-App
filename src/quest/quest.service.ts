import { Injectable, Logger } from '@nestjs/common';
import { Condition, OperatorType, QuestDto } from './quest.dto';
import { QuestResponseDto } from './quest-response.dto';
import { TextModerationService } from '../common/text-moderation/text-moderation.service';

// completedQuests as a key-value store with questId-userId as the key
const completedQuests: Map<string, boolean> = new Map();

@Injectable()
export class QuestService {
  private readonly logger = new Logger(QuestService.name);

  constructor(private textModerationService: TextModerationService) {}

  /**
   * Process a quest and return a response
   * @param questDto QuestDto with questId, userId, claimed_at, submission_text, user_data
   * @returns QuestResponseDto with status and score
   */
  async processQuest(questDto: QuestDto): Promise<QuestResponseDto> {
    // Initialize the response with a score of 0
    const response: QuestResponseDto = {
      status: 'fail',
      score: 0,
    };

    const questUserKey = `${questDto.questId}-${questDto.userId}`;

    // Check if the quest has already been completed by the user
    if (completedQuests.has(questUserKey)) {
      this.logger.log(
        `Quest ${questDto.questId} has already been completed by user ${questDto.userId}`,
      );
      return response;
    }

    // Check if the quest has any access conditions
    for (const condition of questDto.access_condition) {
      let conditionCheck = false;

      switch (condition.type) {
        case 'nft':
          conditionCheck = this.checkNFTCondition(questDto, condition);
          break;

        case 'date':
          conditionCheck = this.checkDateCondition(questDto, condition);
          break;

        case 'level':
          conditionCheck = this.checkLevelCondition(questDto, condition);
          break;

        default:
          this.logger.error(`Unknown condition type ${condition.type}`);
          break;
      }

      if (!conditionCheck) return response;
    }

    // Calculate the score for the quest
    this.calculateScore(questDto, response);

    // Check if the submission text contains offensive language
    const offensive = await this.textModerationService.detectProfaneWords(
      questDto.submission_text,
    );
    if (offensive) {
      response.score = 0;
      this.logger.debug(
        `Quest ${questDto.questId} by user ${questDto.userId} got 0 score because the submission contains offensive language`,
      );
    }

    // Check if the score is greater than or equal to 5
    if (response.score >= 5) {
      response.status = 'success';
      this.logger.debug(
        `Quest ${questDto.questId} by user ${questDto.userId} has been completed successfully with a score of ${response.score}`,
      );
    }

    // Add the quest to the completedQuests map after it has been processed
    completedQuests.set(questUserKey, true);
    this.logger.log(
      `Quest ${questDto.questId} has been completed by user ${questDto.userId} with a score of ${response.score}`,
    );

    return response;
  }

  /**
   * Check if the user satisfies the NFT condition for a quest
   * @param questDto QuestDto with questId, userId, claimed_at, submission_text, user_data
   * @param condition Condition with type, operator, and value
   * @returns boolean indicating if the condition is satisfied
   */
  private checkNFTCondition(questDto: QuestDto, condition: Condition): boolean {
    const userNFTs = new Set(questDto.user_data.nfts);
    const conditionValue = condition.value;

    if (
      (condition.operator === OperatorType.contains &&
        !userNFTs.has(conditionValue)) ||
      (condition.operator === OperatorType.notContains &&
        userNFTs.has(conditionValue))
    ) {
      this.logger.log(
        `Quest ${questDto.questId} cannot be completed by user ${questDto.userId} because they do not have the required NFT ${condition.value}`,
      );
      return false;
    }

    return true;
  }

  /**
   * Check if the user satisfies the date condition for a quest
   * @param questDto QuestDto with questId, userId, claimed_at, submission_text, user_data
   * @param condition Condition with type, operator, and value
   * @returns boolean indicating if the condition is satisfied
   */
  private checkDateCondition(
    questDto: QuestDto,
    condition: Condition,
  ): boolean {
    const userDate = new Date(questDto.claimed_at);
    const conditionDate = new Date(condition.value);

    if (
      (condition.operator === OperatorType.greaterThan &&
        userDate <= conditionDate) ||
      (condition.operator === OperatorType.lessThan &&
        userDate >= conditionDate) ||
      (condition.operator === OperatorType.equals &&
        userDate.getTime() !== conditionDate.getTime())
    ) {
      this.logger.log(
        `Quest ${questDto.questId} cannot be completed by user ${questDto.userId} because the claimed_at date is not ${condition.operator} ${condition.value}`,
      );
      return false;
    }

    return true;
  }

  /**
   * Check if the user satisfies the level condition for a quest
   * @param questDto QuestDto with questId, userId, claimed_at, submission_text, user_data
   * @param condition Condition with type, operator, and value
   * @returns boolean indicating if the condition is satisfied
   */
  private checkLevelCondition(
    questDto: QuestDto,
    condition: Condition,
  ): boolean {
    const userLevel = questDto.user_data.level;
    const conditionValue = Number(condition.value);

    if (
      (condition.operator === OperatorType.greaterThan &&
        userLevel <= conditionValue) ||
      (condition.operator === OperatorType.lessThan &&
        userLevel >= conditionValue) ||
      (condition.operator === OperatorType.equals &&
        userLevel !== conditionValue)
    ) {
      this.logger.log(
        `Quest ${questDto.questId} cannot be completed by user ${questDto.userId} because the user level is not ${condition.operator} ${condition.value}`,
      );
      return false;
    }

    return true;
  }

  /**
   * Calculate the score for a quest based on various factors
   * @param questDto QuestDto with questId, userId, claimed_at, submission_text, user_data
   * @param response QuestResponseDto with status and score
   */
  private calculateScore(questDto: QuestDto, response: QuestResponseDto): void {
    this.addScoreForPunctuation(questDto, response);
    this.addScoreForPalindrome(questDto, response);
    this.addScoreForJoyfulWords(questDto, response);
    this.addScoreForRepetitiveSequences(questDto, response);
  }

  /**
   * Increase the score for a quest if the submission contains punctuation
   * @param questDto QuestDto with questId, userId, claimed_at, submission_text, user_data
   * @param response QuestResponseDto with status and score
   */
  private addScoreForPunctuation(
    questDto: QuestDto,
    response: QuestResponseDto,
  ): void {
    const punctuation = /[.,?!]/;
    if (punctuation.test(questDto.submission_text)) {
      response.score += 1;
      this.logger.debug(
        `Quest ${questDto.questId} submission by user ${questDto.userId} got 1 point because it contains punctuation`,
      );
    }
  }

  /**
   * Increase the score for a quest if the submission contains a palindrome
   * @param questDto QuestDto with questId, userId, claimed_at, submission_text, user_data
   * @param response QuestResponseDto with status and score
   */
  private addScoreForPalindrome(
    questDto: QuestDto,
    response: QuestResponseDto,
  ): void {
    const words = questDto.submission_text.split(/\s+/);
    for (const word of words) {
      if (word.length >= 3 && word === word.split('').reverse().join('')) {
        response.score += 2;
        this.logger.debug(
          `Quest ${questDto.questId} submission by user ${questDto.userId} got 2 points because it contains a palindrome`,
        );
        break; // Only count the first palindrome
      }
    }
  }

  /**
   * Increase the score for a quest if the submission contains joyful words
   * @param questDto QuestDto with questId, userId, claimed_at, submission_text, user_data
   * @param response QuestResponseDto with status and score
   */
  private addScoreForJoyfulWords(
    questDto: QuestDto,
    response: QuestResponseDto,
  ): void {
    const joyfulWords = [
      'Joyful',
      'Happy',
      'Vibrant',
      'Thrilled',
      'Euphoric',
      'Cheerful',
      'Delighted',
    ];
    let joyfulWordCount = 0;
    const words = questDto.submission_text.split(/\s+/);
    for (const word of words) {
      if (joyfulWords.includes(word) && joyfulWordCount < 3) {
        response.score += 1;
        joyfulWordCount += 1;
        this.logger.debug(
          `Quest ${questDto.questId} submission by user ${questDto.userId} got 1 point because it contains the word ${word}`,
        );
      }
    }
  }

  /**
   * Increase the score for a quest if the submission contains repetitive sequences
   * @param questDto QuestDto with questId, userId, claimed_at, submission_text, user_data
   * @param response QuestResponseDto with status and score
   */
  private addScoreForRepetitiveSequences(
    questDto: QuestDto,
    response: QuestResponseDto,
  ): void {
    const repetitive = /(\b\w+\b)(\s+\1)+/;
    if (repetitive.test(questDto.submission_text)) {
      response.score += 3;
      this.logger.debug(
        `Quest ${questDto.questId} submission by user ${questDto.userId} got 3 points because it contains repetitive sequences`,
      );
    }
  }
}
