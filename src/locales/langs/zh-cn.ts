const local: App.I18n.Schema = {
  system: {
    title: 'Obsidian 管理系统',
    updateTitle: '系统版本更新通知',
    updateContent: '检测到系统有新版本发布，是否立即刷新页面？',
    updateConfirm: '立即刷新',
    updateCancel: '稍后再说'
  },
  common: {
    action: '操作',
    add: '新增',
    addSuccess: '添加成功',
    backToHome: '返回仪表盘',
    batchDelete: '批量删除',
    cancel: '取消',
    close: '关闭',
    check: '勾选',
    selectAll: '全选',
    expandColumn: '展开列',
    columnSetting: '列设置',
    config: '配置',
    confirm: '确认',
    delete: '删除',
    deleteSuccess: '删除成功',
    batchDeletePartialResult: '批量删除完成：成功 {success} 条，失败 {failed} 条。',
    batchDeleteFailed: '批量删除失败，请刷新后重试。',
    confirmDelete: '确认删除吗？',
    edit: '编辑',
    warning: '警告',
    error: '错误',
    index: '序号',
    keywordSearch: '请输入关键词搜索',
    logout: '退出登录',
    logoutConfirm: '确认退出登录吗？',
    lookForward: '敬请期待',
    modify: '修改',
    modifySuccess: '修改成功',
    noData: '无数据',
    operate: '操作',
    pleaseCheckValue: '请检查输入的值是否合法',
    refresh: '刷新',
    reset: '重置',
    search: '搜索',
    switch: '切换',
    tip: '提示',
    trigger: '触发',
    update: '更新',
    updateSuccess: '更新成功',
    userCenter: '个人中心',
    view: '查看',
    tenant: '租户',
    platform: '平台',
    noTenants: '无租户',
    selectTenant: '选择租户',
    switchTenantSuccess: '已切换到 {tenant}',
    status: '状态',
    description: '描述',
    keyword: '关键词',
    email: '邮箱',
    role: '角色',
    locale: '语言区域',
    timezone: '时区',
    createdAt: '创建时间',
    updatedAt: '更新时间',
    active: '启用',
    inactive: '停用',
    selectStatus: '请选择状态',
    selectRole: '请选择角色',
    selectLocale: '请选择语言区域',
    selectTimezone: '请选择时区',
    yesOrNo: {
      yes: '是',
      no: '否'
    }
  },
  request: {
    logout: '请求失败后登出用户',
    logoutMsg: '用户状态失效，请重新登录',
    logoutWithModal: '请求失败后弹出模态框再登出用户',
    logoutWithModalMsg: '用户状态失效，请重新登录',
    refreshToken: '请求的token已过期，刷新token',
    tokenExpired: 'token已过期'
  },
  theme: {
    themeDrawerTitle: '主题配置',
    tabs: {
      appearance: '外观',
      layout: '布局',
      general: '通用',
      preset: '预设'
    },
    appearance: {
      themeSchema: {
        title: '主题模式',
        light: '亮色模式',
        dark: '暗黑模式',
        auto: '跟随系统'
      },
      grayscale: '灰色模式',
      colourWeakness: '色弱模式',
      themeColor: {
        title: '主题颜色',
        primary: '主色',
        info: '信息色',
        success: '成功色',
        warning: '警告色',
        error: '错误色',
        followPrimary: '跟随主色'
      },
      themeRadius: {
        title: '主题圆角'
      },
      recommendColor: '应用推荐算法的颜色',
      recommendColorDesc: '推荐颜色的算法参照',
      preset: {
        title: '主题预设',
        apply: '应用',
        applySuccess: '预设应用成功',
        default: {
          name: '默认预设',
          desc: 'Obsidian Admin 默认主题预设'
        },
        dark: {
          name: '暗色预设',
          desc: '适用于夜间使用的暗色主题预设'
        },
        compact: {
          name: '紧凑型',
          desc: '适用于小屏幕的紧凑布局预设'
        },
        azir: {
          name: 'Azir的预设',
          desc: '是 Azir 比较喜欢的莫兰迪色系冷淡风'
        }
      }
    },
    layout: {
      layoutMode: {
        title: '布局模式',
        vertical: '左侧菜单模式',
        'vertical-mix': '左侧菜单混合模式',
        'vertical-hybrid-header-first': '左侧混合-顶部优先',
        horizontal: '顶部菜单模式',
        'top-hybrid-sidebar-first': '顶部混合-侧边优先',
        'top-hybrid-header-first': '顶部混合-顶部优先',
        vertical_detail: '左侧菜单布局，菜单在左，内容在右。',
        'vertical-mix_detail': '左侧双菜单布局，一级菜单在左侧深色区域，二级菜单在左侧浅色区域。',
        'vertical-hybrid-header-first_detail':
          '左侧混合布局，一级菜单在顶部，二级菜单在左侧深色区域，三级菜单在左侧浅色区域。',
        horizontal_detail: '顶部菜单布局，菜单在顶部，内容在下方。',
        'top-hybrid-sidebar-first_detail': '顶部混合布局，一级菜单在左侧，二级菜单在顶部。',
        'top-hybrid-header-first_detail': '顶部混合布局，一级菜单在顶部，二级菜单在左侧。'
      },
      tab: {
        title: '标签栏设置',
        visible: '显示标签栏',
        fullscreenVisible: '显示标签栏全屏按钮',
        cache: '标签栏信息缓存',
        cacheTip: '一键开启/关闭全局 keepalive',
        height: '标签栏高度',
        mode: {
          title: '标签栏风格',
          slider: '滑块风格',
          chrome: '谷歌风格',
          button: '按钮风格'
        },
        closeByMiddleClick: '鼠标中键关闭标签页',
        closeByMiddleClickTip: '启用后可以使用鼠标中键点击标签页进行关闭'
      },
      header: {
        title: '头部设置',
        height: '头部高度',
        fullscreenVisible: '显示顶部全屏按钮',
        breadcrumb: {
          visible: '显示面包屑',
          showIcon: '显示面包屑图标'
        }
      },
      sider: {
        title: '侧边栏设置',
        inverted: '深色侧边栏',
        width: '侧边栏宽度',
        collapsedWidth: '侧边栏折叠宽度',
        mixWidth: '混合布局侧边栏宽度',
        mixCollapsedWidth: '混合布局侧边栏折叠宽度',
        mixChildMenuWidth: '混合布局子菜单宽度',
        autoSelectFirstMenu: '自动选择第一个子菜单',
        autoSelectFirstMenuTip: '点击一级菜单时，自动选择并导航到第一个子菜单的最深层级'
      },
      footer: {
        title: '底部设置',
        visible: '显示底部',
        fixed: '固定底部',
        height: '底部高度',
        right: '底部居右'
      },
      content: {
        title: '内容区域设置',
        scrollMode: {
          title: '滚动模式',
          tip: '主题滚动仅 main 部分滚动，外层滚动可携带头部底部一起滚动',
          wrapper: '外层滚动',
          content: '主体滚动'
        },
        page: {
          animate: '页面切换动画',
          mode: {
            title: '页面切换动画类型',
            'fade-slide': '滑动',
            fade: '淡入淡出',
            'fade-bottom': '底部消退',
            'fade-scale': '缩放消退',
            'zoom-fade': '渐变',
            'zoom-out': '闪现',
            none: '无'
          }
        },
        fixedHeaderAndTab: '固定头部和标签栏'
      }
    },
    general: {
      title: '通用设置',
      watermark: {
        title: '水印设置',
        visible: '显示全屏水印',
        text: '自定义水印文本',
        enableUserName: '启用用户名水印',
        enableTime: '显示当前时间',
        timeFormat: '时间格式'
      },
      multilingual: {
        title: '多语言设置',
        visible: '显示多语言按钮'
      },
      themeSchema: {
        title: '主题模式切换按钮',
        visible: '显示主题模式按钮'
      },
      globalSearch: {
        title: '全局搜索设置',
        visible: '显示全局搜索按钮'
      },
      themeConfig: {
        title: '主题配置按钮',
        visible: '显示主题配置按钮'
      }
    },
    configOperation: {
      copyConfig: '复制配置',
      copySuccessMsg: '复制成功，请替换 src/theme/settings.ts 中的变量 themeSettings',
      resetConfig: '重置配置',
      resetSuccessMsg: '重置成功'
    }
  },
  route: {
    login: '登录',
    403: '无权限',
    404: '页面不存在',
    500: '服务器错误',
    'iframe-page': '外链页面',
    dashboard: '仪表盘',
    user: '用户管理',
    'user-center': '个人中心',
    role: '角色管理',
    'audit-policy': '审计策略',
    audit: '审计日志',
    permission: '权限管理',
    tenant: '租户管理',
    language: '语言管理',
    'theme-config': '主题配置',
    'feature-flag': '功能开关'
  },
  menu: {
    accessManagement: '访问控制',
    systemSettings: '系统设置'
  },
  page: {
    login: {
      common: {
        loginOrRegister: '登录 / 注册',
        userNamePlaceholder: '请输入用户名',
        phonePlaceholder: '请输入手机号',
        codePlaceholder: '请输入验证码',
        passwordPlaceholder: '请输入密码',
        confirmPasswordPlaceholder: '请再次输入密码',
        codeLogin: '验证码登录',
        confirm: '确定',
        back: '返回',
        validateSuccess: '验证成功',
        loginSuccess: '登录成功',
        welcomeBack: '欢迎回来，{userName} ！'
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
        superNoTenant: '超级管理员（无租户）',
        adminMain: '管理员（主租户）',
        adminBranch: '管理员（分租户）',
        userMain: '用户（主租户）',
        userBranch: '用户（分租户）',
        twoFactorOtpPlaceholder: '双重身份验证码 (6位数字)'
      },
      codeLogin: {
        title: '验证码登录',
        getCode: '获取验证码',
        reGetCode: '{time}秒后重新获取',
        sendCodeSuccess: '验证码发送成功',
        imageCodePlaceholder: '请输入图片验证码'
      },
      register: {
        title: '注册账号',
        agreement: '我已经仔细阅读并接受',
        protocol: '《用户协议》',
        policy: '《隐私权政策》'
      },
      resetPwd: {
        title: '重置密码'
      },
      bindWeChat: {
        title: '绑定微信'
      }
    },
    dashboard: {
      branchDesc:
        '为了方便大家开发和更新合并，我们对main分支的代码进行了精简，只保留了首页菜单，其余内容已移至example分支进行维护。预览地址显示的内容即为example分支的内容。',
      greeting: '早安，{userName}, 今天又是充满活力的一天!',
      weatherDesc: '今日多云转晴，20℃ - 25℃!',
      projectCount: '项目数',
      todo: '待办',
      message: '消息',
      downloadCount: '下载量',
      registerCount: '注册量',
      schedule: '作息安排',
      study: '学习',
      work: '工作',
      rest: '休息',
      entertainment: '娱乐',
      visitCount: '访问量',
      turnover: '成交额',
      dealCount: '成交量',
      projectNews: {
        title: '项目动态',
        moreNews: '更多动态',
        desc1: 'Obsidian Admin 在2026年2月22日创建了开源项目 obsidian-admin!',
        desc2: 'Yanbowe 向 obsidian-admin 提交了一个bug，多标签栏不会自适应。',
        desc3: 'Obsidian Admin 准备为 obsidian-admin 的发布做充分的准备工作!',
        desc4: 'Obsidian Admin 正在忙于为obsidian-admin写项目说明文档！',
        desc5: 'Obsidian Admin 刚才把工作台页面随便写了一些，凑合能看了！'
      },
      creativity: '创意'
    },
    audit: {
      viewTitle: '查看审计日志',
      action: '操作动作',
      actionPlaceholder: '例如：user.update',
      operator: '操作人',
      operatorPlaceholder: '例如：Admin',
      target: '操作对象',
      ipAddress: 'IP 地址',
      userAgent: '用户代理',
      oldValues: '变更前',
      newValues: '变更后',
      timeRange: '时间范围',
      last24Hours: '最近24小时',
      last7Days: '最近7天'
    },
    auditPolicy: {
      action: '事件动作',
      category: '类别',
      categoryMandatory: '必审计',
      categoryOptional: '可选',
      totalEvents: '总事件数',
      mandatoryEvents: '必审计事件',
      optionalEvents: '可选事件',
      changedEvents: '已变更事件',
      locked: '锁定',
      lockedYes: '已锁定',
      lockedNo: '可编辑',
      lockedHint: '合规要求下，必审计事件已锁定，不能修改。',
      enabled: '是否记录',
      samplingRate: '采样率',
      retentionDays: '保留天数',
      source: '来源',
      sourceDefault: '默认',
      sourcePlatform: '平台',
      sourceTenant: '租户',
      platformScope: '平台默认',
      filterActionPlaceholder: '搜索动作或描述',
      filterCategory: '类别筛选',
      filterLock: '锁定筛选',
      filterAllCategories: '全部类别',
      filterAllLockStates: '全部锁定状态',
      filterLockedOnly: '仅锁定',
      filterEditableOnly: '仅可编辑',
      filterChangeScope: '显示范围',
      filterShowAll: '显示全部',
      showChangedOnly: '只看已变更',
      historyTitle: '策略变更历史',
      historyHint: '展示最近策略变更记录、操作人和变更原因。',
      changedFlag: '已变更',
      changedBy: '操作人',
      changeReason: '变更原因',
      changeReasonPlaceholder: '请填写本次策略调整的原因',
      changeReasonMin: '变更原因至少输入 3 个字符',
      updateDialogTitle: '确认更新策略',
      updateDialogHint: '提交审计策略变更前，请填写变更原因。',
      changedCount: '变更事件数',
      changedActions: '变更动作',
      realtimeRefreshed: '审计策略已根据最新系统变更自动刷新。',
      realtimePendingChanges: '检测到远程更新，请先保存或重置本地改动后再刷新。'
    },
    featureFlag: {
      realtimeRefreshed: '功能开关列表已根据最新系统变更自动刷新。'
    },
    tenant: {
      addTitle: '新增租户',
      editTitle: '编辑租户',
      viewTitle: '查看租户',
      tenantCode: '租户编码',
      tenantName: '租户名称',
      users: '用户数',
      tenantCodePlaceholder: '例如：TENANT_MAIN',
      tenantNamePlaceholder: '例如：主租户'
    },
    role: {
      addTitle: '新增角色',
      editTitle: '编辑角色',
      viewTitle: '查看角色',
      roleCode: '角色编码',
      roleName: '角色名称',
      level: '角色等级',
      tenant: '租户',
      permissions: '权限',
      noPermissionsAssigned: '未分配权限',
      groupPermissions: '{group} 权限',
      noTenantScopeHint: '未选择租户，仅显示平台角色。',
      globalSuperadmin: '全局（超级管理员）',
      systemReserved: '系统保留',
      roleCodePlaceholder: '例如：R_ADMIN',
      roleNamePlaceholder: '例如：管理员',
      levelPlaceholder: '1 - 999',
      levelSearchPlaceholder: '按角色等级筛选',
      levelRangeError: '角色等级必须为 1 到 999 的整数',
      levelHint: '数字越大表示权限层级越高。新角色等级必须低于你当前角色等级。',
      levelAllowedRangeHint: '当前角色等级：{current}，可设置等级范围：{min} - {max}。',
      levelNoAssignableHint: '当前角色等级：{current}，此账号无法创建或修改任何角色等级。',
      levelPresetUser: '用户（100）',
      levelPresetManager: '经理（300）',
      levelPresetAdmin: '管理员（500）',
      descriptionPlaceholder: '描述',
      otherGroup: '其他'
    },
    permission: {
      addTitle: '新增权限',
      editTitle: '编辑权限',
      viewTitle: '查看权限',
      permissionCode: '权限编码',
      permissionName: '权限名称',
      group: '分组',
      permissionCodePlaceholder: '例如：user.view',
      permissionNamePlaceholder: '例如：查看用户',
      groupPlaceholder: '例如：user / role / permission',
      descriptionPlaceholder: '描述'
    },
    user: {
      addTitle: '新增用户',
      editTitle: '编辑用户',
      viewTitle: '查看用户',
      userName: '用户名',
      userNamePlaceholder: '请输入用户名',
      emailPlaceholder: '请输入邮箱',
      password: '密码',
      confirmPassword: '确认密码',
      newPassword: '新密码',
      confirmNewPassword: '确认新密码',
      passwordPlaceholder: '请输入密码',
      confirmPasswordPlaceholder: '请确认密码',
      newPasswordPlaceholder: '可选：留空则保持当前密码',
      confirmNewPasswordPlaceholder: '可选：请确认新密码',
      manageRestrictedBadge: '受限',
      manageLevelRestriction: '仅可管理角色等级低于当前用户的用户。',
      manageLevelRestrictionWithLevels: '仅可管理低等级用户。当前等级：{current}，目标等级：{target}。',
      validation: {
        passwordRequired: '请输入密码',
        confirmPasswordRequired: '请确认密码',
        confirmPasswordMismatch: '确认密码不一致',
        newPasswordRequired: '请输入新密码',
        confirmNewPasswordRequired: '请确认新密码'
      }
    },
    userCenter: {
      userId: '用户ID',
      changePassword: '修改密码',
      passwordHint: '若不修改密码，可将密码相关字段留空。',
      currentPassword: '当前密码',
      currentPasswordPlaceholder: '请输入当前密码',
      currentPasswordRequired: '请输入当前密码',
      newPasswordPlaceholder: '请输入新密码',
      confirmNewPasswordPlaceholder: '请确认新密码',
      profileUpdatePartialSuccess: '资料已更新，但时区偏好保存失败，请稍后重试。',
      sessions: {
        title: '会话管理',
        hint: '查看当前活跃会话，并撤销不再信任的设备登录。',
        empty: '暂无活跃会话',
        sessionId: '会话',
        current: '当前会话',
        rememberMe: '记住登录',
        legacySession: '旧版会话',
        customAlias: '自定义名称',
        tokenCount: '{count} 个令牌',
        lastUsedAt: '最后使用时间',
        lastAccessUsedAt: '最后访问活动',
        lastRefreshUsedAt: '最后刷新活动',
        ipAddress: 'IP地址',
        accessExpiresAt: '访问令牌到期',
        refreshExpiresAt: '刷新令牌到期',
        revoke: '撤销',
        revokeCurrent: '撤销当前会话',
        revokeConfirm: '确定要撤销该会话吗？',
        revokeCurrentConfirm: '确定要撤销当前会话并立即退出登录吗？',
        revokeSuccess: '会话已撤销',
        rename: '重命名',
        renameTitle: '重命名会话',
        renameHint: '为该设备设置易识别名称。留空则使用系统识别的设备名称。',
        aliasLabel: '设备别名',
        aliasPlaceholder: '例如：办公室 MacBook / 客服 iPhone',
        renameSuccess: '会话名称已更新',
        singleDeviceMode: '单设备模式',
        multiDeviceMode: '多设备模式'
      },
      twoFactor: {
        title: '双重身份验证',
        enabled: '已开启',
        disabled: '已停用',
        activeInfo: '目前已为你的账户开启了双重身份验证。',
        inactiveInfo: '双重身份验证为你的账户增加了额外的安全保护。',
        enableBtn: '启用双重身份验证',
        disableBtn: '停用双重身份验证',
        scanTitle: '请使用身份验证器应用扫描下方二维码：',
        manualSecret: '或者手动输入此密钥：',
        disableWarning: '确定要停用双重身份验证吗？这会降低你账户的安全性。',
        otpCode: '输入 6 位数验证码',
        otpPlaceholder: '000000',
        enableSuccess: '已成功启用双重身份验证！',
        disableSuccess: '已停用双重身份验证。',
        otpMissing: '请输入验证码'
      }
    },
    language: {
      addTitle: '新增翻译',
      editTitle: '编辑翻译',
      viewTitle: '查看翻译',
      translationKey: '翻译键',
      translationValue: '翻译值',
      translationKeyPlaceholder: '例如：route.user / common.search',
      translationValuePlaceholder: '界面显示的翻译文本',
      descriptionPlaceholder: '可选：给翻译人员的备注'
    },
    theme: {
      scope: '作用域',
      sharedScope: '全租户场景共用',
      version: '配置版本',
      effectiveVersion: '生效版本',
      headerHeight: '头部高度'
    }
  },
  form: {
    required: '不能为空',
    userName: {
      required: '请输入用户名',
      invalid: '用户名格式不正确'
    },
    phone: {
      required: '请输入手机号',
      invalid: '手机号格式不正确'
    },
    pwd: {
      required: '请输入密码',
      invalid: '密码格式不正确，6-18位字符，包含字母、数字、下划线'
    },
    confirmPwd: {
      required: '请输入确认密码',
      invalid: '两次输入密码不一致'
    },
    code: {
      required: '请输入验证码',
      invalid: '验证码格式不正确'
    },
    email: {
      required: '请输入邮箱',
      invalid: '邮箱格式不正确'
    }
  },
  dropdown: {
    closeCurrent: '关闭',
    closeOther: '关闭其它',
    closeLeft: '关闭左侧',
    closeRight: '关闭右侧',
    closeAll: '关闭所有',
    pin: '固定标签',
    unpin: '取消固定'
  },
  icon: {
    themeConfig: '主题配置',
    themeSchema: '主题模式',
    lang: '切换语言',
    fullscreen: '全屏',
    fullscreenExit: '退出全屏',
    reload: '刷新页面',
    collapse: '折叠菜单',
    expand: '展开菜单',
    pin: '固定',
    unpin: '取消固定'
  },
  datatable: {
    itemCount: '共 {total} 条',
    fixed: {
      left: '左固定',
      right: '右固定',
      unFixed: '取消固定'
    }
  }
};

export default local;
