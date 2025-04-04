import {PackageLocalizationProvider, getPackageLocalizationScript} from '@react-aria/i18n/server';
import {LocalizedStringDictionary} from '@internationalized/string';
import {createElement} from 'react';
import ar_AE from './ar-AE.mjs';
import bg_BG from './bg-BG.mjs';
import cs_CZ from './cs-CZ.mjs';
import da_DK from './da-DK.mjs';
import de_DE from './de-DE.mjs';
import el_GR from './el-GR.mjs';
import en_US from './en-US.mjs';
import es_ES from './es-ES.mjs';
import et_EE from './et-EE.mjs';
import fi_FI from './fi-FI.mjs';
import fr_FR from './fr-FR.mjs';
import he_IL from './he-IL.mjs';
import hr_HR from './hr-HR.mjs';
import hu_HU from './hu-HU.mjs';
import it_IT from './it-IT.mjs';
import ja_JP from './ja-JP.mjs';
import ko_KR from './ko-KR.mjs';
import lt_LT from './lt-LT.mjs';
import lv_LV from './lv-LV.mjs';
import nb_NO from './nb-NO.mjs';
import nl_NL from './nl-NL.mjs';
import pl_PL from './pl-PL.mjs';
import pt_BR from './pt-BR.mjs';
import pt_PT from './pt-PT.mjs';
import ro_RO from './ro-RO.mjs';
import ru_RU from './ru-RU.mjs';
import sk_SK from './sk-SK.mjs';
import sl_SI from './sl-SI.mjs';
import sr_SP from './sr-SP.mjs';
import sv_SE from './sv-SE.mjs';
import tr_TR from './tr-TR.mjs';
import uk_UA from './uk-UA.mjs';
import zh_CN from './zh-CN.mjs';
import zh_TW from './zh-TW.mjs';

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
export {LocalizedStringProvider, getLocalizationScript, dictionary, createLocalizedStringDictionary};
