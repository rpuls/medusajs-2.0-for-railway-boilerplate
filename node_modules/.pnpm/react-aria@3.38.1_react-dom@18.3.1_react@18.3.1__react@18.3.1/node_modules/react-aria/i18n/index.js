let {PackageLocalizationProvider, getPackageLocalizationScript} = require('@react-aria/i18n/server');
let {LocalizedStringDictionary} = require('@internationalized/string');
let {createElement} = require('react');
let ar_AE = require('./ar-AE.js');
let bg_BG = require('./bg-BG.js');
let cs_CZ = require('./cs-CZ.js');
let da_DK = require('./da-DK.js');
let de_DE = require('./de-DE.js');
let el_GR = require('./el-GR.js');
let en_US = require('./en-US.js');
let es_ES = require('./es-ES.js');
let et_EE = require('./et-EE.js');
let fi_FI = require('./fi-FI.js');
let fr_FR = require('./fr-FR.js');
let he_IL = require('./he-IL.js');
let hr_HR = require('./hr-HR.js');
let hu_HU = require('./hu-HU.js');
let it_IT = require('./it-IT.js');
let ja_JP = require('./ja-JP.js');
let ko_KR = require('./ko-KR.js');
let lt_LT = require('./lt-LT.js');
let lv_LV = require('./lv-LV.js');
let nb_NO = require('./nb-NO.js');
let nl_NL = require('./nl-NL.js');
let pl_PL = require('./pl-PL.js');
let pt_BR = require('./pt-BR.js');
let pt_PT = require('./pt-PT.js');
let ro_RO = require('./ro-RO.js');
let ru_RU = require('./ru-RU.js');
let sk_SK = require('./sk-SK.js');
let sl_SI = require('./sl-SI.js');
let sr_SP = require('./sr-SP.js');
let sv_SE = require('./sv-SE.js');
let tr_TR = require('./tr-TR.js');
let uk_UA = require('./uk-UA.js');
let zh_CN = require('./zh-CN.js');
let zh_TW = require('./zh-TW.js');

let dictionary = new LocalizedStringDictionary({
  "ar-AE": ar_AE,
  "bg-BG": bg_BG,
  "cs-CZ": cs_CZ,
  "da-DK": da_DK,
  "de-DE": de_DE,
  "el-GR": el_GR,
  "en-US": en_US,
  "es-ES": es_ES,
  "et-EE": et_EE,
  "fi-FI": fi_FI,
  "fr-FR": fr_FR,
  "he-IL": he_IL,
  "hr-HR": hr_HR,
  "hu-HU": hu_HU,
  "it-IT": it_IT,
  "ja-JP": ja_JP,
  "ko-KR": ko_KR,
  "lt-LT": lt_LT,
  "lv-LV": lv_LV,
  "nb-NO": nb_NO,
  "nl-NL": nl_NL,
  "pl-PL": pl_PL,
  "pt-BR": pt_BR,
  "pt-PT": pt_PT,
  "ro-RO": ro_RO,
  "ru-RU": ru_RU,
  "sk-SK": sk_SK,
  "sl-SI": sl_SI,
  "sr-SP": sr_SP,
  "sv-SE": sv_SE,
  "tr-TR": tr_TR,
  "uk-UA": uk_UA,
  "zh-CN": zh_CN,
  "zh-TW": zh_TW,
});

function LocalizedStringProvider({locale, dictionary: dict = dictionary, nonce}) {
  let strings = dict.getStringsForLocale(locale);
  return createElement(PackageLocalizationProvider, {locale, strings, nonce});
}

function getLocalizationScript(locale, dict = dictionary) {
  let strings = dict.getStringsForLocale(locale);
  return getPackageLocalizationScript(locale, strings);
}

let deps = {"@react-aria/autocomplete":["@react-aria/combobox","@react-aria/searchfield"],"@react-aria/color":["@react-aria/numberfield","@react-aria/spinbutton","@react-stately/color"],"@react-aria/combobox":["@react-aria/menu","@react-aria/overlays"],"@react-aria/datepicker":["@react-aria/spinbutton","@react-stately/datepicker"],"@react-aria/dnd":["@react-aria/overlays"],"@react-aria/gridlist":["@react-aria/grid"],"@react-aria/menu":["@react-aria/overlays"],"@react-aria/numberfield":["@react-aria/spinbutton"],"@react-aria/table":["@react-aria/grid"],"@react-aria/tag":["@react-aria/gridlist"],"@react-aria/tree":["@react-aria/gridlist"]};

function createLocalizedStringDictionary(packages) {
  let strings = {};
  let seen = new Set();
  let addPkg = (pkg) => {
    if (seen.has(pkg)) {
      return;
    }
    seen.add(pkg);

    for (let lang in dictionary.strings) {
      strings[lang] ??= {};
      strings[lang][pkg] = dictionary.strings[lang][pkg];
    }

    for (let dep of deps[pkg] || []) {
      addPkg(dep);
    }
  };

  
  for (let pkg of packages) {
    addPkg(pkg);
  }

  return new LocalizedStringDictionary(strings);
}
exports.LocalizedStringProvider = LocalizedStringProvider;
exports.getLocalizationScript = getLocalizationScript;
exports.dictionary = dictionary;
exports.createLocalizedStringDictionary = createLocalizedStringDictionary;
