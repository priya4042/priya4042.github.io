// English is whatever is in the HTML; this file holds the Hindi and swaps it in.
(function () {
  var HI = {
    "skip": "सीधे सामग्री पर जाएँ",
    "nav.apps": "ऐप्स", "nav.web": "वेबसाइटें", "nav.lab": "लैब में", "nav.about": "मेरे बारे में", "nav.work": "साथ काम करें",
    "hero.h1": "छोटे ऐप्स, जो रोज़ की ज़िंदगी थोड़ी आसान बनाते हैं।",
    "hero.lede": "Priya Tech Labs, प्रिया कुमारी का एक स्वतंत्र स्टूडियो है। मैं पैसे, पढ़ाई और रोज़मर्रा के कामों के लिए Android ऐप्स और वेबसाइटें बनाती हूँ - ज़्यादातर अंग्रेज़ी और हिंदी दोनों में, और ज़्यादातर बिना इंटरनेट के भी चलते हैं।",
    "hero.cta1": "ऐप्स देखें", "hero.cta2": "QuickScan पहले आज़माएँ",
    "phone.tap": "किसी भी ऐप पर टैप करें",
    "apps.h": "Android ऐप्स",
    "apps.p": "एक ऐप Google Play पर टेस्टिंग में है और बाकी तैयार हैं, जल्द आ रहे हैं। पहले चाहिए? बताइए, मैं आपको टेस्टर बना दूँगी।",
    "filter.all": "सभी ऐप्स", "filter.money": "पैसा", "filter.study": "पढ़ाई", "filter.tools": "टूल्स",
    "cat.money": "पैसा", "cat.study": "पढ़ाई", "cat.utility": "उपयोगी", "cat.tools": "टूल्स",
    "badge.testing": "Google Play पर टेस्टिंग में", "badge.soon": "Google Play पर जल्द", "badge.live": "Google Play पर उपलब्ध",
    "cta.tester": "टेस्टर बनें", "cta.notify": "लॉन्च होने पर बताएँ", "cta.details": "पूरी जानकारी", "cta.play": "Google Play से पाएँ",
    "link.privacy": "प्राइवेसी पॉलिसी", "link.code": "कोड देखें",
    "form.gmail": "आपका Gmail पता", "form.email": "आपका ईमेल पता",
    "tester.hint": "Google Play नए ऐप्स के लिए कम से कम 12 लोगों के साथ 14 दिन का टेस्ट माँगता है। अपना Gmail भेजिए, आपको इनवाइट लिंक मिल जाएगा।",
    "app.quickscan": "कोई भी QR कोड या बारकोड स्कैन करें या बनाएँ - तेज़ और बिना इंटरनेट।",
    "app.spendly": "कमाई, ख़र्च, बजट और बचत के लिए एक निजी, ऑफ़लाइन मनी मैनेजर।",
    "app.committee-book": "अपनी कमेटी, BC या चिट चलाएँ: किसने पैसे दिए, किसकी बारी है और हाथ में कितना कैश है।",
    "app.dues": "बिल, रिचार्ज, EMI, सब्सक्रिप्शन या वारंटी की तारीख़ फिर कभी न भूलें।",
    "app.mca-entrance-prep": "NIMCET और 10 अन्य MCA प्रवेश परीक्षाओं की पूरी तैयारी, बिना विज्ञापन के।",
    "app.daily-english": "अंग्रेज़ी बोलना सीखें - ऐसे कोच के साथ जो सुनकर आपका उच्चारण जाँचता है।",
    "app.dotnet-prep": "लगभग 1,300 .NET, C#, SQL, DSA और सिस्टम डिज़ाइन इंटरव्यू सवाल-जवाब, ऑफ़लाइन।",
    "app.reelcut": "अपने लंबे वीडियो से Shorts, Reels और TikTok बनाएँ - पूरी तरह आपके फ़ोन पर।",
    "web.h": "वेब पर लाइव", "web.p": "अभी मुफ़्त में इस्तेमाल करें - किसी भी ब्राउज़र में, फ़ोन या लैपटॉप पर।",
    "visit": "साइट खोलें",
    "site.daily-rashifal": "सभी 12 राशियों का रोज़ का मुफ़्त राशिफल, अंग्रेज़ी और हिंदी में: प्रेम, करियर, सेहत, पैसा और आपका शुभ अंक।",
    "site.mca-prep-hub": "MCA CET और NIMCET के लिए मुफ़्त स्टडी साइट - लगभग 690 प्रैक्टिस सवाल और Test Me क्विज़।",
    "site.finvest-pro": "9 वैल्यूएशन मॉडल से देखें कि कोई शेयर सस्ता है या नहीं - भारतीय और विदेशी शेयरों के लिए।",
    "site.stackprep": "फ़ुल-स्टैक .NET और Angular इंटरव्यू के लिए मुफ़्त, ऑफ़लाइन स्टडी साथी - हर दिन पाँच नए सवाल।",
    "site.anmielove": "एक प्रॉम्प्ट लिखें और ऐनिमे, Ghibli, K-ड्रामा या कार्टून स्टाइल में एनिमेटेड वीडियो पाएँ।",
    "site.wellness-bloom": "महिलाओं की सेहत पर ब्लॉग - बाल, थायरॉइड, पीरियड्स, पाचन और वज़न घटाने पर काम की गाइड।",
    "site.librisphere": "छोटी लाइब्रेरी के लिए मैनेजमेंट: किताबें, सदस्य, इश्यू-रिटर्न और देरी के अलर्ट।",
    "lab.h": "लैब में", "lab.p": "आगे आने वाले प्रोजेक्ट, और मेरे अपने काम के लिए बनाए टूल्स। अभी पब्लिक नहीं।",
    "tag.dev": "बन रहा है", "tag.own": "मेरा अपना टूल",
    "updates.h": "नया क्या है",
    "about.h": "नमस्ते, मैं प्रिया हूँ।",
    "about.p1": "मैं एक सॉफ़्टवेयर डेवलपर हूँ। रोज़ के काम में .NET और Angular पर बिज़नेस सॉफ़्टवेयर बनाती हूँ, और Priya Tech Labs में Flutter से ऐसे ऐप्स बनाती हूँ जिनकी मुझे और मेरे आसपास के लोगों को ज़रूरत थी।",
    "about.p2": "मेरे ऐप्स में तीन बातें हमेशा होती हैं: आपका डेटा आपके फ़ोन पर रहता है, जहाँ हो सके बिना इंटरनेट चलते हैं, और हिंदी में भी काम करते हैं।",
    "about.skills": "मैं इनके साथ काम करती हूँ",
    "notify.h": "लॉन्च पर सबसे पहले जानें",
    "notify.p": "जो ऐप्स चाहिए उन पर टिक करें। लॉन्च होने पर बस एक ईमेल आएगा, और कुछ नहीं।",
    "notify.btn": "मुझे बताएँ",
    "quotes.h": "लोग क्या कहते हैं",
    "contact.h": "ऐप या वेबसाइट बनवानी है?",
    "contact.p": "मैं Flutter में Android ऐप्स, तेज़ वेबसाइटें और .NET व Angular में बिज़नेस वेब ऐप्स बनाती हूँ। बताइए आपको क्या चाहिए।",
    "svc.app": "Android ऐप्स", "svc.app.p": "आइडिया से Google Play तक - स्टोर लिस्टिंग और प्राइवेसी पॉलिसी समेत।",
    "svc.web": "वेबसाइटें", "svc.web.p": "तेज़, मोबाइल-फ़र्स्ट साइटें - अंग्रेज़ी, हिंदी या दोनों में।",
    "svc.wapp": "वेब ऐप्स", "svc.wapp.p": "डैशबोर्ड, एडमिन पैनल और आपकी टीम के लिए टूल्स।",
    "cf.name": "आपका नाम", "cf.email": "ईमेल", "cf.need": "क्या चाहिए", "cf.msg": "अपने प्रोजेक्ट के बारे में थोड़ा बताइए", "cf.send": "भेजें",
    "cf.o1": "Android ऐप", "cf.o2": "वेबसाइट", "cf.o3": "वेब ऐप", "cf.o4": "कुछ और",
    "page.screens": "स्क्रीन", "page.about": "यह क्या करता है", "page.features": "फ़ीचर्स", "page.faq": "लोग अक्सर पूछते हैं", "page.more": "और ऐप्स",
    "meta.android": "Android", "meta.offline": "ऑफ़लाइन चलता है", "meta.ads": "मुफ़्त, विज्ञापन के साथ", "meta.noads": "मुफ़्त, बिना विज्ञापन",
    "nf.h": "यह पेज नहीं मिला", "nf.p": "लिंक पुराना हो सकता है। नीचे से ऐप्स या होम पेज पर जाएँ।", "nf.home": "होम पेज",
    "msg.sending": "भेजा जा रहा है...", "msg.sent": "धन्यवाद! मिल गया।",
    "msg.mail": "आपका ईमेल ऐप खुल रहा है - वहाँ से भेज दें।", "msg.fail": "भेजा नहीं जा सका। कृपया सीधे priyatechlabs9@gmail.com पर लिखें।",
    "msg.testers": "{n} / {m} टेस्टर जुड़ चुके हैं",
    "msg.pick": "कम से कम एक ऐप चुनें।",
    "upd.ready": "तैयार",
    "upd.site.h": "यह वेबसाइट लाइव है", "upd.site.p": "सारे ऐप्स और साइटें एक जगह - हर ऐप का अपना पेज और प्राइवेसी पॉलिसी।",
    "upd.qs.p": "Google Play पर क्लोज़्ड टेस्टिंग में। टेस्टर चाहिए - पब्लिक होने से पहले 14 दिन तक 12 लोग चाहिए।",
    "upd.mca.p": "Android के लिए तैयार: NIMCET और 10 और MCA परीक्षाएँ, 48 अनुमानित पेपर, बिना विज्ञापन।",
    "upd.rc.p": "अब सारी एडिटिंग आपके फ़ोन पर होती है। न सर्वर, न अपलोड, न इंटरनेट की अनुमति।",
    "upd.cb.p": "रिलीज़ बिल्ड साइन हो चुका है, Google Play लिस्टिंग का इंतज़ार है।",
  };

  var KEY = "ptl-lang";
  function get() { try { return localStorage.getItem(KEY) || "en"; } catch (e) { return "en"; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  window.PTL_LANG = get();
  window.t = function (key, en) { return window.PTL_LANG === "hi" && HI[key] ? HI[key] : en; };

  function apply(lang) {
    window.PTL_LANG = lang;
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      if (el.dataset.en === undefined) el.dataset.en = el.innerHTML;
      var k = el.dataset.i18n;
      el.innerHTML = lang === "hi" && HI[k] ? HI[k] : el.dataset.en;
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      if (el.dataset.enPh === undefined) el.dataset.enPh = el.placeholder;
      var k = el.dataset.i18nPh;
      el.placeholder = lang === "hi" && HI[k] ? HI[k] : el.dataset.enPh;
    });
    document.querySelectorAll("[data-lang-toggle]").forEach(function (b) {
      b.textContent = lang === "hi" ? "English" : "हिंदी";
      b.setAttribute("aria-label", lang === "hi" ? "Switch to English" : "हिंदी में देखें");
    });
    document.dispatchEvent(new CustomEvent("ptl:lang"));
  }

  document.addEventListener("DOMContentLoaded", function () {
    apply(window.PTL_LANG);
    document.querySelectorAll("[data-lang-toggle]").forEach(function (b) {
      b.addEventListener("click", function () {
        var next = window.PTL_LANG === "hi" ? "en" : "hi";
        set(next); apply(next);
      });
    });
  });
})();
