/* basic helpers */
document.documentElement.classList.remove('no-js');

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

/* sticky header shadow */
const header = document.querySelector('.site-header');
const onScroll = () => {
  if (window.scrollY > 6) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
};
document.addEventListener('scroll', onScroll);
onScroll();

/* hamburger */
const nav = document.querySelector('[data-nav]');
const btn = document.querySelector('.nav-toggle');
btn.addEventListener('click', () => {
  const open = btn.getAttribute('aria-expanded') === 'true';
  btn.setAttribute('aria-expanded', String(!open));
  nav.style.display = open ? 'none' : 'block';
});
$$('.site-nav a').forEach(a => a.addEventListener('click', () => {
  // close on selection (mobile)
  if (getComputedStyle(btn).display !== 'none') {
    btn.setAttribute('aria-expanded', 'false');
    nav.style.display = 'none';
  }
}));

/* smooth anchor scroll */
$$('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', (e)=>{
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior:'smooth', block:'start' });
    history.replaceState(null,'',`#${id}`);
  });
});

/* year */
$('#year').textContent = new Date().getFullYear();

/* CTA: set to newest music link from JSON if present */
const setListenCTA = (url) => {
  const cta = document.getElementById('cta-listen');
  if (cta && url) cta.href = url;
};

/* LIVE: render from /data/shows.json */
async function renderShows(){
  try{
    const res = await fetch('data/shows.json', { cache:'no-store' });
    if(!res.ok) throw new Error('shows.json missing');
    const shows = await res.json();

    const ul = document.getElementById('shows');
    ul.innerHTML = '';
    const upcoming = shows
      .map(s => ({...s, d:new Date(s.date)}))
      .filter(s => s.d >= new Date(new Date().toDateString())) // today or future
      .sort((a,b)=>a.d-b.d)
      .slice(0,6);

    if (upcoming.length === 0){
      document.getElementById('shows-note').hidden = false;
      return;
    }

    for(const s of upcoming){
      const li = document.createElement('li');
      li.className = 'show';
      const dd = s.d;
      const dateFmt = new Intl.DateTimeFormat('en-GB',{ day:'2-digit', month:'short', year:'numeric' }).format(dd);
      li.innerHTML = `
        <div class="date">${dateFmt}</div>
        <div class="where">${s.city} · ${s.venue}</div>
        <div>
          ${s.tickets ? `<a class="btn btn-primary" href="${s.tickets}" target="_blank" rel="noopener">Tickets</a>` : `<span class="btn btn-ghost" aria-disabled="true">Soon</span>`}
        </div>`;
      ul.appendChild(li);
    }
  }catch(e){
    console.warn(e);
  }
}

/* MUSIC: BMTH-style artworks grid from /data/music.json */
async function renderMusic(){
  try{
    const res = await fetch('data/music.json', { cache:'no-store' });
    if(!res.ok) throw new Error('music.json missing');
    const items = await res.json();
    const grid = document.getElementById('artGrid');
    grid.innerHTML = '';

    // newest first
    items.sort((a,b)=> new Date(b.release) - new Date(a.release));

    // set hero CTA to newest universal link if present
    setListenCTA(items[0]?.url);

    for(const m of items){
      const a = document.createElement('a');
      a.className = 'card';
      a.href = m.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.title = `${m.title} (${m.type})`;

      const img = document.createElement('img');
      img.alt = m.title + ' artwork';
      img.loading = 'lazy';
      img.src = m.artwork; // e.g., assets/music/last-single.jpg

      const meta = document.createElement('div');
      meta.className = 'card-meta';
      meta.innerHTML = `<h3>${m.title}</h3><p>${m.type} · ${new Date(m.release).getFullYear()}</p>`;

      a.appendChild(img);
      a.appendChild(meta);
      grid.appendChild(a);
    }
  }catch(e){
    console.warn(e);
  }
}

renderShows();
renderMusic();
