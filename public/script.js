var RM = matchMedia("(prefers-reduced-motion:reduce)").matches;
var T = function(k){ return window.I18N ? I18N.t(k) : k; };
function buildTicker(){
  var items = window.I18N ? I18N.t("items") : [];
  document.getElementById("track").innerHTML = items.concat(items).map(function(t){return "<span>"+t+"</span>"}).join("");
}
buildTicker();
addEventListener("langchange", buildTicker);

/* headline: split into words (keeps the light-blue word) */
function splitLine(el){
  var out = "";
  el.childNodes.forEach(function(n){
    if(n.nodeType === 3){
      n.textContent.split(/\s+/).filter(Boolean).forEach(function(w){ out += '<span class="w"><span class="wi">' + w + '</span></span> '; });
    } else if(n.nodeName === "EM"){
      out += '<span class="w"><span class="wi acc">' + n.textContent + '</span></span> ';
    }
  });
  el.innerHTML = out;
}
document.querySelectorAll("#h .hl").forEach(splitLine);

/* ===== menu highlight while scrolling ===== */
var secIds = ["top","services","process","contact"];
var secEls = secIds.map(function(id){ return document.getElementById(id); });
var menuLinks = document.querySelectorAll(".mpill a, .tabbar a");
function spy(){
  var y = scrollY + innerHeight * .4, idx = 0;
  secEls.forEach(function(s, i){ if(s.offsetTop <= y) idx = i; });
  menuLinks.forEach(function(a, i){ a.classList.toggle("on", i % 4 === idx); });
}
addEventListener("scroll", spy, {passive:true});
spy();

/* My Work and Process links: show the section on the full screen */
["services","process"].forEach(function(id){
  document.querySelectorAll('a[href="#'+id+'"]').forEach(function(a){
    a.addEventListener("click", function(e){
      e.preventDefault();
      scrollTo({top: document.getElementById(id).offsetTop, behavior:"smooth"});
    });
  });
});

/* Discord: copy the username (Discord has no profile link by username) */
var dl = document.getElementById("discordLink");
if(dl) dl.addEventListener("click", function(){
  var name = "djimyy_16";
  try{ navigator.clipboard.writeText(name); }catch(e){}
  var t = document.createElement("div"); t.className = "copied"; t.textContent = T("m_discord") + name;
  document.body.appendChild(t); setTimeout(function(){ t.remove(); }, 2600);
});

