var RM = matchMedia("(prefers-reduced-motion:reduce)").matches;
var items = ["Web design","Web development","E-commerce","Mobile apps","Dashboards","SEO","Branding","Support"];
document.getElementById("track").innerHTML = items.concat(items).map(function(t){return "<span>"+t+"</span>"}).join("");

var h = document.getElementById("h");
h.innerHTML = h.textContent.split(" ").map(function(w){return '<span class="w"><span class="wi">'+w+'</span></span>'}).join(" ");

/* ===== MY WORK slider ===== */
var S = [
  {t:"Web design", l:"Interfaces", d:"Clean, memorable interfaces that explain what you do in seconds.", c:"#2a6bd1",
   ic:'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18M9 9v11"/>'},
  {t:"Web development", l:"Fast websites", d:"Fast, secure websites and web apps that are easy to maintain.", c:"#3b5bdb",
   ic:'<path d="m8 8-5 4 5 4M16 8l5 4-5 4M14 5l-4 14"/>'},
  {t:"E-commerce", l:"Online stores", d:"Online stores with simple checkout that turn visitors into buyers.", c:"#1c8ad6",
   ic:'<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.5 12h11L21 7H6"/>'},
  {t:"Mobile apps", l:"iOS and Android", d:"iOS and Android apps that feel native and run smoothly.", c:"#4a55c9",
   ic:'<rect x="7" y="2" width="10" height="20" rx="3"/><path d="M11 18h2"/>'},
  {t:"Dashboards", l:"Smart tools", d:"Dashboards and admin tools that make your data easy to understand.", c:"#0f77b8",
   ic:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'}
];
var cur = 0, N = S.length;
var elTitle = document.getElementById("wTitle"), elDesc = document.getElementById("wDesc"),
    elCards = document.getElementById("wcards"), elDots = document.getElementById("dots"),
    elCn = document.getElementById("cn"), elCtr = document.getElementById("ctr");

function pad(n){ return (n < 10 ? "0" : "") + n; }

function cardHTML(i, active){
  var s = S[i];
  return '<div class="wc' + (active ? ' act' : '') + '" data-i="' + i + '" style="background:linear-gradient(160deg,' + s.c + ',#071d38 85%)">' +
    '<svg class="art" viewBox="0 0 24 24">' + s.ic + '</svg>' +
    '<div class="tag"><b>' + pad(i + 1) + '</b><span>' + s.t + '<small>' + s.l + '</small></span></div>' +
    (active ? '<span class="go2"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>' : '') +
  '</div>';
}

function renderAll(){
  elTitle.textContent = S[cur].t;
  elDesc.textContent = S[cur].d;
  elCn.textContent = pad(cur + 1);
  elCtr.style.width = ((cur + 1) / N * 100) + "%";
  elCards.innerHTML = [0,1,2].map(function(k){ return cardHTML((cur + k) % N, k === 0); }).join("");
  elDots.innerHTML = S.map(function(s, i){
    return '<button class="dot' + (i === cur ? ' on' : '') + '" data-i="' + i + '" aria-label="' + s.t + '"></button>';
  }).join("");
}

function go(i){
  i = (i + N) % N;
  if(i === cur) return;
  cur = i;
  renderAll();
  if(window.gsap && !RM){
    gsap.fromTo([elTitle, elDesc, document.getElementById("wBtn")], {y:30, opacity:0}, {y:0, opacity:1, duration:.6, stagger:.08, ease:"power3.out"});
    gsap.fromTo("#wcards .wc", {x:60, opacity:0}, {x:0, opacity:1, duration:.6, stagger:.1, ease:"power3.out"});
  }
}

elCards.addEventListener("click", function(e){
  var c = e.target.closest(".wc");
  if(!c) return;
  var i = +c.dataset.i;
  if(i === cur){ document.getElementById("contact").scrollIntoView({behavior:"smooth", block:"center"}); }
  else { go(i); }
});
elDots.addEventListener("click", function(e){
  var d = e.target.closest(".dot");
  if(d) go(+d.dataset.i);
});
document.getElementById("wPrev").addEventListener("click", function(){ go(cur - 1); });
document.getElementById("wNext").addEventListener("click", function(){ go(cur + 1); });
document.getElementById("wScroll").addEventListener("click", function(){
  document.getElementById("process").scrollIntoView({behavior:"smooth"});
});
renderAll();

/* My Work link: show the section on the full screen */
document.querySelectorAll('a[href="#services"]').forEach(function(a){
  a.addEventListener("click", function(e){
    e.preventDefault();
    scrollTo({top: document.getElementById("services").offsetTop, behavior:"smooth"});
  });
});

/* order form */
document.getElementById("orderForm").addEventListener("submit", function(e){
  e.preventDefault();
  var form = e.target, ok = document.getElementById("ok"), btn = document.getElementById("send");
  var data = {
    full_name: form.full_name.value.trim(),
    email: form.email.value.trim(),
    phone: form.phone.value.trim(),
    company: form.company.value.trim()
  };
  if(!data.full_name || !/^\S+@\S+\.\S+$/.test(data.email)){
    ok.textContent = "Please enter your full name and a valid email address.";
    return;
  }
  btn.disabled = true;
  ok.textContent = "Sending...";
  fetch("/api/orders", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  })
  .then(function(r){return r.json().then(function(j){return {status:r.status, body:j}})})
  .then(function(res){
    if(res.status === 200 && res.body.ok){
      ok.textContent = "Thank you! Your order was sent. We will contact you soon.";
      form.reset();
    } else {
      ok.textContent = res.body.error || "Something went wrong. Please try again.";
    }
  })
  .catch(function(){ ok.textContent = "Network error. Please try again."; })
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

function cnt(el){
  var n = +el.dataset.n, s = el.dataset.s, o = {v:0};
  gsap.to(o, {v:n, duration:1.6, ease:"power2.out", onUpdate:function(){el.textContent = Math.round(o.v)+s}});
}

/* particles */
if(!RM){
  var cv = document.getElementById("fx"), cx = cv.getContext("2d"), W, H, P = [], mx = -999, my = -999;
  function rs(){
    W = cv.width = innerWidth; H = cv.height = innerHeight; P = [];
    for(var i=0;i<Math.min(60,W/20);i++) P.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3});
  }
  rs(); addEventListener("resize", rs);
  addEventListener("mousemove", function(e){mx = e.clientX; my = e.clientY});
  (function dr(){
    cx.clearRect(0,0,W,H);
    P.forEach(function(a,i){
      a.x += a.vx; a.y += a.vy;
      if(a.x<0||a.x>W) a.vx *= -1;
      if(a.y<0||a.y>H) a.vy *= -1;
      var dx = a.x-mx, dy = a.y-my, d = Math.hypot(dx,dy);
      if(d<130){a.x += dx/d; a.y += dy/d}
      cx.fillStyle = "rgba(255,255,255,.65)"; cx.beginPath(); cx.arc(a.x,a.y,1.4,0,6.3); cx.fill();
      for(var j=i+1;j<P.length;j++){
        var b = P[j], e = (a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y);
        if(e<13000){cx.strokeStyle = "rgba(109,179,255,"+.25*(1-e/13000)+")"; cx.beginPath(); cx.moveTo(a.x,a.y); cx.lineTo(b.x,b.y); cx.stroke()}
      }
    });
    requestAnimationFrame(dr);
  })();
}

