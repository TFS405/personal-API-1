TASK: Review deleteUser function for limitations, and restrictions. Only admins are expected to utilize that route, so it should have virtually no restrictions.

TASK: Fix issue with passwordResetToken appearing in getAllUsers handler.

TASK: Fix issue with roles being shown in response JWT after account creation (also hide DB ID).

TASK: Look into refining error message for incorrectly structured ID's in ":id" urls, in related routes.

TASK: Check if passwordResetToken is persisting in user documents after being consumed, they should not be. (Admin account has a value in that accounts document).
