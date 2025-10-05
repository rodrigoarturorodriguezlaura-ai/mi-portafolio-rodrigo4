/* ---------- Helpers ---------- */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

/* ---------- Basic UX & Mobile Nav ---------- */
(function setupNav(){
  const menuBtn = $('#menuBtn');
  const mobileNav = $('#mobileNav');
  if(menuBtn && mobileNav){
    menuBtn.addEventListener('click', ()=> {
      mobileNav.classList.toggle('show');
      mobileNav.classList.toggle('hide');
      mobileNav.setAttribute('aria-hidden', mobileNav.classList.contains('hide'));
    });
  }
  // Smooth scroll for in-page links
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    e.preventDefault();
    const id = a.getAttribute('href');
    const target = document.querySelector(id);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top, behavior: 'smooth' });
    // close mobile nav if opened
    if(mobileNav && mobileNav.classList.contains('show')) {
      mobileNav.classList.remove('show');
      setTimeout(()=> mobileNav.classList.add('hide'), 260);
      mobileNav.setAttribute('aria-hidden', 'true');
    }
  });
})();

/* ---------- Particles.js init (no external fetch) ---------- */
function initParticles(){
  if(typeof particlesJS === 'undefined'){
    console.warn('particles.js no está cargado (CDN). El fondo de partículas no se mostrará.');
    return;
  }
  // inline config - no fetch (compatible con file://)
  const cfg = {
    particles: {
      number: { value: 48, density: { enable: true, value_area: 900 } },
      color: { value: "#00d4ff" },
      shape: { type: "circle" },
      opacity: { value: 0.12 },
      size: { value: 3 },
      line_linked: { enable: true, distance: 160, color: "#7c5cff", opacity: 0.08, width: 1 },
      move: { enable: true, speed: 1.5 }
    },
    interactivity: {
      detect_on: "canvas",
      events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" } },
      modes: { push: { particles_nb: 2 } }
    },
    retina_detect: true
  };
  try {
    particlesJS('particles-js', cfg);
  } catch (err) {
    console.warn('particlesJS init error:', err);
  }
}
window.addEventListener('load', initParticles);

/* ---------- Three.js simple animated background ---------- */
(function threeBg(){
  const canvas = document.getElementById('three-canvas');
  if(!canvas || typeof THREE === 'undefined') {
    // Three.js not loaded -> skip silently
    return;
  }
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.z = 6;
  const light = new THREE.DirectionalLight(0xffffff, 0.9); light.position.set(5,5,5); scene.add(light);
  const group = new THREE.Group();
  for(let i=0;i<10;i++){
    const mat = new THREE.MeshStandardMaterial({ color: 0x00d4ff, metalness:0.15, roughness:0.6, emissive:0x021627 });
    const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5,0), mat);
    mesh.position.set((Math.random()-0.5)*10,(Math.random()-0.5)*6,(Math.random()-0.5)*6);
    mesh.userData.speed = 0.002 + (Math.random()*0.006);
    group.add(mesh);
  }
  scene.add(group);
  function onResize(){ renderer.setSize(window.innerWidth, window.innerHeight); camera.aspect = window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); }
  window.addEventListener('resize', onResize); onResize();
  (function anim(){
    group.children.forEach((m,i)=> {
      m.rotation.x += m.userData.speed;
      m.rotation.y += m.userData.speed * 0.9;
      m.position.y += Math.sin(Date.now()*0.0004 + i)/500;
    });
    renderer.render(scene, camera);
    requestAnimationFrame(anim);
  })();
})();

/* ---------- Progress bars on load ---------- */
function animateProgress(){
  $$('.progress').forEach(p => {
    const val = p.dataset.progress || '0%';
    // small timeout to ensure styles applied
    setTimeout(()=> p.style.width = val, 120);
  });
}
window.addEventListener('load', animateProgress);

