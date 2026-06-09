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

      const ARROW_ICON = `<svg class="stiri-arrow-icon" xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor"><path d="m480-320 160-160-160-160-56 56 64 64H320v80h168l-64 64 56 56Zm0 240q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/></svg>`;

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
              <a href="articol.html?id=${art.id}" class="btn">Citește mai mult</a>
            </div>
          </div>`;
      }

      // ── Render card ───────────────────────────────────────────
      function renderCard(art) {
        return `
          <article class="stiri-card fadeIn" data-category="${art.categorie}" data-id="${art.id}">
            <a href="articol.html?id=${art.id}" class="stiri-card-link">
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

      // ── Render page ───────────────────────────────────────────
      function renderPage() {
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        const term = document.getElementById('searchInput').value.toLowerCase().trim();

        filteredArticole = allArticole.filter(art => {
          const matchCat = activeFilter === 'toate' || art.categorie === activeFilter;
          const matchTerm = !term ||
            art.titlu.toLowerCase().includes(term) ||
            art.rezumat.toLowerCase().includes(term) ||
            art.autor.toLowerCase().includes(term);
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

        // No results
        document.getElementById('noResults').style.display =
          filteredArticole.length === 0 ? 'block' : 'none';

        // Re-observe new elements for fade-in
        document.querySelectorAll('.fadeIn:not(.visible)').forEach(el => fadeObs.observe(el));
      }

      // ── Fade-in observer ──────────────────────────────────────
      const fadeObs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
      }, { threshold: 0.1 });

      document.querySelectorAll('.fadeInDelay').forEach(el => fadeObs.observe(el));

      // ── Load JSON ─────────────────────────────────────────────
      fetch('stiri.json')
        .then(r => r.json())
        .then(data => {
          // Sort by date descending (newest first)
          allArticole = data.sort((a, b) => new Date(b.data) - new Date(a.data));
          renderPage();
        })
        .catch(err => {
          console.error('Eroare la încărcarea știrilor:', err);
          document.getElementById('noResults').style.display = 'block';
          document.getElementById('noResults').querySelector('p').textContent =
            'Știrile nu au putut fi încărcate. Te rugăm să încerci mai târziu.';
          document.getElementById('loadMoreBtn').style.display = 'none';
        });

      // ── Filters ───────────────────────────────────────────────
      document.querySelectorAll('.filter-btn').forEach(btn =>
        btn.addEventListener('click', () => {
          document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          visibleCount = CARDS_PER_PAGE;
          renderPage();
        })
      );

      document.getElementById('searchInput').addEventListener('input', () => {
        visibleCount = CARDS_PER_PAGE;
        renderPage();
      });

      // ── Load more ─────────────────────────────────────────────
      document.getElementById('loadMoreBtn').addEventListener('click', () => {
        visibleCount += CARDS_PER_PAGE;
        renderPage();
      });

      // ── Hamburger ─────────────────────────────────────────────

      // ── Filter bar compact — doar când atinge nav-ul ──────────
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

      let userExpanded = false;
      let expandedScrollY = 0;

      filterBar.addEventListener('click', () => {
        if (filterBar.classList.contains('compact')) {
          filterBar.classList.remove('compact');
          userExpanded = true;
          expandedScrollY = window.scrollY;
        }
      });

      window.addEventListener('scroll', () => {
        updateFilterBarTop();
        const navHeight = getNavHeight();
        const filterTop = filterBar.getBoundingClientRect().top;
        const isSticky = filterTop <= navHeight + 1;

        if (userExpanded && isSticky) {
          if (Math.abs(window.scrollY - expandedScrollY) > 40) {
            filterBar.classList.add('compact');
            userExpanded = false;
          }
        } else if (!userExpanded) {
          filterBar.classList.toggle('compact', isSticky);
        }
      });