var RM = matchMedia("(prefers-reduced-motion:reduce)").matches;
var items = ["Web design","Web development","E-commerce","Mobile apps","Dashboards","SEO","Branding","Support"];
document.getElementById("track").innerHTML = items.concat(items).map(function(t){return "<span>"+t+"</span>"}).join("");

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
var menuLinks = document.querySelectorAll(".mpill a");
function spy(){
  var y = scrollY + innerHeight * .4, idx = 0;
  secEls.forEach(function(s, i){ if(s.offsetTop <= y) idx = i; });
  menuLinks.forEach(function(a, i){ a.classList.toggle("on", i === idx); });
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
  var t = document.createElement("div"); t.className = "copied"; t.textContent = "Discord username copied: " + name;
  document.body.appendChild(t); setTimeout(function(){ t.remove(); }, 2600);
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