/* ---------- Reveal on scroll (GSAP if present) ---------- */
function revealOnScroll(){
  const elems = document.querySelectorAll('.card, .section h2, .project-card');
  elems.forEach((el, idx)=> {
    if(el._revealed) return;
    const rect = el.getBoundingClientRect();
    if(rect.top < window.innerHeight - 80){
      el._revealed = true;
      if(typeof gsap !== 'undefined') {
        gsap.fromTo(el, {y: 20, opacity:0}, {y:0, opacity:1, duration:0.8, delay: idx*0.06, ease: "power3.out"});
      } else {
        el.style.opacity = 0;
        el.style.transform = 'translateY(18px)';
        setTimeout(()=> { el.style.transition = 'all .6s ease'; el.style.opacity = 1; el.style.transform = 'translateY(0)'; }, 30 + idx*40);
      }
    }
  });
}
window.addEventListener('load', revealOnScroll);
window.addEventListener('scroll', revealOnScroll);

/* ---------- Theme toggle (localStorage) ---------- */
(function theme(){
  const tgl = $('#themeToggle');
  const root = document.documentElement;
  const stored = localStorage.getItem('theme_v1') || 'dark';
  if(stored === 'light') root.style.setProperty('--bg','#f7f8fb');
  if(!tgl) return;
  tgl.addEventListener('click', ()=> {
    const cur = localStorage.getItem('theme_v1') || 'dark';
    if(cur === 'dark'){
      localStorage.setItem('theme_v1', 'light');
      root.style.setProperty('--bg','#f7f8fb');
    } else {
      localStorage.setItem('theme_v1', 'dark');
      root.style.setProperty('--bg','#070812');
    }
  });
})();

/* ---------- Music control ---------- */
(function musicControls(){
  const audio = document.getElementById('bg-music');
  const fab = $('#musicFab');
  const menuToggleLink = $('#music-toggle');
  if(!audio || !fab) return;
  audio.volume = 0.18;
  // Do not autoplay; allow user to start
  fab.addEventListener('click', ()=> {
    if(audio.paused){
      audio.play().then(()=> { fab.textContent = 'Pausar Música'; }).catch(()=> { alert('Reproducción bloqueada por el navegador. Haz clic en la página para permitir audio.'); });
    } else {
      audio.pause(); fab.textContent = 'Reproducir Música';
    }
  });
  // connect mobile link
  if(menuToggleLink) menuToggleLink.addEventListener('click', (e)=>{ e.preventDefault(); fab.click(); });
})();

/* ---------- Scroll top button ---------- */
(function scrollTop(){
  const btn = $('#scrollTop');
  if(!btn) return;
  window.addEventListener('scroll', ()=> {
    if(window.scrollY > 300) btn.classList.remove('hide'); else btn.classList.add('hide');
  });
  btn.addEventListener('click', ()=> window.scrollTo({top:0,behavior:'smooth'}));
})();

/* ---------- MobileNet demo (TF.js) ---------- */
let mobilenetModel = null;
async function loadMobileNet(){
  if(typeof mobilenet === 'undefined'){
    $('#aiResult') && ($('#aiResult').textContent = 'TensorFlow / MobileNet no disponible (requiere conexión a internet o CDN).');
    return;
  }
  try {
    $('#aiResult') && ($('#aiResult').textContent = 'Cargando modelo...');
    mobilenetModel = await mobilenet.load();
    $('#aiResult') && ($('#aiResult').textContent = 'Modelo listo. Sube una imagen.');
  } catch (err) {
    console.error('Error cargando MobileNet:', err);
    $('#aiResult') && ($('#aiResult').textContent = 'No se pudo cargar el modelo (ver consola).');
  }
}
// load lazily only when modal opens
$('#openAiDemo')?.addEventListener('click', async ()=>{
  const modal = $('#modalAi');
  modal.classList.add('show'); modal.classList.remove('hidden'); modal.setAttribute('aria-hidden','false');
  if(!mobilenetModel) await loadMobileNet();
});
$('#closeAi')?.addEventListener('click', ()=>{ const m = $('#modalAi'); m.classList.remove('show'); setTimeout(()=> { m.classList.add('hidden'); m.setAttribute('aria-hidden','true'); },200); $('#previewWrap').innerHTML=''; $('#aiResult').textContent=''; });