/* order form: checked here first, and checked again on the server */
var formShownAt = Date.now();
var NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M}\s'.\-]{1,79}$/u;
var EMAIL_RE = /^[A-Za-z0-9._%+\-]{1,64}@[A-Za-z0-9](?:[A-Za-z0-9\-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9\-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,24}$/;
var COMPANY_RE = /^[\p{L}\p{M}\p{N}\s&.,'\u2019\-\/()+!]{1,80}$/u;
var fixSp = function(v){ return String(v).replace(/[\u0000-\u001f\u007f<>]/g, " ").replace(/\s+/g, " ").trim(); };
document.getElementById("orderForm").addEventListener("submit", function(e){
  e.preventDefault();
  var form = e.target, ok = document.getElementById("ok"), btn = document.getElementById("send");
  var ph = window.PHONE ? PHONE.get() : {value:"", ok:true};
  var data = {
    full_name: fixSp(form.full_name.value),
    email: fixSp(form.email.value).toLowerCase(),
    phone: ph.value,
    company: fixSp(form.company.value),
    website: form.website.value,   /* hidden trap field for bots, must stay empty */
    ts: formShownAt
  };
  var bad = !NAME_RE.test(data.full_name) ? ["m_name", "full_name"]
          : (data.email.length > 160 || !EMAIL_RE.test(data.email)) ? ["m_email", "email"]
          : !ph.ok ? ["m_phone", "phone_local"]
          : (data.company && !COMPANY_RE.test(data.company)) ? ["m_company", "company"] : null;
  if(bad){
    ok.textContent = T(bad[0]);
    var f = form.elements[bad[1]] || document.getElementById("phoneLocal"); if(f) f.focus();
    return;
  }
  btn.disabled = true;
  ok.textContent = T("m_sending");
  fetch("/api/orders", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  })
  .then(function(r){return r.json().catch(function(){return {}}).then(function(j){return {status:r.status, body:j}})})
  .then(function(res){
    if(res.status === 200 && res.body.ok){
      ok.textContent = T("m_ok");
      form.reset(); if(window.PHONE) PHONE.reset(); formShownAt = Date.now();
    } else {
      var map = {name:"m_name", email:"m_email", phone:"m_phone", company:"m_company", rate:"m_rate", dup:"m_dup", fast:"m_fast"};
      ok.textContent = T(map[res.body.code] || "m_err");
    }
  })
  .catch(function(){ ok.textContent = T("m_net"); })
  .then(function(){ btn.disabled = false; });
});

/* contact links scroll to the exact center of the screen */
document.querySelectorAll('a[href="#contact"]').forEach(function(a){
  a.addEventListener("click", function(e){
    e.preventDefault();
    var s = document.getElementById("contact");
    var top = s.getBoundingClientRect().top + scrollY + s.offsetHeight/2 - innerHeight/2;
    scrollTo({top: Math.max(0, top), behavior: "smooth"});
  });
});

/* GSAP (page entrance and scroll reveals only, no button movement) */
if(window.gsap && window.ScrollTrigger && !RM){
  gsap.registerPlugin(ScrollTrigger);
  var tl = gsap.timeline({defaults:{ease:"power3.out"}});
  tl.from(".p1",{x:-90,opacity:0,duration:.9})
    .from(".p2",{x:90,opacity:0,duration:.9},"<")
    .from(".p3",{y:70,opacity:0,duration:.9,stagger:.1},"-=.6")
    .from(".p4",{scale:0,transformOrigin:"center",opacity:0,duration:.6},"-=.4")
    .from(".eyebrow",{y:20,opacity:0,duration:.6},"-=1.2")
    .from("#h .wi",{yPercent:115,duration:.9,stagger:.1,ease:"power4.out"},"-=.6")
    .from(".hsub,.hbtns",{y:26,opacity:0,duration:.8,stagger:.12},"-=.6");
  gsap.to(".track",{xPercent:-50,duration:30,repeat:-1,ease:"none"});
  gsap.utils.toArray("h2:not(.wtitle)").forEach(function(el){
    gsap.from(el,{y:50,opacity:0,duration:.9,ease:"power3.out",scrollTrigger:{trigger:el,start:"top 90%"}});
  });
  /* my work entrance */
  gsap.from(".wgrid > .wtitle, .wgrid > .wsub",{y:40,opacity:0,duration:.9,stagger:.12,ease:"power3.out",scrollTrigger:{trigger:".work",start:"top 70%"}});
  gsap.from(".wline",{y:30,opacity:0,duration:.8,ease:"power3.out",scrollTrigger:{trigger:".work",start:"top 50%"}});
  gsap.to(".wglow",{yPercent:40,ease:"none",scrollTrigger:{trigger:".work",scrub:true,start:"top bottom",end:"bottom top"}});
  gsap.from(".soc",{y:30,opacity:0,duration:.6,stagger:.08,ease:"back.out(1.6)",scrollTrigger:{trigger:".socials",start:"top 85%"}});
  gsap.from(".fiche",{x:60,opacity:0,duration:.9,ease:"power3.out",scrollTrigger:{trigger:".fiche",start:"top 85%"}});
  gsap.to(".line",{scaleX:1,ease:"none",scrollTrigger:{trigger:".steps",start:"top 80%",end:"bottom 70%",scrub:true}});
}

/* Motion (steps only, no button movement) */
if(window.Motion && !RM){
  var M = Motion;
  document.querySelectorAll(".step").forEach(function(s){s.style.opacity = 0});
  M.inView(".step",function(info){
    var t = info.target || info;
    M.animate(t,{opacity:[0,1],x:[-40,0]},{duration:.7,delay:.1,ease:"easeOut"});
  },{amount:.4});
}
