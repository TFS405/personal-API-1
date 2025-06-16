TASK: Create a deleteMe route that enables users to delete their own account without being an admin.

TASK: Create a updateMe route that enables users to update their own account without being an admin.

TASK: Differentiate updateUser and updateMyAccount further. (Since admins are expected to use updateUser, updateUser should be able to update any field in a user's account).++

TASK: Review deleteUser function for limitations, and restrictions. Only admins are expected to utilize that route, so it should have virtually no restrictions.

TASK: Fix issue with passwordResetToken appearing in getAllUsers handler.

TASK: Fix issue with roles being shown in response JWT after account creation (also hide DB ID).

TASK: Restrict getUsers and GetAllUsers to admins only.

TASK: Rename /updatePassword route to /updateMyPassword

TASK: Audit protect middleware.
