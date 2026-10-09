const languages = [
    // =========================================================
    // INDIAN LANGUAGES
    // =========================================================

    {
        code: "en",
        englishName: "English",
        nativeName: "English",
        direction: "ltr"
    },
    {
        code: "hi",
        englishName: "Hindi",
        nativeName: "हिन्दी",
        direction: "ltr"
    },
    {
        code: "mr",
        englishName: "Marathi",
        nativeName: "मराठी",
        direction: "ltr"
    },
    {
        code: "bn",
        englishName: "Bengali",
        nativeName: "বাংলা",
        direction: "ltr"
    },
    {
        code: "te",
        englishName: "Telugu",
        nativeName: "తెలుగు",
        direction: "ltr"
    },
    {
        code: "ta",
        englishName: "Tamil",
        nativeName: "தமிழ்",
        direction: "ltr"
    },
    {
        code: "gu",
        englishName: "Gujarati",
        nativeName: "ગુજરાતી",
        direction: "ltr"
    },
    {
        code: "kn",
        englishName: "Kannada",
        nativeName: "ಕನ್ನಡ",
        direction: "ltr"
    },
    {
        code: "ml",
        englishName: "Malayalam",
        nativeName: "മലയാളം",
        direction: "ltr"
    },
    {
        code: "pa",
        englishName: "Punjabi",
        nativeName: "ਪੰਜਾਬੀ",
        direction: "ltr"
    },
    {
        code: "ur",
        englishName: "Urdu",
        nativeName: "اردو",
        direction: "rtl"
    },
    {
        code: "or",
        englishName: "Odia",
        nativeName: "ଓଡ଼ିଆ",
        direction: "ltr"
    },
    {
        code: "as",
        englishName: "Assamese",
        nativeName: "অসমীয়া",
        direction: "ltr"
    },
    {
        code: "ne",
        englishName: "Nepali",
        nativeName: "नेपाली",
        direction: "ltr"
    },
    {
        code: "sa",
        englishName: "Sanskrit",
        nativeName: "संस्कृतम्",
        direction: "ltr"
    },

    // =========================================================
    // EUROPEAN LANGUAGES
    // =========================================================

    {
        code: "fr",
        englishName: "French",
        nativeName: "Français",
        direction: "ltr"
    },
    {
        code: "de",
        englishName: "German",
        nativeName: "Deutsch",
        direction: "ltr"
    },
    {
        code: "es",
        englishName: "Spanish",
        nativeName: "Español",
        direction: "ltr"
    },
    {
        code: "it",
        englishName: "Italian",
        nativeName: "Italiano",
        direction: "ltr"
    },
    {
        code: "pt",
        englishName: "Portuguese",
        nativeName: "Português",
        direction: "ltr"
    },
    {
        code: "ru",
        englishName: "Russian",
        nativeName: "Русский",
        direction: "ltr"
    },
    {
        code: "uk",
        englishName: "Ukrainian",
        nativeName: "Українська",
        direction: "ltr"
    },
    {
        code: "pl",
        englishName: "Polish",
        nativeName: "Polski",
        direction: "ltr"
    },
    {
        code: "nl",
        englishName: "Dutch",
        nativeName: "Nederlands",
        direction: "ltr"
    },
    {
        code: "sv",
        englishName: "Swedish",
        nativeName: "Svenska",
        direction: "ltr"
    },
    {
        code: "no",
        englishName: "Norwegian",
        nativeName: "Norsk",
        direction: "ltr"
    },
    {
        code: "da",
        englishName: "Danish",
        nativeName: "Dansk",
        direction: "ltr"
    },
    {
        code: "fi",
        englishName: "Finnish",
        nativeName: "Suomi",
        direction: "ltr"
    },
    {
        code: "is",
        englishName: "Icelandic",
        nativeName: "Íslenska",
        direction: "ltr"
    },
    {
        code: "cs",
        englishName: "Czech",
        nativeName: "Čeština",
        direction: "ltr"
    },
    {
        code: "sk",
        englishName: "Slovak",
        nativeName: "Slovenčina",
        direction: "ltr"
    },
    {
        code: "hu",
        englishName: "Hungarian",
        nativeName: "Magyar",
        direction: "ltr"
    },
    {
        code: "ro",
        englishName: "Romanian",
        nativeName: "Română",
        direction: "ltr"
    },
    {
        code: "bg",
        englishName: "Bulgarian",
        nativeName: "Български",
        direction: "ltr"
    },
    {
        code: "sr",
        englishName: "Serbian",
        nativeName: "Српски",
        direction: "ltr"
    },
    {
        code: "hr",
        englishName: "Croatian",
        nativeName: "Hrvatski",
        direction: "ltr"
    },
    {
        code: "sl",
        englishName: "Slovenian",
        nativeName: "Slovenščina",
        direction: "ltr"
    },
    {
        code: "bs",
        englishName: "Bosnian",
        nativeName: "Bosanski",
        direction: "ltr"
    },
    {
        code: "mk",
        englishName: "Macedonian",
        nativeName: "Македонски",
        direction: "ltr"
    },
    {
        code: "sq",
        englishName: "Albanian",
        nativeName: "Shqip",
        direction: "ltr"
    },
    {
        code: "el",
        englishName: "Greek",
        nativeName: "Ελληνικά",
        direction: "ltr"
    },
    {
        code: "et",
        englishName: "Estonian",
        nativeName: "Eesti",
        direction: "ltr"
    },
    {
        code: "lv",
        englishName: "Latvian",
        nativeName: "Latviešu",
        direction: "ltr"
    },
    {
        code: "lt",
        englishName: "Lithuanian",
        nativeName: "Lietuvių",
        direction: "ltr"
    },
    {
        code: "ga",
        englishName: "Irish",
        nativeName: "Gaeilge",
        direction: "ltr"
    },
    {
        code: "cy",
        englishName: "Welsh",
        nativeName: "Cymraeg",
        direction: "ltr"
    },
    {
        code: "eu",
        englishName: "Basque",
        nativeName: "Euskara",
        direction: "ltr"
    },
    {
        code: "ca",
        englishName: "Catalan",
        nativeName: "Català",
        direction: "ltr"
    },
    {
        code: "gl",
        englishName: "Galician",
        nativeName: "Galego",
        direction: "ltr"
    },

    // =========================================================
    // MIDDLE EASTERN LANGUAGES
    // =========================================================

    {
        code: "ar",
        englishName: "Arabic",
        nativeName: "العربية",
        direction: "rtl"
    },
    {
        code: "fa",
        englishName: "Persian",
        nativeName: "فارسی",
        direction: "rtl"
    },
    {
        code: "he",
        englishName: "Hebrew",
        nativeName: "עברית",
        direction: "rtl"
    },
    {
        code: "tr",
        englishName: "Turkish",
        nativeName: "Türkçe",
        direction: "ltr"
    },
    {
        code: "az",
        englishName: "Azerbaijani",
        nativeName: "Azərbaycanca",
        direction: "ltr"
    },
    {
        code: "hy",
        englishName: "Armenian",
        nativeName: "Հայերեն",
        direction: "ltr"
    },
    {
        code: "ka",
        englishName: "Georgian",
        nativeName: "ქართული",
        direction: "ltr"
    },
    {
        code: "ku",
        englishName: "Kurdish",
        nativeName: "Kurdî",
        direction: "rtl"
    },

    // =========================================================
    // EAST ASIAN LANGUAGES
    // =========================================================

    {
        code: "zh-CN",
        englishName: "Chinese (Simplified)",
        nativeName: "简体中文",
        direction: "ltr"
    },
    {
        code: "zh-TW",
        englishName: "Chinese (Traditional)",
        nativeName: "繁體中文",
        direction: "ltr"
    },
    {
        code: "ja",
        englishName: "Japanese",
        nativeName: "日本語",
        direction: "ltr"
    },
    {
        code: "ko",
        englishName: "Korean",
        nativeName: "한국어",
        direction: "ltr"
    },
    {
        code: "mn",
        englishName: "Mongolian",
        nativeName: "Монгол",
        direction: "ltr"
    },

    // =========================================================
    // SOUTHEAST ASIAN LANGUAGES
    // =========================================================

    {
        code: "th",
        englishName: "Thai",
        nativeName: "ไทย",
        direction: "ltr"
    },
    {
        code: "vi",
        englishName: "Vietnamese",
        nativeName: "Tiếng Việt",
        direction: "ltr"
    },
    {
        code: "id",
        englishName: "Indonesian",
        nativeName: "Bahasa Indonesia",
        direction: "ltr"
    },
    {
        code: "ms",
        englishName: "Malay",
        nativeName: "Bahasa Melayu",
        direction: "ltr"
    },
    {
        code: "tl",
        englishName: "Filipino",
        nativeName: "Filipino",
        direction: "ltr"
    },
    {
        code: "my",
        englishName: "Burmese",
        nativeName: "မြန်မာ",
        direction: "ltr"
    },
    {
        code: "km",
        englishName: "Khmer",
        nativeName: "ខ្មែរ",
        direction: "ltr"
    },
    {
        code: "lo",
        englishName: "Lao",
        nativeName: "ລາວ",
        direction: "ltr"
    },

    // =========================================================
    // CENTRAL ASIAN LANGUAGES
    // =========================================================

    {
        code: "kk",
        englishName: "Kazakh",
        nativeName: "Қазақша",
        direction: "ltr"
    },
    {
        code: "uz",
        englishName: "Uzbek",
        nativeName: "O‘zbek",
        direction: "ltr"
    },
    {
        code: "tk",
        englishName: "Turkmen",
        nativeName: "Türkmen",
        direction: "ltr"
    },
    {
        code: "ky",
        englishName: "Kyrgyz",
        nativeName: "Кыргызча",
        direction: "ltr"
    },
    {
        code: "tg",
        englishName: "Tajik",
        nativeName: "Тоҷикӣ",
        direction: "ltr"
    },

    // =========================================================
    // AFRICAN LANGUAGES
    // =========================================================

    {
        code: "sw",
        englishName: "Swahili",
        nativeName: "Kiswahili",
        direction: "ltr"
    },
    {
        code: "am",
        englishName: "Amharic",
        nativeName: "አማርኛ",
        direction: "ltr"
    },
    {
        code: "ha",
        englishName: "Hausa",
        nativeName: "Hausa",
        direction: "ltr"
    },
    {
        code: "yo",
        englishName: "Yoruba",
        nativeName: "Yorùbá",
        direction: "ltr"
    },
    {
        code: "ig",
        englishName: "Igbo",
        nativeName: "Igbo",
        direction: "ltr"
    },
    {
        code: "zu",
        englishName: "Zulu",
        nativeName: "isiZulu",
        direction: "ltr"
    },
    {
        code: "xh",
        englishName: "Xhosa",
        nativeName: "isiXhosa",
        direction: "ltr"
    },
    {
        code: "af",
        englishName: "Afrikaans",
        nativeName: "Afrikaans",
        direction: "ltr"
    },
    {
        code: "so",
        englishName: "Somali",
        nativeName: "Soomaali",
        direction: "ltr"
    },

    // =========================================================
    // OTHER LANGUAGES
    // =========================================================

    {
        code: "la",
        englishName: "Latin",
        nativeName: "Latina",
        direction: "ltr"
    },
    {
        code: "eo",
        englishName: "Esperanto",
        nativeName: "Esperanto",
        direction: "ltr"
    },
    {
        code: "jv",
        englishName: "Javanese",
        nativeName: "Basa Jawa",
        direction: "ltr"
    },
    {
        code: "su",
        englishName: "Sundanese",
        nativeName: "Basa Sunda",
        direction: "ltr"
    },
    {
        code: "mi",
        englishName: "Māori",
        nativeName: "Māori",
        direction: "ltr"
    },
    {
        code: "haw",
        englishName: "Hawaiian",
        nativeName: "ʻŌlelo Hawaiʻi",
        direction: "ltr"
    },
    {
        code: "ceb",
        englishName: "Cebuano",
        nativeName: "Cebuano",
        direction: "ltr"
    },
    {
        code: "mg",
        englishName: "Malagasy",
        nativeName: "Malagasy",
        direction: "ltr"
    },
    {
        code: "mt",
        englishName: "Maltese",
        nativeName: "Malti",
        direction: "ltr"
    }
];

export default languages;