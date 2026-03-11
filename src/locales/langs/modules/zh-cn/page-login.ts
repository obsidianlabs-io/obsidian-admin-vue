const loginSection: App.I18n.Schema['page']['login'] = {
  common: {
    loginOrRegister: '登录 / 注册',
    userNamePlaceholder: '请输入用户名',
    emailPlaceholder: '请输入邮箱',
    phonePlaceholder: '请输入手机号',
    codePlaceholder: '请输入验证码',
    passwordPlaceholder: '请输入密码',
    confirmPasswordPlaceholder: '请再次输入密码',
    codeLogin: '验证码登录',
    confirm: '确定',
    back: '返回',
    validateSuccess: '验证成功',
    loginSuccess: '登录成功',
    welcomeBack: '欢迎回来，{userName} ！',
    userInactive: '用户已停用',
    roleInactive: '角色已停用',
    tenantInactive: '所属租户已停用',
    organizationInactive: '所属组织已停用',
    teamInactive: '所属团队已停用',
    emailNotVerified: '邮箱未验证',
    invalidCredentials: '用户名或密码错误',
    twoFactorRequired: '需要双重验证码',
    twoFactorInvalid: '双重验证码无效'
  },
  pwdLogin: {
    title: '密码登录',
    rememberMe: '记住我',
    forgetPassword: '忘记密码？',
    register: '注册账号',
    otherAccountLogin: '其他账号登录',
    otherLoginMode: '其他登录方式',
    superAdmin: '超级管理员',
    admin: '管理员',
    user: '普通用户',
    superNoTenant: '超级管理员（平台）',
    adminMain: '主租户管理员',
    adminBranch: '分支租户管理员',
    userMain: '主租户用户',
    userBranch: '分支租户用户',
    twoFactorOtpPlaceholder: '双重身份验证码 (6位数字)',
    demoRuntimeNotice: '当前预览运行在内置 demo backend 上。',
    demoRuntimeHint: '可直接使用下方快捷账号。预览数据可重置，不会连接真实 Laravel API。'
  },
  codeLogin: {
    title: '验证码登录',
    getCode: '获取验证码',
    reGetCode: '{time}秒后重新获取',
    sendCodeSuccess: '验证码发送成功',
    imageCodePlaceholder: '请输入图片验证码',
    placeholderNotice: '验证码登录在这个开源模板里仍是占位模块。请先接入真实后端契约，再对外开放。'
  },
  register: {
    title: '注册账号',
    agreement: '我已经仔细阅读并接受',
    protocol: '《用户协议》',
    policy: '《隐私权政策》',
    successTitle: '注册完成',
    successDesc: '账号已经创建完成，当前会话已准备就绪。',
    successFallback: '注册完成，请使用新账号登录。'
  },
  resetPwd: {
    title: '重置密码',
    requestToken: '发送重置链接',
    requestNewToken: '重新申请令牌',
    requestSuccess: '如果邮箱存在，系统已发送重置链接。',
    tokenPlaceholder: '请输入重置令牌',
    tokenHint: '请粘贴邮件或重置链接中的令牌后继续。',
    prefilledTokenHint: '系统已自动填入重置令牌，请继续设置新密码。',
    submitReset: '重置密码',
    resetSuccess: '密码已重置，请重新登录。'
  },
  bindWeChat: {
    title: '绑定微信',
    placeholderNotice: '微信绑定在这个开源模板里仍是占位模块。请先接入真实社交登录契约，再对外开放。'
  }
};

export default loginSection;