/* GSAP */
if(window.gsap && window.ScrollTrigger && !RM){
  gsap.registerPlugin(ScrollTrigger);
  var tl = gsap.timeline({defaults:{ease:"power3.out"}});
  tl.from(".p1",{x:-90,opacity:0,duration:.9})
    .from(".p2",{x:90,opacity:0,duration:.9},"<")
    .from(".p3",{y:70,opacity:0,duration:.9,stagger:.1},"-=.6")
    .from(".p4",{scale:0,transformOrigin:"center",opacity:0,duration:.6},"-=.4")
    .from(".wi",{yPercent:115,duration:.9,stagger:.07,ease:"power4.out"},"-=.3")
    .from(".sub,.cta,.mini",{y:26,opacity:0,duration:.8,stagger:.12},"-=.5")
    .add(function(){document.querySelectorAll(".hero [data-n]").forEach(cnt)},"-=.6");
  gsap.to(".logo-big",{y:-12,duration:2.4,repeat:-1,yoyo:true,ease:"sine.inOut"});
  gsap.to("#pg",{scaleX:1,ease:"none",scrollTrigger:{scrub:.3,start:0,end:"max"}});
  gsap.to(".g1",{yPercent:70,ease:"none",scrollTrigger:{trigger:".hero",scrub:true,start:"top top",end:"bottom top"}});
  gsap.to(".g2",{yPercent:-40,ease:"none",scrollTrigger:{trigger:".hero",scrub:true,start:"top top",end:"bottom top"}});
  gsap.to(".logo-big",{rotate:8,scale:.8,ease:"none",scrollTrigger:{trigger:".hero",scrub:true,start:"top top",end:"bottom top"}});
  gsap.to(".track",{xPercent:-50,duration:30,repeat:-1,ease:"none"});
  gsap.utils.toArray("h2:not(.wtitle)").forEach(function(el){
    gsap.from(el,{y:50,opacity:0,duration:.9,ease:"power3.out",scrollTrigger:{trigger:el,start:"top 90%"}});
  });
  /* my work entrance */
  gsap.from(".wtext > *",{y:50,opacity:0,duration:.9,stagger:.12,ease:"power3.out",scrollTrigger:{trigger:".work",start:"top 70%"}});
  gsap.from(".wc",{x:90,opacity:0,duration:.9,stagger:.12,ease:"power3.out",scrollTrigger:{trigger:".work",start:"top 70%"}});
  gsap.from(".dot",{scale:0,opacity:0,duration:.5,stagger:.08,ease:"back.out(2)",scrollTrigger:{trigger:".work",start:"top 70%"}});
  gsap.from(".wline",{y:30,opacity:0,duration:.8,ease:"power3.out",scrollTrigger:{trigger:".work",start:"top 50%"}});
  gsap.to(".wglow",{yPercent:40,ease:"none",scrollTrigger:{trigger:".work",scrub:true,start:"top bottom",end:"bottom top"}});
  gsap.from(".soc",{y:30,opacity:0,duration:.6,stagger:.08,ease:"back.out(1.6)",scrollTrigger:{trigger:".socials",start:"top 85%"}});
  gsap.from(".fiche",{x:60,opacity:0,duration:.9,ease:"power3.out",scrollTrigger:{trigger:".fiche",start:"top 85%"}});
  gsap.to(".line",{scaleX:1,ease:"none",scrollTrigger:{trigger:".steps",start:"top 80%",end:"bottom 70%",scrub:true}});
  gsap.utils.toArray(".stats b").forEach(function(b){
    ScrollTrigger.create({trigger:b,start:"top 90%",once:true,onEnter:function(){cnt(b)}});
  });
} else {
  document.querySelectorAll("[data-n]").forEach(function(e){e.textContent = e.dataset.n + e.dataset.s});
}