$('#imgUpload')?.addEventListener('change', async (e)=> {
  const f = e.target.files[0]; if(!f) return;
  const url = URL.createObjectURL(f);
  $('#previewWrap').innerHTML = `<img src="${url}" style="max-width:100%;border-radius:8px" />`;
  $('#aiResult').textContent = 'Analizando...';
  if(!mobilenetModel){
    await loadMobileNet();
    if(!mobilenetModel) { $('#aiResult').textContent = 'Modelo no disponible.'; return; }
  }
  const imgEl = $('#previewWrap img');
  try {
    const predictions = await mobilenetModel.classify(imgEl);
    $('#aiResult').innerHTML = predictions.map(p => `<div><strong>${p.className}</strong> — ${(p.probability*100).toFixed(2)}%</div>`).join('');
  } catch (err) {
    console.error('Error clasificando imagen:', err);
    $('#aiResult').textContent = 'Error analizando la imagen.';
  }
});

/* ---------- Simple local Chat IA (demo offline) ---------- */
(function chatDemo(){
  const openChat = $('#openChatAi');
  const chatModal = $('#chatAi');
  const closeChat = $('#closeChat');
  const send = $('#sendChat');
  const win = $('#chatWindow');
  const input = $('#chatMessage');

  function botReply(text){
    text = (text||'').toLowerCase();
    if(text.includes('skills') || text.includes('habilidad')) return `Tienes experiencia en HTML/CSS, JavaScript, PHP/MySQL, Java y trabajo con IA (TensorFlow.js).`;
    if(text.includes('proyecto')) return `Proyectos destacados: Newton App (móvil), Página Web Empresarial, Sistema de Registro de Trabajadores (CRUD).`;
    if(text.includes('hola') || text.includes('buenas')) return `¡Hola! Soy el asistente demo. ¿En qué puedo ayudarte?`;
    if(text.includes('cv')) return `Pulsa "Descargar CV (PDF)" en la sección Sobre Mí.`;
    return `Esta es una demo. Para respuestas reales conecta una API (OpenAI, etc.).`;
  }

  openChat?.addEventListener('click', ()=> { chatModal.classList.add('show'); chatModal.classList.remove('hidden'); chatModal.setAttribute('aria-hidden','false'); win.innerHTML=''; });
  closeChat?.addEventListener('click', ()=> { chatModal.classList.remove('show'); setTimeout(()=> { chatModal.classList.add('hidden'); chatModal.setAttribute('aria-hidden','true'); },200); });
  send?.addEventListener('click', ()=> {
    const txt = input.value.trim(); if(!txt) return;
    const div = document.createElement('div'); div.className = 'msg me'; div.textContent = txt; win.appendChild(div);
    input.value = ''; win.scrollTop = win.scrollHeight;
    setTimeout(()=> { const r = botReply(txt); const b = document.createElement('div'); b.className = 'msg bot'; b.textContent = r; win.appendChild(b); win.scrollTop = win.scrollHeight; }, 500);
  });
})();

/* ---------- Text-to-Speech & Voice Commands ---------- */
$('#ttsBtn')?.addEventListener('click', ()=> {
  const text = `Hola, soy Rodrigo Arturo Rodríguez Laura. Bienvenido a mi portafolio profesional. Tengo experiencia en desarrollo web, móvil y modelos de inteligencia artificial.`;
  if('speechSynthesis' in window){
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1; u.pitch = 1; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
  } else alert('TTS no soportado en este navegador');
});

