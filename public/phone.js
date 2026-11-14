/* Phone field: country code picker (all countries, default +213 Algeria) + validation. */
(function () {
  var C = "DZ:213,AF:93,AL:355,AD:376,AO:244,AG:1268,AR:54,AM:374,AU:61,AT:43,AZ:994,BS:1242,BH:973,BD:880,BB:1246,BY:375,BE:32,BZ:501,BJ:229,BT:975,BO:591,BA:387,BW:267,BR:55,BN:673,BG:359,BF:226,BI:257,KH:855,CM:237,CA:1,CV:238,CF:236,TD:235,CL:56,CN:86,CO:57,KM:269,CG:242,CD:243,CR:506,CI:225,HR:385,CU:53,CY:357,CZ:420,DK:45,DJ:253,DM:1767,DO:1809,EC:593,EG:20,SV:503,GQ:240,ER:291,EE:372,SZ:268,ET:251,FJ:679,FI:358,FR:33,GA:241,GM:220,GE:995,DE:49,GH:233,GR:30,GD:1473,GT:502,GN:224,GW:245,GY:592,HT:509,HN:504,HK:852,HU:36,IS:354,IN:91,ID:62,IR:98,IQ:964,IE:353,IL:972,IT:39,JM:1876,JP:81,JO:962,KZ:7,KE:254,KI:686,XK:383,KW:965,KG:996,LA:856,LV:371,LB:961,LS:266,LR:231,LY:218,LI:423,LT:370,LU:352,MO:853,MG:261,MW:265,MY:60,MV:960,ML:223,MT:356,MH:692,MR:222,MU:230,MX:52,FM:691,MD:373,MC:377,MN:976,ME:382,MA:212,MZ:258,MM:95,NA:264,NR:674,NP:977,NL:31,NZ:64,NI:505,NE:227,NG:234,KP:850,MK:389,NO:47,OM:968,PK:92,PW:680,PS:970,PA:507,PG:675,PY:595,PE:51,PH:63,PL:48,PT:351,PR:1787,QA:974,RO:40,RU:7,RW:250,KN:1869,LC:1758,VC:1784,WS:685,SM:378,ST:239,SA:966,SN:221,RS:381,SC:248,SL:232,SG:65,SK:421,SI:386,SB:677,SO:252,ZA:27,KR:82,SS:211,ES:34,LK:94,SD:249,SR:597,SE:46,CH:41,SY:963,TW:886,TJ:992,TZ:255,TH:66,TL:670,TG:228,TO:676,TT:1868,TN:216,TR:90,TM:993,TV:688,UG:256,UA:380,AE:971,GB:44,US:1,UY:598,UZ:998,VU:678,VA:379,VE:58,VN:84,YE:967,ZM:260,ZW:263"
    .split(",").map(function (x) { var p = x.split(":"); return { iso: p[0], dial: p[1] }; });

  var $ = function (id) { return document.getElementById(id); };
  var btn = $("ccBtn"), panel = $("ccPanel"), list = $("ccList"), search = $("ccSearch"), local = $("phoneLocal");
  if (!btn || !local) return;
  var cur = C[0], dn = null, den = null, shown = [];

  function names() {
    var lang = (window.I18N && I18N.lang) || "en";
    try { dn = new Intl.DisplayNames([lang], { type: "region" }); } catch (e) { dn = null; }
    try { den = new Intl.DisplayNames(["en"], { type: "region" }); } catch (e) { den = null; }
    C.forEach(function (c) { c.name = (dn && dn.of(c.iso)) || c.iso; c.en = ((den && den.of(c.iso)) || c.iso).toLowerCase(); });
    C.sort(function (a, b) { return a.iso === "DZ" ? -1 : b.iso === "DZ" ? 1 : a.name.localeCompare(b.name, lang); });
  }
  function paint() {
    $("ccIso").textContent = cur.iso;
    $("ccDial").textContent = "+" + cur.dial;
    local.placeholder = cur.dial === "213" ? "5XXXXXXXX" : "000 000 000";
  }
  function fill(q) {
    q = (q || "").trim().toLowerCase().replace(/^\+/, "");
    shown = C.filter(function (c) { return !q || c.name.toLowerCase().indexOf(q) > -1 || c.en.indexOf(q) > -1 || c.iso.toLowerCase() === q || c.dial.indexOf(q) === 0; });
    list.innerHTML = "";
    shown.forEach(function (c) {
      var li = document.createElement("li");
      li.setAttribute("role", "option");
      li.dataset.iso = c.iso;
      if (c === cur) li.setAttribute("aria-selected", "true");
      li.innerHTML = '<span class="n"></span><b dir="ltr">+' + c.dial + "</b>";
      li.firstChild.textContent = c.name;
      list.appendChild(li);
    });
  }
  function open(v) {
    panel.classList.toggle("hide", !v);
    btn.setAttribute("aria-expanded", v ? "true" : "false");
    if (v) { search.value = ""; fill(""); setTimeout(function () { search.focus(); }, 30); }
  }
  btn.addEventListener("click", function () { open(panel.classList.contains("hide")); });
  search.addEventListener("input", function () { fill(search.value); });
  search.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); if (shown[0]) pick(shown[0]); }
    if (e.key === "Escape") { open(false); btn.focus(); }
  });
  list.addEventListener("click", function (e) {
    var li = e.target.closest("li"); if (!li) return;
    pick(C.filter(function (c) { return c.iso === li.dataset.iso; })[0]);
  });
  function pick(c) { cur = c; paint(); open(false); local.focus(); }
  document.addEventListener("click", function (e) { if (!e.target.closest("#cc")) open(false); });

  /* only digits (and spaces) in the number box */
  local.addEventListener("input", function () { local.value = local.value.replace(/[^\d\s]/g, ""); });

  /* returns {value:"+213...", ok:bool}; empty number is allowed (phone is optional) */
  window.PHONE = {
    get: function () {
      var d = local.value.replace(/\D/g, "");
      if (cur.dial === "213") d = d.replace(/^0+/, "");
      else d = d.replace(/^0+/, "");
      if (!d) return { value: "", ok: true };
      var full = "+" + cur.dial + d, ok = /^\+[1-9]\d{6,14}$/.test(full);
      if (cur.dial === "213") ok = /^\+213[567]\d{8}$/.test(full);
      return { value: full, ok: ok };
    },
    reset: function () { local.value = ""; }
  };
  addEventListener("langchange", function () { names(); paint(); fill(search.value); });
  names(); paint(); fill("");
})();
