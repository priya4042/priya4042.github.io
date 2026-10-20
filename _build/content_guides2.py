# -*- coding: utf-8 -*-
"""Third batch of guides (appended to content.GUIDES by build.py)."""

GUIDES3 = [
    dict(slug="save-money-every-month", date="2026-10-20", mins=4, app="spendly", cat="Money",
         title="10 simple ways to save money every month",
         desc="No extreme budgeting - ten small habits that add up, starting with knowing where your money actually goes.",
         body="""
<p>Most people don't overspend on one big thing. Money leaks out in small amounts nobody notices. These ten habits plug the leaks without making life miserable.</p>
<ol class="steps">
  <li><strong>Track every expense for one month.</strong> Not to judge yourself - just to see. Most people are surprised by one category, usually food delivery or small online orders.</li>
  <li><strong>Pay yourself first.</strong> On payday, move a fixed amount to savings before you spend anything. What's left is what you can spend.</li>
  <li><strong>Give every rupee a job.</strong> Split your income into needs, wants and savings at the start of the month, instead of seeing what's left at the end.</li>
  <li><strong>Cancel one subscription.</strong> Look at your OTT, music, cloud and app subscriptions. Keep the ones you used this month.</li>
  <li><strong>Wait 48 hours before non-essential buys.</strong> Put it in the cart and come back in two days. Half the time you won't want it.</li>
  <li><strong>Cook one more meal a week at home.</strong> Swapping even one delivery order a week saves a noticeable amount over a year.</li>
  <li><strong>Never miss a due date.</strong> Late fees and interest on credit card bills are pure loss. Set reminders a few days early.</li>
  <li><strong>Round up your savings.</strong> Every time you spend, put the change - up to the next 10 or 100 - aside. It feels like nothing and adds up.</li>
  <li><strong>Keep an emergency fund.</strong> Three to six months of expenses in a separate account stops one bad month from turning into debt.</li>
  <li><strong>Check in every Sunday.</strong> Five minutes: what did I spend this week, and is anything due next week?</li>
</ol>
<h2>Make tracking effortless</h2>
<p><a href="../apps/spendly.html">Spendly</a> was made for habits 1, 3, 8 and 10: quick entry, budgets, savings goals with a round-up jar, and charts that show where your money went. It's private and offline - your money data never leaves your phone.</p>
"""),
    dict(slug="cuet-pg-mca-prep", date="2026-10-20", mins=4, app="mca-entrance-prep", cat="Study",
         title="CUET PG MCA (SCQP09): how to prepare",
         desc="What the CUET PG MCA paper looks like, how it differs from NIMCET, and how to prepare for both at once.",
         body="""
<p class="note">Always check the official CUET PG information bulletin from the National Testing Agency for the current year - the pattern and dates can change.</p>
<h2>What the paper looks like</h2>
<p>For MCA, CUET PG uses the paper code <strong>SCQP09</strong>: 75 multiple-choice questions in 90 minutes, for 300 marks - 4 marks for each correct answer. Wrong answers carry negative marking, so don't guess blindly. Many universities that admit to MCA through CUET PG use this paper, which is why it's worth taking even if NIMCET is your main target.</p>
<h2>How it differs from NIMCET</h2>
<ul class="check">
  <li><strong>Less time per question.</strong> 75 questions in 90 minutes is a little over a minute each. Speed matters more.</li>
  <li><strong>Every question is worth the same.</strong> In NIMCET maths questions are worth double; in CUET PG an easy reasoning question earns as much as a hard maths one - so do the quick ones first.</li>
  <li><strong>Mathematics is still the core.</strong> The same school-level and early-college maths topics come up, along with reasoning, computer awareness and English.</li>
</ul>
<h2>Preparing for both together</h2>
<ul class="check">
  <li>Study the maths syllabus once - it serves both exams.</li>
  <li>From the third month, take mocks of both kinds: NIMCET for depth, CUET PG for speed.</li>
  <li>In CUET PG mocks, practise a two-pass approach: answer everything quick on the first pass, then return to the long ones.</li>
  <li>Keep one mistake notebook for both exams.</li>
</ul>
<h2>Plan and practise in one place</h2>
<p><a href="../apps/mca-entrance-prep.html">MCA Entrance Prep</a> has a separate profile for CUET PG MCA, with its own pattern, timing and mocks, alongside NIMCET and nine other MCA exams. No ads.</p>
"""),
    dict(slug="upi-qr-code-scams", date="2026-10-20", mins=3, app="quickscan", cat="Apps",
         title="UPI QR code scams: how to stay safe",
         desc="The one rule that stops most QR scams, the tricks scammers use, and what to do if money leaves your account.",
         body="""
<h2>The one rule</h2>
<p><strong>You never need to scan a QR code or enter your UPI PIN to receive money.</strong> Scanning a code and entering your PIN always sends money out of your account. If someone - a "buyer", a "bank official", a "delivery agent" - asks you to scan a code to receive a payment, it's a scam.</p>
<h2>Tricks to watch for</h2>
<ul class="check">
  <li><strong>The "refund" or "cashback" code.</strong> A message says scan this to get your refund. Refunds come to you; you don't scan anything.</li>
  <li><strong>The overpaying buyer.</strong> Someone buying your old phone or sofa online says they paid too much and sends a code to "return" the extra.</li>
  <li><strong>The swapped shop sticker.</strong> A scammer sticks their own QR code over a shop's code. Before paying, check the name the UPI app shows matches the shop.</li>
  <li><strong>Urgency.</strong> "Your account will be blocked in 10 minutes." Real banks don't hurry you on a call.</li>
</ul>
<h2>Before you pay</h2>
<ul class="check">
  <li>Check the payee name shown in your UPI app before entering the PIN.</li>
  <li>Check the amount - scam codes often have an amount already filled in.</li>
  <li>Never share your UPI PIN, OTP or screen with anyone.</li>
</ul>
<h2>If money has already gone</h2>
<p>Act fast. Call the national cyber crime helpline <strong>1930</strong> or report at <strong>cybercrime.gov.in</strong>, and tell your bank and UPI app straight away - the sooner it's reported, the better the chance of stopping the money.</p>
<h2>See what a code does before you act</h2>
<p><a href="../apps/quickscan.html">QuickScan</a> shows exactly what's inside a code before anything happens - for a UPI code, who it pays and how much - so you can check before opening your payment app.</p>
"""),
    dict(slug="android-app-permissions", date="2026-10-20", mins=3, app="reelcut", cat="Apps",
         title="Android app permissions, explained simply",
         desc="What each common permission lets an app do, which ones deserve a second look, and how to check what your apps can access.",
         body="""
<p>When an app asks for a permission, it's asking for a key to something on your phone. Most requests are reasonable. A few deserve a pause.</p>
<h2>The common ones</h2>
<ul class="check">
  <li><strong>Camera</strong> - takes photos or scans codes. Expected in a scanner or a camera app; odd in a calculator.</li>
  <li><strong>Microphone</strong> - hears you. Fine for voice notes or pronunciation practice; ask why if the app has nothing to do with sound.</li>
  <li><strong>Photos and videos</strong> - reads your gallery. Newer Android lets you share only selected photos instead of everything.</li>
  <li><strong>Location</strong> - knows where you are. "Only while using the app" is enough for almost every app.</li>
  <li><strong>Contacts, SMS and call logs</strong> - very personal. Be careful with any app that wants these without an obvious reason.</li>
  <li><strong>Notifications</strong> - sends reminders. Harmless, but you can turn them off any time.</li>
  <li><strong>Internet</strong> - granted automatically. It's why an app can send data anywhere, which is why apps that work without it are so private.</li>
</ul>
<h2>Check your phone in two minutes</h2>
<p>Open <strong>Settings &gt; Security &amp; privacy &gt; Privacy &gt; Permission manager</strong> (the path differs a little by phone). Pick a permission like Location or Microphone and see which apps have it. Remove it from anything that doesn't need it.</p>
<h2>Read the data-safety section</h2>
<p>Every app on Google Play has a "Data safety" section that says what it collects and shares. It takes 30 seconds to read before you install.</p>
<h2>How my apps handle it</h2>
<p>My apps ask only for what a feature needs, and only when you use that feature. <a href="../apps/reelcut.html">ReelCut</a> doesn't even have internet permission, so your videos physically can't leave your phone.</p>
"""),
    dict(slug="is-this-stock-undervalued", date="2026-10-20", mins=5, app="", site="finvest-pro", cat="Money",
         title="How to tell if a stock might be undervalued: a beginner's guide",
         desc="What P/E, P/B and a discounted cash flow tell you, why no single number is enough, and how to compare a company with itself and its peers.",
         body="""
<p class="note">This guide is for learning, not investment advice. Do your own research, or speak to a SEBI-registered investment adviser, before you invest.</p>
<h2>Price is not value</h2>
<p>A share price tells you what people are paying today. Value is what the business is worth based on what it earns and owns. A stock is "undervalued" when the price is below a sensible estimate of value - and every estimate rests on assumptions.</p>
<h2>Three common measures</h2>
<ul class="check">
  <li><strong>P/E (price to earnings):</strong> share price divided by earnings per share. A P/E of 20 means you pay 20 rupees for every rupee the company earns in a year. Lower can mean cheaper - or a business people expect to shrink.</li>
  <li><strong>P/B (price to book):</strong> share price divided by book value (what the company owns minus what it owes) per share. Useful for banks and asset-heavy businesses; less so for software companies.</li>
  <li><strong>DCF (discounted cash flow):</strong> estimates the cash the business will produce in future years and converts it to today's money. Powerful, but small changes in the assumptions change the answer a lot.</li>
</ul>
<h2>Compare, don't judge in isolation</h2>
<ul class="check">
  <li><strong>Against itself:</strong> is today's P/E high or low compared with the company's own last five years?</li>
  <li><strong>Against peers:</strong> compare with similar companies in the same industry, not the whole market.</li>
  <li><strong>Against quality:</strong> a cheap stock with falling profits and rising debt is often cheap for a reason.</li>
</ul>
<h2>Use more than one model</h2>
<p>When several different methods point to a value above the current price, that's more meaningful than any single number. When they disagree, find out why before doing anything.</p>
<h2>Try it on real companies</h2>
<p><a href="https://priya4042.github.io/finvest-pro/">Finvest Pro</a>, my free web app, runs 9 valuation models side by side for Indian and global stocks, with a screener and comparison - for learning how valuation works.</p>
"""),
]

CATS3 = {}
