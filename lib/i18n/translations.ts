export type Language = "en" | "hi" | "mr";

export interface TranslationDictionary {
  [key: string]: {
    en: string;
    hi: string;
    mr: string;
  };
}

export const translations: TranslationDictionary = {
  // Common UI
  appName: {
    en: "DKS Textile ERP",
    hi: "डीकेएस टेक्सटाइल ईआरपी",
    mr: "डीकेएस टेक्स्टाईल ईआरपी"
  },
  selectLanguage: {
    en: "Select Language",
    hi: "भाषा चुनें",
    mr: "भाषा निवडा"
  },
  english: {
    en: "English",
    hi: "अंग्रेजी",
    mr: "इंग्रजी"
  },
  hindi: {
    en: "Hindi",
    hi: "हिंदी",
    mr: "हिंदी"
  },
  marathi: {
    en: "Marathi",
    hi: "मराठी",
    mr: "मराठी"
  },
  searchPlaceholder: {
    en: "Search looms, parties, yarn batch...",
    hi: "लूम, पार्टी, सूत बैच खोजें...",
    mr: "लूम, पार्टी, सुत बॅच शोधा..."
  },

  // Common Table & Toolbar Actions
  search: {
    en: "Search",
    hi: "खोजें",
    mr: "शोधा"
  },
  import: {
    en: "Import",
    hi: "आयात करें",
    mr: "आयात करा"
  },
  export: {
    en: "Export",
    hi: "निर्यात करें",
    mr: "निर्यात करा"
  },
  filters: {
    en: "Filters",
    hi: "फिल्टर",
    mr: "फिल्टर"
  },
  all: {
    en: "All",
    hi: "सभी",
    mr: "सर्व"
  },
  reset: {
    en: "Reset",
    hi: "रीसेट",
    mr: "रीसेट"
  },
  showing: {
    en: "Showing",
    hi: "दिखा रहा है",
    mr: "दर्शवत आहे"
  },
  of: {
    en: "of",
    hi: "का",
    mr: "पैकी"
  },
  entries: {
    en: "entries",
    hi: "एंट्रीज",
    mr: "नोंदी"
  },
  previous: {
    en: "Previous",
    hi: "पिछला",
    mr: "मागील"
  },
  next: {
    en: "Next",
    hi: "अगला",
    mr: "पुढील"
  },
  page: {
    en: "Page",
    hi: "पृष्ठ",
    mr: "पान"
  },
  noDataFound: {
    en: "No data found",
    hi: "कोई डेटा नहीं मिला",
    mr: "कोणतीही माहिती आढळली नाही"
  },
  noDataDesc: {
    en: "There are no records to display matching your request.",
    hi: "आपकी खोज से मेल खाने वाला कोई रिकॉर्ड नहीं है।",
    mr: "तुमच्या शोधाशी जुळणारी कोणतीही नोंद आढळली नाही."
  },
  fetchingData: {
    en: "Fetching data, please wait...",
    hi: "डेटा लोड हो रहा है, कृपया प्रतीक्षा करें...",
    mr: "माहिती लोड होत आहे, कृपया वाट पाहा..."
  },
  view: {
    en: "View Details",
    hi: "विवरण देखें",
    mr: "तपशील पहा"
  },
  
  // Navigation Groups
  navOperations: {
    en: "Operations",
    hi: "कामकाज (Operations)",
    mr: "कामकाज (Operations)"
  },
  navMasterData: {
    en: "Master Data",
    hi: "मास्टर डेटा",
    mr: "मास्टर डेटा"
  },
  navWeavingYarn: {
    en: "Weaving & Yarn",
    hi: "बुनाई और सूत (ताणा-बाणा)",
    mr: "विणकाम आणि सुत (ताणा-बाणा)"
  },
  navSalesLogistics: {
    en: "Sales & Delivery",
    hi: "बिक्री और डिलीवरी",
    mr: "विक्री आणि डिलिव्हरी"
  },
  navFinanceReports: {
    en: "Finance & Accounts",
    hi: "वित्त और खाते",
    mr: "वित्त आणि हिशोब"
  },
  navSetupApps: {
    en: "Setup & Tools",
    hi: "सेटअप और टूल्स",
    mr: "सेटअप आणि टूल्स"
  },

  // Nav Items
  navDashboard: {
    en: "Dashboard",
    hi: "डैशबोर्ड",
    mr: "डॅशबोर्ड"
  },
  navFactoryMaster: {
    en: "Factory Master",
    hi: "कारखाना मास्टर",
    mr: "कारखाना मास्टर"
  },
  navLoomMaster: {
    en: "Loom Master",
    hi: "लूम (माग) मास्टर",
    mr: "लूम (माग) मास्टर"
  },
  navPartyMaster: {
    en: "Party Master",
    hi: "पार्टी (व्यापारी) मास्टर",
    mr: "पार्टी (व्यापारी) मास्टर"
  },
  navLabourMaster: {
    en: "Labour Master",
    hi: "कारीगर/बुनकर मास्टर",
    mr: "कामगार/विणकर मास्टर"
  },
  navSizingMaster: {
    en: "Sizing Master",
    hi: "साइजिंग मिल मास्टर",
    mr: "सायझिंग मिल मास्टर"
  },
  navSizingYarn: {
    en: "Sizing Batch",
    hi: "साइजिंग सूत बॅच",
    mr: "सायझिंग सुत बॅच"
  },
  navTanaWarp: {
    en: "Tana (Warp) Entry",
    hi: "ताणा (Warp) एंट्री",
    mr: "ताणा (Warp) नोंद"
  },
  navBanaWeft: {
    en: "Bana (Weft) Issue",
    hi: "बाणा (Weft) इश्यू",
    mr: "बाणा (Weft) इश्यू"
  },
  navSalesOrder: {
    en: "Party Order",
    hi: "पार्टी ऑर्डर",
    mr: "पार्टी ऑर्डर"
  },
  navDeliveryChallan: {
    en: "Fabric Delivery",
    hi: "कपड़ा डिलीवरी चालान",
    mr: "कापड डिलिव्हरी पावती"
  },
  navWeaverCommission: {
    en: "Weaver Wage / Payment",
    hi: "बुनकर मजूरी / भुगतान",
    mr: "विणकर मजुरी / पेमेंट"
  },
  navSizingPayment: {
    en: "Sizing Bills",
    hi: "साइजिंग बिल",
    mr: "सायझिंग बिल"
  },
  navPipesInformation: {
    en: "Pipes Information",
    hi: "पाइप जानकारी (Pipes)",
    mr: "पायप माहिती (Pipes)"
  },

  // Mill Live Feed
  millLiveFeedTitle: {
    en: "Mill Live Feed",
    hi: "मिल लाइव अपडेट",
    mr: "गिरणी लाईव्ह अपडेट"
  },
  millLiveFeedDesc: {
    en: "Ichalkaranji Unit-I running. Active Weavers: 18. Speed: 680 RPM.",
    hi: "इचलकरंजी युनिट-1 चालू. सक्रिय बुनकर: 18. गति: 680 RPM.",
    mr: "इचलकरंजी युनिट-१ चालू. कार्यरत विणकर: १८. स्पीड: ६८० RPM."
  },
  unitStatusOperational: {
    en: "Operational (24x7)",
    hi: "चालू (24x7)",
    mr: "कार्यरत (२४x७)"
  },
  unitStatusPlanning: {
    en: "Planning Phase",
    hi: "योजना चरण",
    mr: "नियोजन टप्पा"
  },
  unitsListTitle: {
    en: "DKS Weaving Units",
    hi: "डीकेएस बुनाई यूनिट्स",
    mr: "डीकेएस विणकाम युनिट्स"
  },

  // Actions & Buttons
  add: {
    en: "Add New",
    hi: "नया जोड़ें",
    mr: "नवीन जोडा"
  },
  edit: {
    en: "Edit",
    hi: "संपादित करें",
    mr: "संपादित करा"
  },
  delete: {
    en: "Delete",
    hi: "हटाएं",
    mr: "हटवा"
  },
  save: {
    en: "Save",
    hi: "सहेजें",
    mr: "साठवा"
  },
  cancel: {
    en: "Cancel",
    hi: "रद्द करें",
    mr: "रद्द करा"
  },
  status: {
    en: "Status",
    hi: "स्थिति",
    mr: "स्थिती"
  },
  actions: {
    en: "Actions",
    hi: "कार्रवाई",
    mr: "कृती"
  },
  active: {
    en: "Active",
    hi: "सक्रिय",
    mr: "सक्रिय"
  },
  inactive: {
    en: "Inactive",
    hi: "निष्क्रिय",
    mr: "अक्रिय"
  },
  loading: {
    en: "Loading...",
    hi: "लोड हो रहा है...",
    mr: "लोड होत आहे..."
  }
};
