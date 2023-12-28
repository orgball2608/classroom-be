export const USERS_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',
  LOGIN_SUCCESSFUL: 'Login successful',
  REGISTER_SUCCESSFUL: 'Register successful',
  USER_NOT_FOUND: 'User not found',
  USER_IS_TAKEN: 'User is taken',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  EMAIL_ALREADY_VERIFIED: 'Email already verified',
  VERIFY_EMAIL_SUCCESSFULLY: 'Verify email successfully',
  LOGOUT_SUCCESSFUL: 'Logout successful',
  USER_LOGGED_OUT: 'User logged out',
  REFRESH_TOKEN_SUCCESSFULLY: 'Refresh token successfully',
  PASSWORD_OR_USERNAME_INCORRECT: 'Password or username is incorrect',
  UPDATE_PROFILE_SUCCESSFULLY: 'Update profile successfully',
  DELETE_USER_SUCCESSFULLY: 'Delete user successfully',
  VERIFY_TOKEN_BEFORE_LOGIN: 'Please verify token before login ',
  PASSWORD_NOT_MATCH: 'Password not match',
  CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_A_PASSWORD:
    'Confirm password must be the same as password',
  CHANGE_PASSWORD_SUCCESSFULLY: 'Change password successfully',
  RESEND_CONFIRM_EMAIL_SUCCESSFULLY: 'Resend confirm email successfully',
  VERIFY_STATUS_INCORRECT: 'Verify status incorrect',
  CHECK_EMAIL_TO_RESET_PASSWORD: 'Check mail to reset password',
  FORGOT_PASSWORD_TOKEN_INVALID: 'Forgot password token invalid',
  RESET_PASSWORD_SUCCESSFUL: 'Reset password successful',
  ACCOUNT_IS_VERIFIED: 'Account is verified, cant verify again',
  USER_IS_BANNED: 'User is banned',
  MAP_STUDENT_ID_WITH_USER_ID_SUCCESSFULLY:
    'Map student id with user id successfully',
  UN_MAP_STUDENT_ID_WITH_USER_ID_SUCCESSFULLY:
    'Un map student id with user id successfully',
  GET_USERS_LIST_SUCCESSFULLY: 'Get users successfully',
  BAN_USER_SUCCESSFULLY: 'Ban user successfully',
} as const;

export const TOKEN_MESSAGES = {
  TOKEN_IS_EXPIRED: 'Token is expired',
  TOKEN_IS_BLACKLIST: 'Token is blacklist',
  TOKEN_IS_INVALID: 'Token is invalid',
};

export const COURSES_MESSAGES = {
  COURSE_NOT_FOUND: 'Course not found',
  COURSE_IS_BANNED: 'Course is banned',
  COURSE_IS_TAKEN: 'Course is taken',
  COURSES_CREATED_SUCCESSFULLY: 'Courses created successfully',
  GET_COURSES_SUCCESSFULLY: 'Get courses successfully',
  GET_COURSE_BY_ID_SUCCESSFULLY: 'Get course by id successfully',
  UPDATE_COURSE_SUCCESSFULLY: 'Update course successfully',
  DELETE_COURSE_SUCCESSFULLY: 'Delete course successfully',
  UPDATE_COURSE_IMAGE_SUCCESSFULLY: 'Update course image successfully',
  GET_COURSES_BY_TEACHER_ID_SUCCESSFULLY:
    'Get courses by teacher id successfully',
  GET_COURSES_ENROLLED_SUCCESSFULLY: 'Get courses enrolled successfully',
  GET_USERS_IN_COURSE_SUCCESSFULLY: 'Get users in course successfully',
  INVALID_COURSE_ID: 'Invalid course id',
  USER_NOT_IN_COURSE: 'User not in course',
  USER_ENROLLED_COURSE: 'User enrolled course',
  ENROLLED_TO_COURSE_SUCCESSFULLY: 'Enrolled to course successfully',
  LEAVE_COURSE_SUCCESSFULLY: 'Leave course successfully',
  YOU_NOT_ENROLLED_IN_THIS_COURSE: 'You not enrolled in this course',
  YOU_ARE_OWNER_OF_THIS_COURSE_CAN_NOT_LEAVE:
    'You are owner of this course can not leave',
  INVALID_TOKEN: 'Invalid token',
  CANNOT_DELETE_COURSE_WITH_STUDENTS: 'Cannot delete course with students',
  ACCOUNT_ENROLL_NOT_CORRECT_WITH_LOGIN_ACCOUNT:
    'Account enroll not correct with login account',
  REMOVE_USER_IN_COURSE_SUCCESSFULLY: 'Remove user in course successfully',
  YOU_ARE_NOT_COURSE_OWNER: 'You are not course owner',
};

export const AUTHORIZATION_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  DO_NOT_HAVE_PERMISSION_TO_ACCESS_THIS_RESOURCE:
    'You do not have permission to access this resource',
};

export const NOTIFICATION_MESSAGES = {
  NOTIFICATION_NOT_FOUND: 'Notification not found',
  GET_NOTIFICATIONS_SUCCESSFULLY: 'Get notifications successfully',
  GET_NOTIFICATION_BY_ID_SUCCESSFULLY: 'Get notification by id successfully',
  MARK_AS_READ_SUCCESSFULLY: 'Mark as read successfully',
};

export const GRADE_COMPOSITION_MESSAGES = {
  INVALID_GRADE_COMPOSITION_ID: 'Invalid grade composition id',
  GRADE_COMPOSITION_NOT_FOUND: 'Grade composition not found',
  GET_LIST_GRADE_COMPOSITION_SUCCESSFULLY:
    'Get list grade composition successfully',
  GET_GRADE_COMPOSITION_SUCCESSFULLY: 'Get grade composition successfully',
  CREATE_GRADE_COMPOSITION_SUCCESSFULLY:
    'Create grade composition successfully',
  UPDATE_GRADE_COMPOSITION_SUCCESSFULLY:
    'Update grade composition successfully',
  DELETE_GRADE_COMPOSITION_SUCCESSFULLY:
    'Delete grade composition successfully',
  GET_GRADE_COMPOSITION_BY_COURSE_ID_SUCCESSFULLY:
    'Get grade composition by course id successfully',
  INVALID_GRADE_COMPOSITION: 'Invalid grade composition',
  YOU_ARE_NOT_PERMISSION_TO_CREATE_GRADE_COMPOSITION:
    'You are not permission to create grade composition',
  SWITCH_GRADE_COMPOSITION_INDEX_SUCCESSFULLY:
    'Switch grade composition index successfully',
  INVALID_SWITCH_TO_INDEX: 'Invalid switch to index',
};

export const GRADE_MESSAGES = {
  GRADE_NOT_FOUND: 'Grade not found',
  GET_GRADES_SUCCESSFULLY: 'Get grades successfully',
  GET_GRADE_SUCCESSFULLY: 'Get grade successfully',
  CREATE_GRADE_SUCCESSFULLY: 'Create grade successfully',
  UPDATE_GRADE_SUCCESSFULLY: 'Update grade successfully',
  DELETE_GRADE_SUCCESSFULLY: 'Delete grade successfully',
};

export const EXCEL_MESSAGES = {
  UPLOAD_STUDENT_LIST_SUCCESSFULLY: 'Upload student list successfully',
};
