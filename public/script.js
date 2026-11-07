var RM = matchMedia("(prefers-reduced-motion:reduce)").matches;
var items = ["Web design","Web development","E-commerce","Mobile apps","Dashboards","SEO","Branding","Support"];
document.getElementById("track").innerHTML = items.concat(items).map(function(t){return "<span>"+t+"</span>"}).join("");

var h = document.getElementById("h");
h.innerHTML = h.textContent.split(" ").map(function(w){return '<span class="w"><span class="wi">'+w+'</span></span>'}).join(" ");

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
  gsap.utils.toArray("h2,.contact .s,.fiche").forEach(function(el){
    gsap.from(el,{y:50,opacity:0,duration:.9,ease:"power3.out",scrollTrigger:{trigger:el,start:"top 90%"}});
  });
  gsap.set(".card",{opacity:0,y:70,rotateX:-12});
  ScrollTrigger.batch(".card",{start:"top 92%",once:true,onEnter:function(b){
    gsap.to(b,{opacity:1,y:0,rotateX:0,duration:.9,stagger:.13,ease:"back.out(1.4)"});
  }});
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
  document.querySelectorAll(".card").forEach(function(c){
    c.addEventListener("mouseenter",function(){M.animate(c,{y:-10,scale:1.03,borderColor:"rgba(255,255,255,.6)"},sp)});
    c.addEventListener("mouseleave",function(){M.animate(c,{y:0,scale:1,borderColor:"rgba(255,255,255,.15)"},sp)});
  });
  document.querySelectorAll(".btn").forEach(function(b){
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