(function voiceCommands(){
  const btn = $('#voiceBtn');
  if(!btn) return;
  if(!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)){ btn.style.display='none'; return; }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const rec = new SpeechRecognition(); rec.lang = 'es-PE'; rec.interimResults = false; rec.maxAlternatives = 1;
  let listening = false;
  btn.addEventListener('click', ()=> {
    if(!listening){ rec.start(); btn.textContent = 'Escuchando...'; listening = true; }
    else { rec.stop(); btn.textContent = 'Voz'; listening = false; }
  });
  rec.addEventListener('result', (ev)=>{
    const txt = ev.results[0][0].transcript.toLowerCase();
    if(txt.includes('contacto') || txt.includes('contáctame') ) document.querySelector('#contacto').scrollIntoView({behavior:'smooth'});
    else if(txt.includes('proyectos')) document.querySelector('#proyectos').scrollIntoView({behavior:'smooth'});
    else if(txt.includes('descargar cv')) document.getElementById('downloadCv')?.click();
    btn.textContent = 'Voz'; listening=false;
  });
  rec.addEventListener('end', ()=> { listening=false; btn.textContent='Voz'; });
})();

/* ---------- Projects filter ---------- */
$$('.filter').forEach(b => b.addEventListener('click', ()=> {
  const f = b.dataset.filter;
  $$('#projectsGrid .project-card').forEach(c => {
    c.style.display = (f === 'all' || c.dataset.type === f) ? 'block' : 'none';
  });
}));

/* ---------- Local contact saving ---------- */
$('#saveLocal')?.addEventListener('click', ()=> {
  const name = $('#contactName').value.trim();
  const email = $('#contactEmail').value.trim();
  if(!name || !email) return alert('Completa nombre y correo');
  const contacts = JSON.parse(localStorage.getItem('contacts_v1')||'[]');
  contacts.push({name,email,at:new Date().toISOString()});
  localStorage.setItem('contacts_v1', JSON.stringify(contacts));
  alert('Contacto guardado localmente.');
});

/* ---------- Generate PDF CV (jsPDF) ---------- */
$('#downloadCv')?.addEventListener('click', ()=> {
  if(typeof window.jspdf === 'undefined' && typeof window.jspdf === 'object' && typeof window.jspdf.jsPDF === 'undefined'){
    // try: window.jspdf may be loaded as window.jspdf
  }
  try {
    const { jsPDF } = window.jspdf || window;
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text('Currículum - Rodrigo Arturo Rodríguez Laura',14,22);
    doc.setFontSize(11); doc.text('Estudiante de Desarrollo de Software. Experiencia: Newton en Red, Producción y Abastecimiento Rodríguez. Habilidades: HTML, CSS, JS, PHP, MySQL, Java, IA.',14,36,{maxWidth:180});
    doc.save('CV-Rodrigo-Rodriguez.pdf');
  } catch (err) {
    alert('No se pudo generar PDF (jsPDF no cargado). Verifica conexión o recarga la página.');
    console.error('jsPDF error:', err);
  }
});

/* ---------- Small UX: close modals with ESC ---------- */
document.addEventListener('keydown',(e)=> {
  if(e.key === 'Escape'){
    const m = document.querySelector('.modal.show');
    if(m){ m.classList.remove('show'); setTimeout(()=> { m.classList.add('hidden'); m.setAttribute('aria-hidden','true'); },200); }
    const mobile = document.querySelector('.mobile-nav.show');
    if(mobile){ mobile.classList.remove('show'); setTimeout(()=> mobile.classList.add('hide'), 250); }
  }
});

/* ---------- profile image fallback ---------- */
window.addEventListener('load', ()=> {
  const img = document.getElementById('profileImg');
  if(img) img.onerror = ()=> img.src = 'https://via.placeholder.com/320x320.png?text=Rodrigo';
});

/* ---------- Fill tech list (visual) ---------- */
(function fillTech(){
  const tech = ['HTML','CSS','JavaScript','PHP','MySQL','Java','TensorFlow.js','Three.js','GSAP'];
  const wrap = document.getElementById('techList');
  if(!wrap) return;
  tech.forEach(t => {
    const el = document.createElement('div');
    el.className = 'tech-pill';
    el.textContent = t;
    wrap.appendChild(el);
  });
})();

/* ---------- Init small reveal after load ---------- */
setTimeout(()=> { revealOnScroll(); animateProgress(); }, 500);
