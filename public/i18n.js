/* English / Arabic switch. English text lives in the HTML; this file holds the Arabic.
   data-i = text, data-ih = html, data-ip = placeholder + aria-label, data-ia-desc = card description */
(function () {
  var AR = {
    title: "OneCode+ – وكالة تطوير مواقع الويب",
    nav_home: "الرئيسية", nav_work: "أعمالنا", nav_process: "آلية العمل", nav_contact: "تواصل معنا",
    nav_start: "ابدأ مشروعك",
    eyebrow: "تصميم الويب — التطوير — تطبيقات الجوال",
    h1: '<span class="hl">مواقع</span><span class="hl">ويب <em class="acc">تُلهم</em></span>',
    hsub: "نصمّم ونبني مواقع ويب حديثة تجمع بين التصميم النظيف والسرعة والتقنية الذكية. من فكرتك الأولى حتى يوم الإطلاق، نتولى كل شيء لتتفرغ أنت لتنمية عملك.",
    tag1: "تصميم متجاوب", tag2: "تحميل سريع", tag3: "جاهز لمحركات البحث", tag4: "آمن وموثوق", tag5: "سهل الإدارة",
    btn_work: "استكشف أعمالنا", btn_quote: "احصل على عرض سعر مجاني",
    vlist: "عصري<br>سريع<br>آمن<br>قابل للتوسع",
    work_title: "أعمالنا", work_sub: "مواقع نصمّمها ونبنيها، من الفكرة الأولى حتى يوم الإطلاق.",
    work1: "متجر ملابس إلكتروني للرجال والنساء والأطفال، مع سهولة التبديل والدفع عند الاستلام.",
    work2: "موقع أعمال لمطوّر ويب مستقل، بالعربية والفرنسية: مواقع، تصميم واجهات، تصميم جرافيك ومونتاج فيديو.",
    work3: "موقع لنشاط تدريب لياقة بدنية عبر الإنترنت، مع برامج التدريب والأسعار وحجز استشارة مجانية.",
    wline: "تصميم المواقع • تطوير المواقع • التجارة الإلكترونية • تطبيقات الجوال • لوحات التحكم",
    proc_title: "كيف نعمل",
    s1h: "1 – الاستكشاف", s1p: "نتعرّف على أهدافك وعملائك وميزانيتك.",
    s2h: "2 – التصميم", s2p: "تراجع نماذج واضحة قبل كتابة أي كود.",
    s3h: "3 – البناء", s3p: "نطوّر ونختبر ونعرض لك التقدّم كل أسبوع.",
    s4h: "4 – الإطلاق", s4p: "ننشر الموقع وندعمك بعد ذلك.",
    built_with: "مبني بأحدث التقنيات",
    talk: '<span class="grad">تواصل</span> معنا', talk_sub: "تواصل معنا مباشرة أو تابع أعمالنا",
    order_title: "اطلب موقعك",
    ph_name: "الاسم الكامل *", ph_email: "البريد الإلكتروني *", ph_company: "الشركة / النشاط التجاري",
    ph_phone: "رقم الهاتف", ph_country: "ابحث عن دولة", cc_label: "رمز الدولة",
    send: "إرسال طلبي",
    f_about: "نصمّم ونبني مواقع ويب حديثة تجمع بين التصميم النظيف والسرعة والتقنية الذكية.",
    f_services: "الخدمات", f_explore: "استكشف",
    sv1: "تصميم المواقع", sv2: "تطوير المواقع", sv3: "التجارة الإلكترونية", sv4: "تطبيقات الجوال", sv5: "لوحات التحكم",
    sv6: "تحسين محركات البحث", sv7: "الهوية البصرية", sv8: "الدعم",
    copy: "جميع الحقوق محفوظة © 2026 OneCode+",
    lang_btn: "English", lang_short: "EN",
    m_name: "الرجاء إدخال اسمك الكامل (حروف فقط، من 2 إلى 80 حرفًا).",
    m_email: "الرجاء إدخال بريد إلكتروني صحيح.",
    m_phone: "رقم الهاتف غير صحيح لهذه الدولة.",
    m_company: "اسم الشركة غير صالح (حروف وأرقام فقط، حتى 80 حرفًا).",
    m_sending: "جارٍ الإرسال...",
    m_ok: "شكرًا لك! تم إرسال طلبك وسنتواصل معك قريبًا.",
    m_rate: "محاولات كثيرة. حاول مرة أخرى لاحقًا.",
    m_dup: "لقد استلمنا طلبك بالفعل.",
    m_fast: "الرجاء المحاولة مرة أخرى.",
    m_err: "حدث خطأ ما. الرجاء المحاولة مرة أخرى.",
    m_net: "خطأ في الشبكة. الرجاء المحاولة مرة أخرى.",
    m_discord: "تم نسخ اسم مستخدم ديسكورد: "
  };
  var EN = {}, lang = "en";
  try { lang = localStorage.getItem("lang") === "ar" ? "ar" : "en"; } catch (e) {}

  function each(attr, fn) {
    document.querySelectorAll("[" + attr + "]").forEach(function (el) { fn(el, el.getAttribute(attr)); });
  }
  /* remember the English text once */
  EN.title = document.title;
  each("data-i", function (el, k) { EN[k] = el.textContent; });
  each("data-ih", function (el, k) { EN[k] = el.innerHTML; });
  each("data-ip", function (el, k) { EN[k] = el.getAttribute("placeholder") || el.getAttribute("aria-label"); });
  each("data-ia-desc", function (el, k) { EN[k] = el.getAttribute("data-desc"); });
  EN.lang_btn = "العربية"; EN.lang_short = "AR";
  EN.m_name = "Please enter your full name (letters only, 2 to 80 characters).";
  EN.m_email = "Please enter a valid email address.";
  EN.m_phone = "This phone number is not valid for the selected country.";
  EN.m_company = "Company name is not valid (letters and numbers only, up to 80 characters).";
  EN.m_sending = "Sending...";
  EN.m_ok = "Thank you! Your order was sent. We will contact you soon.";
  EN.m_rate = "Too many requests. Please try again later.";
  EN.m_dup = "We already received your order.";
  EN.m_fast = "Please try again.";
  EN.m_err = "Something went wrong. Please try again.";
  EN.m_net = "Network error. Please try again.";
  EN.m_discord = "Discord username copied: ";
  EN.cc_label = "Country code";
  EN.items = ["Web design", "Web development", "E-commerce", "Mobile apps", "Dashboards", "SEO", "Branding", "Support"];
  AR.items = [AR.sv1, AR.sv2, AR.sv3, AR.sv4, AR.sv5, AR.sv6, AR.sv7, AR.sv8];

  function t(k) { return (lang === "ar" ? AR[k] : EN[k]); }

  function apply(first) {
    var ar = lang === "ar", root = document.documentElement;
    root.lang = lang; root.dir = ar ? "rtl" : "ltr";
    document.title = t("title");
    each("data-i", function (el, k) { el.textContent = t(k); });
    each("data-ih", function (el, k) { el.innerHTML = t(k); });
    each("data-ip", function (el, k) {
      if (el.hasAttribute("placeholder")) el.setAttribute("placeholder", t(k));
      el.setAttribute("aria-label", t(k));
    });
    each("data-ia-desc", function (el, k) { el.setAttribute("data-desc", t(k)); });
    var lb = document.getElementById("ccBtn"); if (lb) lb.setAttribute("aria-label", t("cc_label"));
    document.querySelectorAll(".langbtn").forEach(function (b) {
      b.querySelector(".lb-l").textContent = t("lang_btn");
      b.querySelector(".lb-s").textContent = t("lang_short");
      b.setAttribute("aria-label", ar ? "Switch to English" : "التبديل إلى العربية");
    });
    if (!first) {
      if (window.splitLine) document.querySelectorAll("#h .hl").forEach(window.splitLine);
    }
    dispatchEvent(new Event("langchange"));
  }

  window.I18N = {
    get lang() { return lang; },
    t: t,
    set: function (l) {
      if (l === lang) return;
      var page = document.body;
      page.style.transition = "opacity .22s ease"; page.style.opacity = "0";
      setTimeout(function () {
        lang = l;
        try { localStorage.setItem("lang", l); } catch (e) {}
        apply(false);
        scrollTo(0, 0);
        page.style.opacity = "1";
        setTimeout(function () { page.style.transition = ""; page.style.opacity = ""; }, 260);
      }, 230);
    }
  };

  apply(true);
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".langbtn");
    if (b) I18N.set(lang === "ar" ? "en" : "ar");
  });
})();
