// ── Helpers ──────────────────────────────────────────────
      const CATEGORII_LABEL = {
        anunturi:     'Anunțuri',
        evenimente:   'Evenimente',
        misiuni:      'Misiuni',
        departamente: 'Departamente'
      };

      function formatData(dataStr) {
        const d = new Date(dataStr);
        return d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });
      }

      const PERSON_ICON = `<svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="currentColor"><path d="M367-527q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z"/></svg>`;

      const ARROW_ICON = `<span class="stiri-arrow-icon" aria-hidden="true"></span>`;

      // ── Render featured ───────────────────────────────────────
      function renderFeatured(art) {
        return `
          <div class="stiri-featured fadeIn" data-category="${art.categorie}" data-id="${art.id}">
            <div class="stiri-featured-image">
              ${art.poza ? `<img src="${art.poza}" alt="${art.titlu}" loading="lazy" onerror="this.style.display='none'" />` : ''}
              ${art.nou ? `<span class="stiri-badge-nou badge-new">Nou</span>` : ''}
            </div>
            <div class="stiri-featured-content">
              <span class="stiri-tag badge-${art.categorie}">${CATEGORII_LABEL[art.categorie] || art.categorie}</span>
              <h2 class="subtitle">${art.titlu}</h2>
              <p class="small-text-light">${PERSON_ICON} ${art.autor} &nbsp;·&nbsp; ${formatData(art.data)}</p>
              <p class="paragraph">${art.rezumat}</p>
              <a href="/articol.html?id=${art.id}" class="btn">Citește mai mult</a>
            </div>
          </div>`;
      }

      // ── Render card ───────────────────────────────────────────
      function renderCard(art) {
        return `
          <article class="stiri-card fadeIn" data-category="${art.categorie}" data-id="${art.id}">
            <a href="/articol.html?id=${art.id}" class="stiri-card-link">
              <div class="stiri-card-image">
                ${art.poza ? `<img src="${art.poza}" alt="${art.titlu}" loading="lazy" onerror="this.style.display='none'" />` : ''}
                ${art.nou ? `<span class="stiri-badge-nou badge-new">Nou</span>` : ''}
              </div>
              <div class="stiri-card-content">
                <span class="stiri-tag badge-${art.categorie}">${CATEGORII_LABEL[art.categorie] || art.categorie}</span>
                <h3 class="stiri-card-title">${art.titlu}</h3>
                <p class="small-text-light">${PERSON_ICON} ${art.autor} &nbsp;·&nbsp; ${formatData(art.data)}</p>
                <p class="stiri-card-excerpt">${art.rezumat}</p>
                <span class="stiri-link">Citește ${ARROW_ICON}</span>
              </div>
            </a>
          </article>`;
      }

      // ── State ─────────────────────────────────────────────────
      const CARDS_PER_PAGE = 6;
      let allArticole = [];
      let filteredArticole = [];
      let visibleCount = CARDS_PER_PAGE;

      // Cautarea ignora diacriticele: "craciun" gaseste "Crăciun".
      // NFD desparte litera de semn, apoi taiem semnele (U+0300-U+036F).
      // ș/ț apar si cu sedila (U+0219/U+021B vs U+015F/U+0163) in functie
      // de cine a scris textul, asa ca le unificam inainte.
      function normalize(str) {
        return (str || '')
          .replace(/[șş]/g, 's')
          .replace(/[țţ]/g, 't')
          .normalize('NFD')
          .replace(/[̀-ͯ]/g, '')
          .toLowerCase()
          .trim();
      }

      // ── Render page ───────────────────────────────────────────
      function renderPage() {
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        // Cuvintele se cauta independent, deci ordinea nu conteaza:
        // "picnic copii" gaseste si "copiii ... la picnic".
        const termenBrut = document.getElementById('searchInput').value.trim();
        const cuvinte = normalize(termenBrut)
          .split(/\s+/)
          .filter(Boolean);

        filteredArticole = allArticole.filter(art => {
          const matchCat = activeFilter === 'toate' || art.categorie === activeFilter;
          const haystack = normalize(
            `${art.titlu} ${art.rezumat} ${art.autor}`
          );
          const matchTerm = cuvinte.every(c => haystack.includes(c));
          return matchCat && matchTerm;
        });

        // Featured: cel mai recent articol cu featured:true
        const featuredEl = document.getElementById('stiriFeatured');
        const featured = filteredArticole
          .filter(a => a.featured)
          .sort((a, b) => new Date(b.data) - new Date(a.data))[0];
        featuredEl.innerHTML = featured ? renderFeatured(featured) : '';

        // Cards: toate articolele care NU sunt featured-ul ales (inclusiv alte featured:true)
        const cards = filteredArticole.filter(a => a !== featured);
        const toShow = cards.slice(0, visibleCount);
        document.getElementById('stiriGrid').innerHTML = toShow.map(renderCard).join('');

        // Load more button
        document.getElementById('loadMoreBtn').style.display =
          cards.length > visibleCount ? 'inline-block' : 'none';

        // No results — mesaj potrivit cu ce a cauzat lipsa rezultatelor
        const noRes = document.getElementById('noResults');
        noRes.style.display = filteredArticole.length === 0 ? 'block' : 'none';
        if (filteredArticole.length === 0) {
          renderNoResults(cuvinte.length ? termenBrut : '', activeFilter);
        }

        // Re-observe new elements for fade-in
        document.querySelectorAll('.fadeIn:not(.visible)').forEach(el => fadeObs.observe(el));
      }

      // ── Stare goală ───────────────────────────────────────────
      // Trei cazuri, fiecare cu iesirea lui: cautare fara rezultate,
      // categorie goala, sau combinatia dintre ele.
      function renderNoResults(termen, filtru) {
        const titlu = document.getElementById('noResultsTitle');
        const text  = document.getElementById('noResultsText');
        const reset = document.getElementById('noResultsReset');
        const categorie = CATEGORII_LABEL[filtru] || '';
        const areFiltru = filtru !== 'toate';

        if (termen && areFiltru) {
          titlu.textContent = `Niciun rezultat pentru „${termen}”`;
          text.textContent  = `Nu am găsit nimic în categoria ${categorie}. Încearcă să cauți în toate articolele.`;
          reset.textContent = 'Caută în toate categoriile';
          reset.hidden = false;
          reset.dataset.action = 'filtru';
        } else if (termen) {
          titlu.textContent = `Niciun rezultat pentru „${termen}”`;
          text.textContent  = 'Verifică scrierea sau încearcă un cuvânt mai scurt.';
          reset.textContent = 'Șterge căutarea';
          reset.hidden = false;
          reset.dataset.action = 'cautare';
        } else if (areFiltru) {
          titlu.textContent = `Încă niciun articol la ${categorie}`;
          text.textContent  = 'Revino în curând! Publicăm constant noutăți.';
          reset.textContent = 'Vezi toate articolele';
          reset.hidden = false;
          reset.dataset.action = 'filtru';
        } else {
          titlu.textContent = 'Niciun articol deocamdată';
          text.textContent  = 'Revino în curând! Publicăm constant noutăți.';
          reset.hidden = true;
        }
      }

      // ── Fade-in observer ──────────────────────────────────────
      const fadeObs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
      }, { threshold: 0.1 });

      document.querySelectorAll('.fadeInDelay').forEach(el => fadeObs.observe(el));

      // ── Load JSON ─────────────────────────────────────────────
      fetch('/stiri/stiri.json')
        .then(r => r.json())
        .then(data => {
          // Sort by date descending (newest first)
          allArticole = data.sort((a, b) => new Date(b.data) - new Date(a.data));
          renderPage();
        })
        .catch(err => {
          console.error('Eroare la încărcarea știrilor:', err);
          document.getElementById('noResults').style.display = 'block';
          document.getElementById('noResultsTitle').textContent =
            'Nu am putut încărca știrile';
          document.getElementById('noResultsText').textContent =
            'Verifică conexiunea și reîncarcă pagina.';
          document.getElementById('noResultsReset').hidden = true;
          document.getElementById('loadMoreBtn').style.display = 'none';
        });

      // ── Filters ───────────────────────────────────────────────
      // Pe mobil bara de filtre e scrollabila orizontal: aduce in vedere
      // butonul apasat daca e taiat de marginea ecranului.
      function scrollFilterIntoView(btn) {
        const bar = document.querySelector('.filter-buttons');
        if (!bar || bar.scrollWidth <= bar.clientWidth) return;

        const barRect = bar.getBoundingClientRect();
        const btnRect = btn.getBoundingClientRect();
        const margin = 12;

        let delta = 0;
        if (btnRect.left < barRect.left + margin) {
          delta = btnRect.left - barRect.left - margin;
        } else if (btnRect.right > barRect.right - margin) {
          delta = btnRect.right - barRect.right + margin;
        }
        if (delta) bar.scrollBy({ left: delta, behavior: 'smooth' });
      }

      // Daca rezultatele au ramas deasupra ecranului (ai filtrat de jos din
      // pagina), urca inapoi la lista ca sa se vada primul articol.
      function scrollResultsIntoView() {
        const section = document.querySelector('.stiri-grid-section');
        const bar = document.querySelector('.stiri-filter-bar');
        if (!section) return;

        // Bara de filtre e sticky sub nav; scade-le inaltimea ca primul
        // articol sa nu ramana ascuns sub ele.
        const barH = bar ? bar.getBoundingClientRect().height : 0;
        const navH = bar ? parseFloat(getComputedStyle(bar).top) || 0 : 0;
        const target = section.getBoundingClientRect().top + window.scrollY - barH - navH;

        if (window.scrollY > target) {
          window.scrollTo({ top: Math.max(target, 0), behavior: 'smooth' });
        }
      }

      document.querySelectorAll('.filter-btn').forEach(btn =>
        btn.addEventListener('click', () => {
          document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          scrollFilterIntoView(btn);
          visibleCount = CARDS_PER_PAGE;
          renderPage();
          scrollResultsIntoView();
        })
      );

      const searchInput = document.getElementById('searchInput');

      searchInput.addEventListener('input', () => {
        visibleCount = CARDS_PER_PAGE;
        renderPage();
      });

      // Daca incepi sa scrii cand esti jos in pagina, urca la lista ca sa
      // vezi rezultatele pe masura ce tastezi. Pe mobil tastatura se deschide
      // tot acum si redimensioneaza viewport-ul, asa ca lasam un cadru ca
      // pozitia sa se aseze inainte de a calcula unde derulam.
      searchInput.addEventListener('focus', () => {
        setTimeout(scrollResultsIntoView, 150);
      });

      // Butonul din starea goală: scoate constrângerea care a golit lista.
      document.getElementById('noResultsReset').addEventListener('click', (e) => {
        if (e.currentTarget.dataset.action === 'cautare') {
          searchInput.value = '';
        } else {
          document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          const toate = document.querySelector('.filter-btn[data-filter="toate"]');
          if (toate) {
            toate.classList.add('active');
            scrollFilterIntoView(toate);
          }
        }
        visibleCount = CARDS_PER_PAGE;
        renderPage();
      });

      // ── Load more ─────────────────────────────────────────────
      document.getElementById('loadMoreBtn').addEventListener('click', () => {
        visibleCount += CARDS_PER_PAGE;
        renderPage();
      });

      // ── Hamburger ─────────────────────────────────────────────

      // Filter bar goes compact once it reaches the nav
      const filterBar = document.querySelector('.stiri-filter-bar');
      const nav = document.getElementById('navigationWrapper');
      const mobileBar = document.getElementById('nav-mobile-bar');

      function getNavHeight() {
        const mobile = getComputedStyle(mobileBar).display !== 'none';
        return (mobile ? mobileBar : nav).getBoundingClientRect().height;
      }

      function updateFilterBarTop() {
        filterBar.style.top = getNavHeight() + 'px';
      }

      updateFilterBarTop();
      window.addEventListener('resize', updateFilterBarTop);

      window.addEventListener('scroll', () => {
        updateFilterBarTop();
        const navHeight = getNavHeight();
        const filterTop = filterBar.getBoundingClientRect().top;
        filterBar.classList.toggle('compact', filterTop <= navHeight + 1);
      });