/* Motion */
if(window.Motion && !RM){
  var M = Motion, sp = {type:"spring",stiffness:300,damping:18};
  document.querySelectorAll(".btn, .wbtn").forEach(function(b){
    b.addEventListener("mousemove",function(e){
      var r = b.getBoundingClientRect();
      M.animate(b,{x:(e.clientX-r.left-r.width/2)*.3,y:(e.clientY-r.top-r.height/2)*.4},{type:"spring",stiffness:250,damping:15});
    });
    b.addEventListener("mouseleave",function(){M.animate(b,{x:0,y:0,scale:1},sp)});
    b.addEventListener("mousedown",function(){M.animate(b,{scale:.92},sp)});
    b.addEventListener("mouseup",function(){M.animate(b,{scale:1},sp)});
  });
  document.querySelectorAll(".step").forEach(function(s){s.style.opacity = 0});
  M.inView(".step",function(info){
    var t = info.target || info;
    M.animate(t,{opacity:[0,1],x:[-40,0]},{duration:.7,delay:.1,ease:"easeOut"});
  },{amount:.4});
  document.querySelectorAll(".stats .wrap>div").forEach(function(d){
    d.addEventListener("mouseenter",function(){M.animate(d,{scale:1.12},sp)});
    d.addEventListener("mouseleave",function(){M.animate(d,{scale:1},sp)});
  });
}