# Quest Submission Scoring App

The Quest Submission Scoring App is a Node.js application built with the NestJS framework. It provides a service to process and score user submissions to quests in a game, taking into account several factors including specific access conditions and content of the submission. 

## Features

- **Quest Submission Processing**: Processes user submissions and calculates scores based on the content of the submission, such as punctuation, joyful words, palindromes, and repetitive sequences.

- **Access Conditions**: Supports a variety of quest access conditions, including specific NFT ownership, user level, and date of claim.

- **Text Moderation**: Checks for offensive language in the submission text, utilizing the TextModerationService. 

- **Logging**: Detailed logging using the built-in NestJS Logger, including a log when a user tries to complete an already completed quest, error logs for unknown condition types, debug logs for score calculations, and others.

- **Testing**: A comprehensive suite of automated tests to ensure the system works as expected and prevent regressions when new features are added or changes are made.

## Getting Started

To set up and run the application on your local machine or a production environment, follow the instructions below.

### Prerequisites

- Node.js 14.x or higher
- NPM 6.x or higher

### Installation

Install the application dependencies:

   ```
   npm install
   ```

### Running the application

**Development:**

You can run the application in development mode with the following command:

```
npm run start:dev
```

This command starts the application in development mode, utilizing hot-reload so any changes you make to the code will be reflected in the running application.

**Production:**

Before running the application in a production environment, you should compile it to JavaScript:

```
npm run build
```

After the build process is complete, you can start the application:

```
npm start
```

This will start the application in production mode.

### Running the tests

You can run the application's tests with the following command:

```
npm run test
```

This command runs all the unit tests included in the application. These tests check the functionality of the quest submission process and the individual features of the scoring system.

### Postman test

To test the API with Postman, import the collection `Quest.postman_collection.json` into Postman, run the app in Dev or prod mode, and send the `claim request`.

## Application Structure

The application is organized following the module-based organization approach of NestJS. The `QuestService` is where the main functionality of the application resides. The `TextModerationService` is used by `QuestService` to check for offensive language in the submission text.

Each method in the `QuestService` performs a specific function in the quest submission process, from checking access conditions to calculating scores based on submission content.
