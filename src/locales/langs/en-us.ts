const local: App.I18n.Schema = {
  system: {
    title: 'Obsidian Admin',
    updateTitle: 'System Version Update Notification',
    updateContent: 'A new version of the system has been detected. Do you want to refresh the page immediately?',
    updateConfirm: 'Refresh immediately',
    updateCancel: 'Later'
  },
  common: {
    action: 'Action',
    add: 'Add',
    addSuccess: 'Add Success',
    backToHome: 'Back to Dashboard',
    batchDelete: 'Batch Delete',
    cancel: 'Cancel',
    close: 'Close',
    check: 'Check',
    selectAll: 'Select All',
    expandColumn: 'Expand Column',
    columnSetting: 'Column Setting',
    config: 'Config',
    confirm: 'Confirm',
    delete: 'Delete',
    deleteSuccess: 'Delete Success',
    batchDeletePartialResult: 'Batch delete completed: {success} succeeded, {failed} failed.',
    batchDeleteFailed: 'Batch delete failed. Please refresh and try again.',
    confirmDelete: 'Are you sure you want to delete?',
    edit: 'Edit',
    warning: 'Warning',
    error: 'Error',
    index: 'Index',
    keywordSearch: 'Please enter keyword',
    logout: 'Logout',
    logoutConfirm: 'Are you sure you want to log out?',
    lookForward: 'Coming soon',
    modify: 'Modify',
    modifySuccess: 'Modify Success',
    noData: 'No Data',
    operate: 'Operate',
    pleaseCheckValue: 'Please check whether the value is valid',
    refresh: 'Refresh',
    reset: 'Reset',
    search: 'Search',
    switch: 'Switch',
    tip: 'Tip',
    trigger: 'Trigger',
    update: 'Update',
    updateSuccess: 'Update Success',
    userCenter: 'User Center',
    view: 'View',
    tenant: 'Tenant',
    platform: 'Platform',
    noTenants: 'No Tenants',
    selectTenant: 'Select tenant',
    switchTenantSuccess: 'Switched to {tenant}',
    status: 'Status',
    description: 'Description',
    keyword: 'Keyword',
    email: 'Email',
    role: 'Role',
    locale: 'Locale',
    timezone: 'Timezone',
    createdAt: 'Created At',
    updatedAt: 'Updated At',
    active: 'Active',
    inactive: 'Inactive',
    selectStatus: 'Please select status',
    selectRole: 'Please select role',
    selectLocale: 'Please select locale',
    selectTimezone: 'Please select timezone',
    yesOrNo: {
      yes: 'Yes',
      no: 'No'
    }
  },
  request: {
    logout: 'Logout user after request failed',
    logoutMsg: 'User status is invalid, please log in again',
    logoutWithModal: 'Pop up modal after request failed and then log out user',
    logoutWithModalMsg: 'User status is invalid, please log in again',
    refreshToken: 'The requested token has expired, refresh the token',
    tokenExpired: 'The requested token has expired'
  },
  theme: {
    themeDrawerTitle: 'Theme Configuration',
    tabs: {
      appearance: 'Appearance',
      layout: 'Layout',
      general: 'General',
      preset: 'Preset'
    },
    appearance: {
      themeSchema: {
        title: 'Theme Schema',
        light: 'Light',
        dark: 'Dark',
        auto: 'Follow System'
      },
      grayscale: 'Grayscale',
      colourWeakness: 'Colour Weakness',
      themeColor: {
        title: 'Theme Color',
        primary: 'Primary',
        info: 'Info',
        success: 'Success',
        warning: 'Warning',
        error: 'Error',
        followPrimary: 'Follow Primary'
      },
      themeRadius: {
        title: 'Theme Radius'
      },
      recommendColor: 'Apply Recommended Color Algorithm',
      recommendColorDesc: 'The recommended color algorithm refers to',
      preset: {
        title: 'Theme Presets',
        apply: 'Apply',
        applySuccess: 'Preset applied successfully',
        default: {
          name: 'Default Preset',
          desc: 'Default theme preset with balanced settings'
        },
        dark: {
          name: 'Dark Preset',
          desc: 'Dark theme preset for night time usage'
        },
        compact: {
          name: 'Compact Preset',
          desc: 'Compact layout preset for small screens'
        },
        azir: {
          name: "Azir's Preset",
          desc: 'It is a cold and elegant preset that Azir likes'
        }
      }
    },
    layout: {
      layoutMode: {
        title: 'Layout Mode',
        vertical: 'Vertical Mode',
        horizontal: 'Horizontal Mode',
        'vertical-mix': 'Vertical Mix Mode',
        'vertical-hybrid-header-first': 'Left Hybrid Header-First',
        'top-hybrid-sidebar-first': 'Top-Hybrid Sidebar-First',
        'top-hybrid-header-first': 'Top-Hybrid Header-First',
        vertical_detail: 'Vertical menu layout, with the menu on the left and content on the right.',
        'vertical-mix_detail':
          'Vertical mix-menu layout, with the primary menu on the dark left side and the secondary menu on the lighter left side.',
        'vertical-hybrid-header-first_detail':
          'Left hybrid layout, with the primary menu at the top, the secondary menu on the dark left side, and the tertiary menu on the lighter left side.',
        horizontal_detail: 'Horizontal menu layout, with the menu at the top and content below.',
        'top-hybrid-sidebar-first_detail':
          'Top hybrid layout, with the primary menu on the left and the secondary menu at the top.',
        'top-hybrid-header-first_detail':
          'Top hybrid layout, with the primary menu at the top and the secondary menu on the left.'
      },
      tab: {
        title: 'Tab Settings',
        visible: 'Tab Visible',
        fullscreenVisible: 'Display tab fullscreen button',
        cache: 'Tag Bar Info Cache',
        cacheTip: 'One-click to open/close global keepalive',
        height: 'Tab Height',
        mode: {
          title: 'Tab Mode',
          slider: 'Slider',
          chrome: 'Chrome',
          button: 'Button'
        },
        closeByMiddleClick: 'Close Tab by Middle Click',
        closeByMiddleClickTip: 'Enable closing tabs by clicking with the middle mouse button'
      },
      header: {
        title: 'Header Settings',
        height: 'Header Height',
        fullscreenVisible: 'Display top bar fullscreen button',
        breadcrumb: {
          visible: 'Breadcrumb Visible',
          showIcon: 'Breadcrumb Icon Visible'
        }
      },
      sider: {
        title: 'Sider Settings',
        inverted: 'Dark Sider',
        width: 'Sider Width',
        collapsedWidth: 'Sider Collapsed Width',
        mixWidth: 'Mix Sider Width',
        mixCollapsedWidth: 'Mix Sider Collapse Width',
        mixChildMenuWidth: 'Mix Child Menu Width',
        autoSelectFirstMenu: 'Auto Select First Submenu',
        autoSelectFirstMenuTip:
          'When a first-level menu is clicked, the first submenu is automatically selected and navigated to the deepest level'
      },
      footer: {
        title: 'Footer Settings',
        visible: 'Footer Visible',
        fixed: 'Fixed Footer',
        height: 'Footer Height',
        right: 'Right Footer'
      },
      content: {
        title: 'Content Area Settings',
        scrollMode: {
          title: 'Scroll Mode',
          tip: 'The theme scroll only scrolls the main part, the outer scroll can carry the header and footer together',
          wrapper: 'Wrapper',
          content: 'Content'
        },
        page: {
          animate: 'Page Animate',
          mode: {
            title: 'Page Animate Mode',
            fade: 'Fade',
            'fade-slide': 'Slide',
            'fade-bottom': 'Fade Zoom',
            'fade-scale': 'Fade Scale',
            'zoom-fade': 'Zoom Fade',
            'zoom-out': 'Zoom Out',
            none: 'None'
          }
        },
        fixedHeaderAndTab: 'Fixed Header And Tab'
      }
    },
    general: {
      title: 'General Settings',
      watermark: {
        title: 'Watermark Settings',
        visible: 'Watermark Full Screen Visible',
        text: 'Custom Watermark Text',
        enableUserName: 'Enable User Name Watermark',
        enableTime: 'Show Current Time',
        timeFormat: 'Time Format'
      },
      multilingual: {
        title: 'Multilingual Settings',
        visible: 'Display multilingual button'
      },
      themeSchema: {
        title: 'Theme Schema Switch',
        visible: 'Display Theme Schema button'
      },
      globalSearch: {
        title: 'Global Search Settings',
        visible: 'Display GlobalSearch button'
      },
      themeConfig: {
        title: 'Theme Config Button',
        visible: 'Display Theme Config button'
      }
    },
    configOperation: {
      copyConfig: 'Copy Config',
      copySuccessMsg: 'Copy Success, Please replace the variable "themeSettings" in "src/theme/settings.ts"',
      resetConfig: 'Reset Config',
      resetSuccessMsg: 'Reset Success'
    }
  },
  route: {
    login: 'Login',
    403: 'No Permission',
    404: 'Page Not Found',
    500: 'Server Error',
    'iframe-page': 'Iframe',
    dashboard: 'Dashboard',
    user: 'User',
    'user-center': 'User Center',
    role: 'Role',
    'audit-policy': 'Audit Policy',
    audit: 'Audit Logs',
    permission: 'Permission',
    tenant: 'Tenant',
    language: 'Language',
    'theme-config': 'Theme Config',
    'feature-flag': 'Feature Flags'
  },
  menu: {
    accessManagement: 'Access Management',
    systemSettings: 'System Settings'
  },
  page: {
    login: {
      common: {
        loginOrRegister: 'Login / Register',
        userNamePlaceholder: 'Please enter user name',
        phonePlaceholder: 'Please enter phone number',
        codePlaceholder: 'Please enter verification code',
        passwordPlaceholder: 'Please enter password',
        confirmPasswordPlaceholder: 'Please enter password again',
        codeLogin: 'Verification code login',
        confirm: 'Confirm',
        back: 'Back',
        validateSuccess: 'Verification passed',
        loginSuccess: 'Login successfully',
        welcomeBack: 'Welcome back, {userName} !'
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
        superNoTenant: 'Super (No Tenant)',
        adminMain: 'Admin (Main)',
        adminBranch: 'Admin (Branch)',
        userMain: 'User (Main)',
        userBranch: 'User (Branch)',
        twoFactorOtpPlaceholder: 'Two-Factor OTP Code (6 digits)'
      },
      codeLogin: {
        title: 'Verification Code Login',
        getCode: 'Get verification code',
        reGetCode: 'Reacquire after {time}s',
        sendCodeSuccess: 'Verification code sent successfully',
        imageCodePlaceholder: 'Please enter image verification code'
      },
      register: {
        title: 'Register',
        agreement: 'I have read and agree to',
        protocol: '《User Agreement》',
        policy: '《Privacy Policy》'
      },
      resetPwd: {
        title: 'Reset Password'
      },
      bindWeChat: {
        title: 'Bind WeChat'
      }
    },
    dashboard: {
      branchDesc:
        'For the convenience of everyone in developing and updating the merge, we have streamlined the code of the main branch, only retaining the homepage menu, and the rest of the content has been moved to the example branch for maintenance. The preview address displays the content of the example branch.',
      greeting: 'Good morning, {userName}, today is another day full of vitality!',
      weatherDesc: 'Today is cloudy to clear, 20℃ - 25℃!',
      projectCount: 'Project Count',
      todo: 'Todo',
      message: 'Message',
      downloadCount: 'Download Count',
      registerCount: 'Register Count',
      schedule: 'Work and rest Schedule',
      study: 'Study',
      work: 'Work',
      rest: 'Rest',
      entertainment: 'Entertainment',
      visitCount: 'Visit Count',
      turnover: 'Turnover',
      dealCount: 'Deal Count',
      projectNews: {
        title: 'Project News',
        moreNews: 'More News',
        desc1: 'Obsidian Admin created the open source project obsidian-admin on February 22, 2026!',
        desc2: 'Yanbowe submitted a bug to obsidian-admin, the multi-tab bar will not adapt.',
        desc3: 'Obsidian Admin is ready to do sufficient preparation for the release of obsidian-admin!',
        desc4: 'Obsidian Admin is busy writing project documentation for obsidian-admin!',
        desc5: 'Obsidian Admin just wrote some of the workbench pages casually, and it was enough to see!'
      },
      creativity: 'Creativity'
    },
    audit: {
      viewTitle: 'View Audit Log',
      action: 'Action',
      actionPlaceholder: 'Ex: user.update',
      operator: 'Operator',
      operatorPlaceholder: 'Ex: Admin',
      target: 'Target',
      ipAddress: 'IP Address',
      userAgent: 'User Agent',
      oldValues: 'Old Values',
      newValues: 'New Values',
      timeRange: 'Time Range',
      last24Hours: 'Last 24 Hours',
      last7Days: 'Last 7 Days'
    },
    auditPolicy: {
      action: 'Action',
      category: 'Category',
      categoryMandatory: 'Mandatory',
      categoryOptional: 'Optional',
      totalEvents: 'Total Events',
      mandatoryEvents: 'Mandatory Events',
      optionalEvents: 'Optional Events',
      changedEvents: 'Changed Events',
      locked: 'Locked',
      lockedYes: 'Locked',
      lockedNo: 'Editable',
      lockedHint: 'Mandatory events are locked for compliance and cannot be changed.',
      enabled: 'Enabled',
      samplingRate: 'Sampling Rate',
      retentionDays: 'Retention (Days)',
      source: 'Source',
      sourceDefault: 'Default',
      sourcePlatform: 'Platform',
      sourceTenant: 'Tenant',
      platformScope: 'Platform Default',
      filterActionPlaceholder: 'Search action or description',
      filterCategory: 'Category filter',
      filterLock: 'Lock filter',
      filterAllCategories: 'All Categories',
      filterAllLockStates: 'All Lock States',
      filterLockedOnly: 'Locked Only',
      filterEditableOnly: 'Editable Only',
      filterChangeScope: 'Display Scope',
      filterShowAll: 'Show All',
      showChangedOnly: 'Show changed only',
      historyTitle: 'Policy Change History',
      historyHint: 'Recent policy updates with operator and reason.',
      changedFlag: 'Changed',
      changedBy: 'Changed By',
      changeReason: 'Change Reason',
      changeReasonPlaceholder: 'Describe why this audit policy change is needed',
      changeReasonMin: 'Please enter at least 3 characters for change reason',
      updateDialogTitle: 'Confirm Policy Update',
      updateDialogHint: 'Please provide a reason before submitting this audit policy change.',
      changedCount: 'Changed Events',
      changedActions: 'Changed Actions',
      realtimeRefreshed: 'Audit policy reloaded from latest system update.',
      realtimePendingChanges: 'Remote update detected. Save or reset your local changes before refreshing.'
    },
    featureFlag: {
      realtimeRefreshed: 'Feature flag list reloaded from latest system update.'
    },
    tenant: {
      addTitle: 'Add Tenant',
      editTitle: 'Edit Tenant',
      viewTitle: 'View Tenant',
      tenantCode: 'Tenant Code',
      tenantName: 'Tenant Name',
      users: 'Users',
      tenantCodePlaceholder: 'Ex: TENANT_MAIN',
      tenantNamePlaceholder: 'Ex: Main Tenant'
    },
    role: {
      addTitle: 'Add Role',
      editTitle: 'Edit Role',
      viewTitle: 'View Role',
      roleCode: 'Role Code',
      roleName: 'Role Name',
      level: 'Role Level',
      tenant: 'Tenant',
      permissions: 'Permissions',
      noPermissionsAssigned: 'No permissions assigned',
      groupPermissions: '{group} Permissions',
      noTenantScopeHint: 'No tenant selected. Showing global roles only.',
      globalSuperadmin: 'Global (Superadmin)',
      systemReserved: 'System Reserved',
      roleCodePlaceholder: 'Ex: R_ADMIN',
      roleNamePlaceholder: 'Ex: Admin',
      levelPlaceholder: '1 - 999',
      levelSearchPlaceholder: 'Search by level',
      levelRangeError: 'Role level must be an integer between 1 and 999',
      levelHint: 'Higher number means higher privilege. New role level must be lower than your current role level.',
      levelAllowedRangeHint: 'Current role level: {current}. Allowed level range: {min} - {max}.',
      levelNoAssignableHint: 'Current role level: {current}. You cannot create or update a role level in this account.',
      levelPresetUser: 'User (100)',
      levelPresetManager: 'Manager (300)',
      levelPresetAdmin: 'Admin (500)',
      descriptionPlaceholder: 'Description',
      otherGroup: 'Other'
    },
    permission: {
      addTitle: 'Add Permission',
      editTitle: 'Edit Permission',
      viewTitle: 'View Permission',
      permissionCode: 'Permission Code',
      permissionName: 'Permission Name',
      group: 'Group',
      permissionCodePlaceholder: 'Ex: user.view',
      permissionNamePlaceholder: 'Ex: View Users',
      groupPlaceholder: 'Ex: user / role / permission',
      descriptionPlaceholder: 'Description'
    },
    user: {
      addTitle: 'Add User',
      editTitle: 'Edit User',
      viewTitle: 'View User',
      userName: 'User Name',
      userNamePlaceholder: 'Please enter user name',
      emailPlaceholder: 'Please enter email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      newPassword: 'New Password',
      confirmNewPassword: 'Confirm New Password',
      passwordPlaceholder: 'Please enter password',
      confirmPasswordPlaceholder: 'Please confirm password',
      newPasswordPlaceholder: 'Optional: leave empty to keep current password',
      confirmNewPasswordPlaceholder: 'Optional: confirm new password',
      manageRestrictedBadge: 'Restricted',
      manageLevelRestriction: 'Only users with a lower role level can be managed.',
      manageLevelRestrictionWithLevels:
        'Only lower-level users can be managed. Current level: {current}, target level: {target}.',
      validation: {
        passwordRequired: 'Please enter password',
        confirmPasswordRequired: 'Please confirm password',
        confirmPasswordMismatch: 'Confirm password does not match',
        newPasswordRequired: 'Please enter new password',
        confirmNewPasswordRequired: 'Please confirm new password'
      }
    },
    userCenter: {
      userId: 'User ID',
      changePassword: 'Change Password',
      passwordHint: 'Leave password fields empty if you do not want to change your password.',
      currentPassword: 'Current Password',
      currentPasswordPlaceholder: 'Please enter current password',
      currentPasswordRequired: 'Please enter current password',
      newPasswordPlaceholder: 'Please enter new password',
      confirmNewPasswordPlaceholder: 'Please confirm new password',
      profileUpdatePartialSuccess: 'Profile updated, but timezone preference could not be saved. Please try again.',
      sessions: {
        title: 'Sessions',
        hint: 'Review active sessions and revoke devices you no longer trust.',
        empty: 'No active sessions',
        sessionId: 'Session',
        current: 'Current Session',
        rememberMe: 'Remember Me',
        legacySession: 'Legacy Session',
        customAlias: 'Custom Name',
        tokenCount: '{count} token(s)',
        lastUsedAt: 'Last Used',
        lastAccessUsedAt: 'Last Access Activity',
        lastRefreshUsedAt: 'Last Refresh Activity',
        ipAddress: 'IP Address',
        accessExpiresAt: 'Access Token Expires',
        refreshExpiresAt: 'Refresh Token Expires',
        revoke: 'Revoke',
        revokeCurrent: 'Revoke Current',
        revokeConfirm: 'Revoke this session?',
        revokeCurrentConfirm: 'Revoke current session and sign out now?',
        revokeSuccess: 'Session revoked',
        rename: 'Rename',
        renameTitle: 'Rename Session',
        renameHint: 'Set a friendly name for this device. Leave empty to use the detected device name.',
        aliasLabel: 'Device Alias',
        aliasPlaceholder: 'Ex: Office MacBook / Support iPhone',
        renameSuccess: 'Session name updated',
        singleDeviceMode: 'Single-device mode',
        multiDeviceMode: 'Multi-device mode'
      },
      twoFactor: {
        title: 'Two-Factor Authentication',
        enabled: 'Enabled',
        disabled: 'Disabled',
        activeInfo: 'Two-factor authentication is currently active on your account.',
        inactiveInfo: 'Two-factor authentication adds an additional layer of security to your account.',
        enableBtn: 'Enable Two-Factor Authentication',
        disableBtn: 'Disable Two-Factor Authentication',
        scanTitle: 'Scan the QR code below with your authenticator app:',
        manualSecret: 'Or enter this secret manually: ',
        disableWarning:
          'Are you sure you want to disable two-factor authentication? This will make your account less secure.',
        otpCode: 'Enter 6-digit OTP Code',
        otpPlaceholder: '000000',
        enableSuccess: 'Two-factor authentication enabled successfully!',
        disableSuccess: 'Two-factor authentication disabled.',
        otpMissing: 'Please enter the OTP code'
      }
    },
    language: {
      addTitle: 'Add Translation',
      editTitle: 'Edit Translation',
      viewTitle: 'View Translation',
      translationKey: 'Translation Key',
      translationValue: 'Translation Value',
      translationKeyPlaceholder: 'Ex: route.user / common.search',
      translationValuePlaceholder: 'Translation text shown in UI',
      descriptionPlaceholder: 'Optional note for translators'
    },
    theme: {
      scope: 'Scope',
      sharedScope: 'Shared for all tenant contexts',
      version: 'Profile Version',
      effectiveVersion: 'Effective Version',
      headerHeight: 'Header Height'
    }
  },
  form: {
    required: 'Cannot be empty',
    userName: {
      required: 'Please enter user name',
      invalid: 'User name format is incorrect'
    },
    phone: {
      required: 'Please enter phone number',
      invalid: 'Phone number format is incorrect'
    },
    pwd: {
      required: 'Please enter password',
      invalid: '6-18 characters, including letters, numbers, and underscores'
    },
    confirmPwd: {
      required: 'Please enter password again',
      invalid: 'The two passwords are inconsistent'
    },
    code: {
      required: 'Please enter verification code',
      invalid: 'Verification code format is incorrect'
    },
    email: {
      required: 'Please enter email',
      invalid: 'Email format is incorrect'
    }
  },
  dropdown: {
    closeCurrent: 'Close Current',
    closeOther: 'Close Other',
    closeLeft: 'Close Left',
    closeRight: 'Close Right',
    closeAll: 'Close All',
    pin: 'Pin Tab',
    unpin: 'Unpin Tab'
  },
  icon: {
    themeConfig: 'Theme Configuration',
    themeSchema: 'Theme Schema',
    lang: 'Switch Language',
    fullscreen: 'Fullscreen',
    fullscreenExit: 'Exit Fullscreen',
    reload: 'Reload Page',
    collapse: 'Collapse Menu',
    expand: 'Expand Menu',
    pin: 'Pin',
    unpin: 'Unpin'
  },
  datatable: {
    itemCount: 'Total {total} items',
    fixed: {
      left: 'Left Fixed',
      right: 'Right Fixed',
      unFixed: 'Unfixed'
    }
  }
};

export default local;
