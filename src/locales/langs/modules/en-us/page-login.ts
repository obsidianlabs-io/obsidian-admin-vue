const loginSection: App.I18n.Schema['page']['login'] = {
  common: {
    loginOrRegister: 'Login / Register',
    userNamePlaceholder: 'Please enter user name',
    emailPlaceholder: 'Please enter email',
    phonePlaceholder: 'Please enter phone number',
    codePlaceholder: 'Please enter verification code',
    passwordPlaceholder: 'Please enter password',
    confirmPasswordPlaceholder: 'Please enter password again',
    codeLogin: 'Verification code login',
    confirm: 'Confirm',
    back: 'Back',
    validateSuccess: 'Verification passed',
    loginSuccess: 'Login successfully',
    welcomeBack: 'Welcome back, {userName} !',
    userInactive: 'User is inactive',
    roleInactive: 'Role is inactive',
    tenantInactive: 'Tenant is inactive',
    organizationInactive: 'Organization is inactive',
    teamInactive: 'Team is inactive',
    emailNotVerified: 'Email is not verified',
    invalidCredentials: 'Username or password is incorrect',
    twoFactorRequired: 'Two-factor code required',
    twoFactorInvalid: 'Two-factor code is invalid'
  },
  pwdLogin: {
    title: 'Password Login',
    rememberMe: 'Remember me',
    forgetPassword: 'Forget password?',
    register: 'Register',
    otherAccountLogin: 'Other Account Login',
    otherLoginMode: 'Other Login Mode',
    superAdmin: 'Super Admin',
    admin: 'Admin',
    user: 'User',
    superNoTenant: 'Super (Platform)',
    adminMain: 'Main Tenant Admin',
    adminBranch: 'Branch Tenant Admin',
    userMain: 'Main Tenant User',
    userBranch: 'Branch Tenant User',
    twoFactorOtpPlaceholder: 'Two-Factor OTP Code (6 digits)',
    demoRuntimeNotice: 'Preview mode is running against the built-in demo backend.',
    demoRuntimeHint: 'Use the quick accounts below. Preview data is resettable and not connected to a live Laravel API.'
  },
  codeLogin: {
    title: 'Verification Code Login',
    getCode: 'Get verification code',
    reGetCode: 'Reacquire after {time}s',
    sendCodeSuccess: 'Verification code sent successfully',
    imageCodePlaceholder: 'Please enter image verification code',
    placeholderNotice:
      'Verification-code login is a template-only module. Connect it to a real backend contract before exposing it.'
  },
  register: {
    title: 'Register',
    agreement: 'I have read and agree to',
    protocol: '《User Agreement》',
    policy: '《Privacy Policy》',
    successTitle: 'Registration completed',
    successDesc: 'Your account has been created and the current session is ready.',
    successFallback: 'Registration completed. Please sign in with your new account.'
  },
  resetPwd: {
    title: 'Reset Password',
    requestToken: 'Send reset link',
    requestNewToken: 'Request a new token',
    requestSuccess: 'If the email exists, a reset link has been sent.',
    tokenPlaceholder: 'Please enter reset token',
    tokenHint: 'Paste the reset token from the email or reset link to continue.',
    prefilledTokenHint: 'A reset token was prefilled. Set a new password to continue.',
    submitReset: 'Reset password',
    resetSuccess: 'Password has been reset. Please sign in again.'
  },
  bindWeChat: {
    title: 'Bind WeChat',
    placeholderNotice:
      'WeChat binding is a template-only module. Connect it to a real social-auth contract before exposing it.'
  }
};

export default loginSection;
