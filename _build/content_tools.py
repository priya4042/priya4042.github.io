# -*- coding: utf-8 -*-
"""Free browser tools: tools/<slug>.html and tools/index.html. The calculators live in assets/tools.js."""
import html

def esc(s): return html.escape(s, quote=True)

def bi(en, hi):
    return f'<span data-only="en">{en}</span><span data-only="hi" lang="hi">{hi}</span>'

def field(id_, label_en, label_hi, typ="number", value="", extra="", step="any", unit=""):
    u = f'<span class="unit">{unit}</span>' if unit else ""
    return (f'<label class="tf" for="{id_}"><span class="tf-l">{bi(label_en, label_hi)}</span>'
            f'<span class="tf-in"><input id="{id_}" name="{id_}" type="{typ}" value="{esc(value)}" step="{step}" {extra}>{u}</span></label>')

TOOLS = [
    dict(slug="qr-code-maker", app="quickscan", icon="qr",
         name="QR Code Maker", name_hi="QR कोड मेकर",
         desc="Make a QR code for a link, text, Wi-Fi, UPI payment, phone or email - and download it free.",
         desc_hi="लिंक, टेक्स्ट, Wi-Fi, UPI भुगतान, फ़ोन या ईमेल के लिए QR कोड बनाएँ - और मुफ़्त डाउनलोड करें।",
         form=f"""
<div class="chips tool-chips" role="group" aria-label="QR type" data-qr-type>
  <button type="button" class="chip is-on" data-v="link">{bi('Link or text', 'लिंक या टेक्स्ट')}</button>
  <button type="button" class="chip" data-v="wifi">Wi-Fi</button>
  <button type="button" class="chip" data-v="upi">{bi('UPI payment', 'UPI भुगतान')}</button>
  <button type="button" class="chip" data-v="phone">{bi('Phone', 'फ़ोन')}</button>
  <button type="button" class="chip" data-v="email">{bi('Email', 'ईमेल')}</button>
</div>
<div data-qr-panel="link">{field('q-text', 'Link or text', 'लिंक या टेक्स्ट', 'text', 'https://priya4042.github.io/')}</div>
<div data-qr-panel="wifi" hidden>{field('q-ssid', 'Wi-Fi name', 'Wi-Fi का नाम', 'text')}{field('q-pass', 'Password', 'पासवर्ड', 'text')}
  <label class="tf"><span class="tf-l">{bi('Security', 'सुरक्षा')}</span><span class="tf-in"><select id="q-sec"><option value="WPA">WPA / WPA2</option><option value="WEP">WEP</option><option value="nopass">{'None'}</option></select></span></label></div>
<div data-qr-panel="upi" hidden>{field('q-upi', 'UPI ID', 'UPI ID', 'text', '', 'placeholder="name@bank"')}{field('q-payee', 'Name', 'नाम', 'text')}{field('q-amt', 'Amount (optional)', 'रकम (वैकल्पिक)', 'number', '', 'min="0"', '0.01', '₹')}</div>
<div data-qr-panel="phone" hidden>{field('q-phone', 'Phone number', 'फ़ोन नंबर', 'tel', '', 'placeholder="+91 98765 43210"')}</div>
<div data-qr-panel="email" hidden>{field('q-email', 'Email address', 'ईमेल पता', 'email')}{field('q-subj', 'Subject (optional)', 'विषय (वैकल्पिक)', 'text')}</div>
<label class="tf"><span class="tf-l">{bi('Colour', 'रंग')}</span><span class="tf-in"><select id="q-color"><option value="#1D1B4C">Indigo</option><option value="#000000">Black</option><option value="#12805C">Green</option><option value="#B4234A">Maroon</option></select></span></label>
""",
         result=f"""<div class="qr-out" data-qr-out aria-live="polite"></div>
<p class="tool-note" data-qr-text></p>
<div class="tool-actions"><button class="btn btn-primary" type="button" data-qr-png>{bi('Download PNG', 'PNG डाउनलोड करें')}</button><button class="btn btn-ghost" type="button" data-qr-svg>{bi('Download SVG', 'SVG डाउनलोड करें')}</button></div>""",
         how=bi("The code is made inside your browser - nothing you type is sent anywhere. Wi-Fi codes use the standard WIFI: format phones understand, and UPI codes use the upi://pay link that every UPI app opens. Always scan your code once with your own phone before printing it.",
                "कोड आपके ब्राउज़र के अंदर बनता है - आप जो लिखते हैं वह कहीं नहीं भेजा जाता। Wi-Fi कोड फ़ोन का मानक WIFI: फ़ॉर्मेट इस्तेमाल करते हैं, और UPI कोड upi://pay लिंक जिसे हर UPI ऐप खोलता है। प्रिंट करने से पहले अपना कोड एक बार अपने फ़ोन से ज़रूर स्कैन करें।"),
         note=""),
    dict(slug="emi-calculator", app="dues", icon="emi",
         name="EMI Calculator", name_hi="EMI कैलकुलेटर",
         desc="Work out the monthly EMI, total interest and a year-by-year breakdown for any loan.",
         desc_hi="किसी भी लोन की मासिक EMI, कुल ब्याज और साल-दर-साल का हिसाब निकालें।",
         form=field('e-p', 'Loan amount', 'लोन की रकम', 'number', '500000', 'min="0"', '1000', '₹')
              + field('e-r', 'Interest rate (per year)', 'ब्याज दर (सालाना)', 'number', '9.5', 'min="0" max="50"', '0.05', '%')
              + field('e-n', 'Tenure', 'अवधि', 'number', '5', 'min="1" max="40"', '1', bi('years', 'साल')),
         result=f"""<div class="res-big"><span>{bi('Monthly EMI', 'मासिक EMI')}</span><b data-o="emi">-</b></div>
<div class="res-row"><span>{bi('Total interest', 'कुल ब्याज')}</span><b data-o="interest">-</b></div>
<div class="res-row"><span>{bi('Total to pay', 'कुल भुगतान')}</span><b data-o="total">-</b></div>
<div class="split" aria-hidden="true"><i data-o="pbar"></i></div>
<p class="split-key"><span class="k1">{bi('Principal', 'मूलधन')}</span><span class="k2">{bi('Interest', 'ब्याज')}</span></p>
<div class="tbl-wrap"><table class="tool-tbl"><thead><tr><th>{bi('Year', 'साल')}</th><th>{bi('Principal paid', 'मूलधन चुकाया')}</th><th>{bi('Interest paid', 'ब्याज चुकाया')}</th><th>{bi('Balance', 'बाक़ी')}</th></tr></thead><tbody data-o="rows"></tbody></table></div>""",
         how=bi("EMI = P x r x (1+r)<sup>n</sup> / ((1+r)<sup>n</sup> - 1), where P is the loan amount, r is the monthly interest rate (yearly rate / 12 / 100) and n is the number of months. Each month's EMI first pays that month's interest; the rest reduces the loan.",
                "EMI = P x r x (1+r)<sup>n</sup> / ((1+r)<sup>n</sup> - 1), जहाँ P लोन की रकम, r मासिक ब्याज दर (सालाना दर / 12 / 100) और n महीनों की संख्या है। हर महीने की EMI पहले उस महीने का ब्याज चुकाती है; बाक़ी हिस्सा लोन घटाता है।"),
         note=bi("Banks may add processing fees, insurance or a slightly different calculation. Use this as a guide and check the final figures with your lender.",
                 "बैंक प्रोसेसिंग फ़ीस, बीमा या थोड़ा अलग हिसाब जोड़ सकते हैं। इसे अनुमान मानें और आख़िरी आँकड़े अपने लेंडर से जाँचें।")),
    dict(slug="sip-calculator", app="", site="finvest-pro", icon="sip",
         name="SIP Calculator", name_hi="SIP कैलकुलेटर",
         desc="See how a monthly investment could grow over the years at an expected rate of return.",
         desc_hi="देखें कि हर महीने का निवेश अनुमानित रिटर्न पर सालों में कैसे बढ़ सकता है।",
         form=field('s-p', 'Monthly investment', 'मासिक निवेश', 'number', '5000', 'min="0"', '100', '₹')
              + field('s-r', 'Expected return (per year)', 'अनुमानित रिटर्न (सालाना)', 'number', '12', 'min="0" max="40"', '0.1', '%')
              + field('s-n', 'Time period', 'समय', 'number', '10', 'min="1" max="50"', '1', bi('years', 'साल')),
         result=f"""<div class="res-big"><span>{bi('Estimated value', 'अनुमानित मूल्य')}</span><b data-o="fv">-</b></div>
<div class="res-row"><span>{bi('You invest', 'आप निवेश करते हैं')}</span><b data-o="inv">-</b></div>
<div class="res-row"><span>{bi('Estimated gains', 'अनुमानित फ़ायदा')}</span><b data-o="gain">-</b></div>
<div class="split" aria-hidden="true"><i data-o="pbar"></i></div>
<p class="split-key"><span class="k1">{bi('Invested', 'निवेश')}</span><span class="k2">{bi('Gains', 'फ़ायदा')}</span></p>""",
         how=bi("Future value = P x ((1+i)<sup>n</sup> - 1) / i x (1+i), where P is the monthly amount, i is the monthly return (yearly rate / 12 / 100) and n is the number of months. It assumes the same return every month, which real markets never give.",
                "भविष्य मूल्य = P x ((1+i)<sup>n</sup> - 1) / i x (1+i), जहाँ P मासिक रकम, i मासिक रिटर्न (सालाना दर / 12 / 100) और n महीनों की संख्या है। यह हर महीने एक जैसा रिटर्न मानता है, जो असली बाज़ार कभी नहीं देता।"),
         note=bi("An estimate for learning, not investment advice. Market investments carry risk and returns are not guaranteed.",
                 "सीखने के लिए अनुमान, निवेश सलाह नहीं। बाज़ार के निवेश में जोखिम होता है और रिटर्न की गारंटी नहीं है।")),
    dict(slug="committee-calculator", app="committee-book", icon="bc",
         name="Committee (BC) Calculator", name_hi="कमेटी (BC) कैलकुलेटर",
         desc="For fixed and bidding committees: what each member pays this round and what the winner takes home.",
         desc_hi="तय और बोली वाली कमेटी के लिए: इस बार हर सदस्य कितना देगा और जीतने वाले को कितना मिलेगा।",
         form=f"""<div class="chips tool-chips" role="group" aria-label="Committee type" data-bc-type>
  <button type="button" class="chip is-on" data-v="bid">{bi('Bidding', 'बोली वाली')}</button>
  <button type="button" class="chip" data-v="fixed">{bi('Fixed turn', 'तय बारी')}</button>
</div>"""
              + field('b-n', 'Members', 'सदस्य', 'number', '10', 'min="2" max="200"', '1')
              + field('b-a', 'Amount per member', 'हर सदस्य की रकम', 'number', '2000', 'min="0"', '100', '₹')
              + '<div data-bc-bid>' + field("b-bid", "Winning bid (the discount)", "जीतने वाली बोली (छूट)", "number", "3000", 'min="0"', "100", "₹") + '</div>'
              + field('b-c', "Organiser's commission", 'आयोजक का कमीशन', 'number', '2', 'min="0" max="20"', '0.5', '%'),
         result=f"""<div class="res-big"><span>{bi('Each member pays', 'हर सदस्य देगा')}</span><b data-o="pays">-</b></div>
<div class="res-row"><span>{bi('Winner takes home', 'जीतने वाले को मिलेगा')}</span><b data-o="win">-</b></div>
<div class="res-row"><span>{bi('Pool (members x amount)', 'कुल रकम (सदस्य x रकम)')}</span><b data-o="pool">-</b></div>
<div class="res-row"><span>{bi("Organiser's commission", 'आयोजक का कमीशन')}</span><b data-o="comm">-</b></div>
<div class="res-row" data-bc-bid><span>{bi('Back to each member (dividend)', 'हर सदस्य को वापस (डिविडेंड)')}</span><b data-o="div">-</b></div>
<p class="tool-warn" data-o="warn" hidden></p>""",
         how=bi("Pool = members x amount. The organiser's commission is a share of the pool. In a bidding committee, the winner gives up the bid amount: the winner takes pool - bid, and (bid - commission) is shared equally, so each member pays amount - dividend this round. In a fixed committee, everyone pays the full amount and the winner takes the pool minus the commission.",
                "कुल रकम = सदस्य x रकम। आयोजक का कमीशन कुल रकम का हिस्सा है। बोली वाली कमेटी में जीतने वाला बोली की रकम छोड़ता है: उसे कुल रकम - बोली मिलती है, और (बोली - कमीशन) सबमें बराबर बँटता है, इसलिए इस बार हर सदस्य रकम - डिविडेंड देता है। तय बारी वाली कमेटी में सब पूरी रकम देते हैं और जीतने वाले को कुल रकम में से कमीशन घटाकर मिलता है।"),
         note=bi("Groups set their own rules. If yours shares the discount differently, the numbers will differ.",
                 "हर समूह अपने नियम बनाता है। अगर आपका समूह छूट अलग तरह से बाँटता है, तो आँकड़े अलग होंगे।")),
    dict(slug="nimcet-score-calculator", app="mca-entrance-prep", icon="score",
         name="NIMCET Score Calculator", name_hi="NIMCET स्कोर कैलकुलेटर",
         desc="Enter your right and wrong answers in each section to get your NIMCET score out of 1,000.",
         desc_hi="हर सेक्शन में सही और ग़लत जवाब डालें और 1,000 में से अपना NIMCET स्कोर पाएँ।",
         form="".join(f"""<fieldset class="sec" data-sec="{k}" data-q="{q}" data-plus="{p}" data-minus="{m}">
  <legend>{bi(en, hi)} <small>{q} x {p}</small></legend>
  <div class="sec-row">{field(f'n-{k}-r', 'Right', 'सही', 'number', '', f'min="0" max="{q}" placeholder="0"', '1')}{field(f'n-{k}-w', 'Wrong', 'ग़लत', 'number', '', f'min="0" max="{q}" placeholder="0"', '1')}</div>
</fieldset>""" for k, en, hi, q, p, m in [("m", "Mathematics", "गणित", 50, 12, 3), ("r", "Reasoning", "रीज़निंग", 40, 6, 1.5),
                                          ("c", "Computer", "कंप्यूटर", 20, 6, 1.5), ("e", "English", "इंग्लिश", 10, 4, 1)]),
         result=f"""<div class="res-big"><span>{bi('Your score', 'आपका स्कोर')}</span><b data-o="score">-</b><small>/ 1000</small></div>
<div class="res-row"><span>{bi('Mathematics', 'गणित')}</span><b data-o="s-m">-</b></div>
<div class="res-row"><span>{bi('Reasoning', 'रीज़निंग')}</span><b data-o="s-r">-</b></div>
<div class="res-row"><span>{bi('Computer', 'कंप्यूटर')}</span><b data-o="s-c">-</b></div>
<div class="res-row"><span>{bi('English', 'इंग्लिश')}</span><b data-o="s-e">-</b></div>
<div class="res-row"><span>{bi('Accuracy', 'सटीकता')}</span><b data-o="acc">-</b></div>
<p class="tool-warn" data-o="warn" hidden></p>""",
         how=bi("Mathematics: 50 questions x 12 marks, Reasoning: 40 x 6, Computer: 20 x 6, English: 10 x 4 - 1,000 marks in all. Each wrong answer takes away 25% of that question's marks (3 in Maths, 1.5 in Reasoning and Computer, 1 in English). Unanswered questions score zero.",
                "गणित: 50 सवाल x 12 अंक, रीज़निंग: 40 x 6, कंप्यूटर: 20 x 6, इंग्लिश: 10 x 4 - कुल 1,000 अंक। हर ग़लत जवाब पर उस सवाल के अंकों का 25% कटता है (गणित में 3, रीज़निंग और कंप्यूटर में 1.5, इंग्लिश में 1)। छोड़े गए सवालों पर शून्य।"),
         note=bi("Based on the recent NIMCET pattern. Always check the official information brochure for your year.",
                 "हाल के NIMCET पैटर्न पर आधारित। अपने साल का आधिकारिक सूचना-पत्र ज़रूर देखें।")),
]

