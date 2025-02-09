- Implemented Generate Evals UI with form for entering prompts and selecting models, plus a table to display generated evals.
- Implemented Eval Runner UI with multi-select forms for evals and models, parallel execution of eval-model combinations, and a results table with status indicators.

## Judge Mode Implementation
- Created Judge Mode UI with form for selecting evaluations and judge model
- Added table to display judgments with scores and justifications
- Implemented proper type handling for Prisma schema compatibility
- Added success/error toasts for user feedback
- Fixed type errors related to nullable fields in judgment entities 