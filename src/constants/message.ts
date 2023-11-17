export const USERS_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',
  LOGIN_SUCCESSFUL: 'Login successful',
  REGISTER_SUCCESSFUL: 'Register successful',
  USER_NOT_FOUND: 'User not found',
  USER_IS_TAKEN: 'User is taken',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  EMAIL_ALREADY_VERIFIED: 'Email already verified',
  VERIFY_EMAIL_SUCCESSFULLY: 'Verify email successfully',
  LOGOUT_SUCESSFULL: 'Logout successfull',
  USER_LOGGED_OUT: 'User logged out',
  REFRESH_TOKEN_SUCCESSFULLY: 'Refresh token successfully',
  PASSWORD_OR_USERNAME_INCORRECT: 'Password or username is uncorrect',
  UPDATE_PROFILE_SUCCESSFULLY: 'Update profile successfully',
  DELETE_USER_SUCCESSFULLY: 'Delete user successfully',
  VERIFY_TOKEN_BEFORE_LOGIN: 'Please verify token before login ',
  PASSWORD_NOT_MATCH: 'Password not match',
  CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_A_PASSWORD:
    'Confirm password must be the same as password',
  CHANGE_PASSWORD_SUCCESSFULLY: 'Change password successfully',
  RESEND_CONFIRM_EMAIL_SUCCESSLY: 'Resend cofirm email successly',
  VERIFY_STATUS_INCORRECT: 'Verify status incorrect',
  CHECK_EMAIL_TO_RESET_PASSWORD: 'Check mail to reset password',
  FORGOT_PASSWORD_TOKEN_INVALID: 'Forgot password token invalid',
  RESET_PASSWORD_SUCCESSFULL: 'Reset password successfull',
  ACCOUNT_IS_VERIFIED: 'Account is verified, cant verify again',
} as const;

export const TOKEN_MESSAGES = {
  TOKEN_IS_EXPIRED: 'Token is expired',
  TOKEN_IS_BLACKLIST: 'Token is blacklist',
  TOKEN_IS_INVALID: 'Token is invalid',
};
