declare namespace Api {
  /**
   * namespace Language
   *
   * backend api module: "language"
   */
  namespace Language {
    type LocaleCode = App.I18n.LangType;

    interface LanguageOption {
      id: number;
      locale: LocaleCode;
      localeName: string;
      status?: Api.Common.EnableStatus;
      isDefault: boolean;
    }

    interface TranslationRecord {
      id: number;
      locale: LocaleCode;
      localeName: string;
      translationKey: string;
      translationValue: string;
      description: string;
      status: Api.Common.EnableStatus;
      createTime: string;
      updateTime: string;
    }

    interface TranslationListParams {
      current: number;
      size: number;
      locale?: LocaleCode;
      keyword?: string;
      status?: Api.Common.EnableStatus;
    }

    interface TranslationPayload {
      locale: LocaleCode;
      translationKey: string;
      translationValue: string;
      description?: string;
      status?: Api.Common.EnableStatus;
    }

    interface RuntimeMessagesParams {
      locale?: LocaleCode;
      version?: string;
    }

    interface RuntimeMessagesPayload {
      locale: LocaleCode;
      version: string;
      notModified: boolean;
      messages: Record<string, string>;
    }

    type TranslationList = Api.Common.PaginatingQueryRecord<TranslationRecord>;
  }
}