ICONS = {
    "qr": '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z"/><path d="M14 14h2v2h-2zM18 14h2M14 18v2M18 18h2v2"/>',
    "emi": '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 10h18M7 15h4"/>',
    "sip": '<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>',
    "bc": '<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M3 19c0-3 2.5-5 5-5s5 2 5 5M11 19c0-3 2.5-5 5-5s5 2 5 5"/>',
    "score": '<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.6 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',
}

def tool_icon(t): return f'<svg class="tool-ic" viewBox="0 0 24 24" aria-hidden="true">{ICONS[t["icon"]]}</svg>'

def tool_page(t, head, header, footer, site_url, apps):
    url = f"{site_url}tools/{t['slug']}.html"
    app = next((a for a in apps if a["slug"] == t["app"]), None)
    related = ""
    if app:
        related = f'<a class="guide-app" href="../apps/{app["slug"]}.html"><img src="../assets/apps/{app["slug"]}.png" alt="" width="56" height="56"><span><b>{esc(app["short"])}</b>{esc(app["what"])}</span></a>'
    elif t.get("site"):
        related = '<a class="guide-app" href="../sites/finvest-pro.html"><span class="tool-ic-wrap">' + tool_icon(t) + '</span><span><b>Finvest Pro</b>Check whether a stock is undervalued using 9 valuation models.</span></a>'
    others = "".join(f'<a class="tool-card" href="{o["slug"]}.html">{tool_icon(o)}<span><b>{bi(o["name"], o["name_hi"])}</b><small>{bi(esc(o["desc"]), o["desc_hi"])}</small></span></a>'
                     for o in TOOLS if o["slug"] != t["slug"])
    note = f'<p class="tool-disclaimer">{t["note"]}</p>' if t["note"] else ""
    return f"""{head(t['name'] + ' - free online tool - Priya Tech Labs', t['desc'], url)}
{header("../")}
<main id="main" class="app-page tool-page">
  <section class="tool-hero">
    <p class="crumbs"><a href="index.html" data-i18n="nav.tools">Free tools</a></p>
    <h1>{bi(t['name'], t['name_hi'])}</h1>
    <p class="ap-what">{bi(esc(t['desc']), t['desc_hi'])}</p>
  </section>
  <section class="tool-box" data-tool="{t['slug']}">
    <form class="tool-form" onsubmit="return false">{t['form']}</form>
    <div class="tool-result">{t['result']}</div>
  </section>
  {note}
  <section class="tool-how"><h2 data-i18n="tool.how">How it's calculated</h2><p>{t['how']}</p>{related}</section>
  {__import__("explore").explore("../", t["app"], "tool", t["slug"], apps) if t.get("app") else ""}
  <section class="ap-more"><h2 data-i18n="tool.more">More free tools</h2><div class="tool-grid">{others}</div></section>
</main>
<script src="../assets/vendor/qrcode.min.js" defer></script>
<script src="../assets/tools.js" defer></script>
{footer("../")}"""

def tools_index(head, header, footer, site_url):
    url = f"{site_url}tools/"
    cards = "".join(f'<a class="tool-card" href="{o["slug"]}.html">{tool_icon(o)}<span><b>{bi(o["name"], o["name_hi"])}</b><small>{bi(esc(o["desc"]), o["desc_hi"])}</small></span></a>' for o in TOOLS)
    return f"""{head('Free online tools - Priya Tech Labs', 'Free QR code maker, EMI, SIP, committee (BC) and NIMCET score calculators that work in your browser.', url)}
{header("../")}
<main id="main" class="guide">
  <section class="press-hero">
    <h1 data-i18n="tools.h">Free tools</h1>
    <p data-i18n="tools.p">Quick calculators and makers that work right in your browser. Nothing you type leaves your device.</p>
  </section>
  <div class="tool-grid tool-grid-big">{cards}</div>
  <div style="height:80px"></div>
</main>
{footer("../")}"""

def home_cards():
    return "".join(f'<a class="tool-card" href="tools/{o["slug"]}.html">{tool_icon(o)}<span><b>{bi(o["name"], o["name_hi"])}</b><small>{bi(esc(o["desc"]), o["desc_hi"])}</small></span></a>' for o in TOOLS)
