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

      const PERSON_ICON = `<svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor"><path d="M367-527q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z"/></svg>`;

      const ARROW_ICON = `<svg class="stiri-arrow-icon" xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor"><path d="m480-320 160-160-160-160-56 56 64 64H320v80h168l-64 64 56 56Zm0 240q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/></svg>`;

      function getIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return parseInt(params.get('id'));
      }

      // ── Fade observer ─────────────────────────────────────────
      const fadeObs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
      }, { threshold: 0.08 });

      function observeFade() {
        document.querySelectorAll('.fadeIn:not(.visible), .fadeInDelay:not(.visible)')
          .forEach(el => fadeObs.observe(el));
      }

      // ── Render articol ────────────────────────────────────────
      function renderArticol(art) {
        // Update <title>
        document.title = `${art.titlu} - Biserica Speranța Perg`;

        // Hero
        const hero = document.getElementById('articolHero');
        if (art.poza) {
          hero.style.backgroundImage =
            `linear-gradient(rgba(8,20,27,0.80), rgba(8,20,27,0.65)), url('${art.poza}')`;
          hero.style.backgroundSize = 'cover';
          hero.style.backgroundPosition = 'center';
        }

        document.getElementById('articolHeroMeta').innerHTML = `
          ${art.nou ? `<span class="stiri-badge-nou badge-new">Nou</span>` : ''}
          <span class="stiri-tag badge-${art.categorie}">${CATEGORII_LABEL[art.categorie] || art.categorie}</span>
        `;
        document.getElementById('articolHeroTitle').textContent = art.titlu;
        document.getElementById('articolHeroAuthor').innerHTML =
          `${PERSON_ICON} ${art.autor} &nbsp;·&nbsp; ${formatData(art.data)}`;

        // Body
        // `text` poate fi HTML simplu (paragrafe, titluri etc.)
        // Dacă e string simplu, îl împachetăm în <p>
        let bodyHtml = '';
        if (art.text) {
          // Dacă textul conține deja tag-uri HTML, îl folosim direct
          if (/<[a-z][\s\S]*>/i.test(art.text)) {
            bodyHtml = art.text;
          } else {
            // Plain text: fiecare linie nouă devine paragraf
            bodyHtml = art.text
              .split(/\n\n+/)
              .map(p => `<p class="paragraph">${p.replace(/\n/g, '<br>')}</p>`)
              .join('');
          }
        } else {
          bodyHtml = `<p class="paragraph">${art.rezumat}</p>`;
        }

        // ── Galerie poze ─────────────────────────────────────
        const poze = Array.isArray(art.poze) ? art.poze.filter(p => p) : [];

        let galerieHtml = '';
        if (poze.length === 1) {
          galerieHtml = `
            <div class="articol-galerie fadeIn">
              <div class="galerie-single galerie-img" data-index="0">
                <img src="${poze[0]}" alt="${art.titlu}" loading="eager" onerror="this.parentElement.style.display='none'" />
              </div>
            </div>`;
        } else if (poze.length >= 2) {
          const thumbsHtml = poze.map((p, i) => `
            <div class="galerie-thumb ${i === 0 ? 'active' : ''}" data-index="${i}">
              <img src="${p}" alt="${art.titlu} ${i+1}" loading="lazy" onerror="this.parentElement.style.display='none'" />
            </div>`).join('');

          galerieHtml = `
            <div class="articol-galerie fadeIn">
              <div class="galerie-stack" data-index="0">
                <div class="galerie-cover" id="galeriecover">
                  <img id="galerieCoverImg" src="${poze[0]}" alt="${art.titlu}" loading="eager" onerror="this.style.display='none'" />
                  <div class="galerie-cover-overlay">
                    <span class="galerie-count-badge">
                      <svg xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 -960 960 960" width="14"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm40-80h480L570-480 450-320l-90-120-120 160Z"/></svg>
                      ${poze.length} foto
                    </span>
                    <span class="galerie-open-btn" id="galerieOpenBtn">
                      Vezi toate
                    </span>
                  </div>
                </div>
              </div>
              <div class="galerie-thumbs" id="galerieThumbs">
                ${thumbsHtml}
              </div>
            </div>`;
        }

        document.getElementById('articolContent').innerHTML = `
          <div class="articol-text fadeIn">
            ${bodyHtml}
          </div>
          ${galerieHtml}
          <div class="articol-footer-meta fadeIn">
            <span class="stiri-tag badge-${art.categorie}">
              ${CATEGORII_LABEL[art.categorie] || art.categorie}
            </span>
            <span class="articol-author-tag">
              ${PERSON_ICON}
              ${art.autor} &nbsp;·&nbsp; ${formatData(art.data)}
            </span>
          </div>
        `;

        observeFade();

        // ── Lightbox ──────────────────────────────────────────
        if (poze.length === 0) return;
        let lbIndex = 0;

        if (!document.getElementById('lightbox')) {
          document.body.insertAdjacentHTML('beforeend', `
            <div id="lightbox" aria-modal="true" role="dialog">
              <button class="lb-close" id="lbClose" aria-label="Închide">&#x2715;</button>
              <div class="lb-img-wrap">
                <img id="lbImg" src="" alt="" />
              </div>
              <div class="lb-controls">
                <button class="lb-nav lb-prev" id="lbPrev" aria-label="Anterior">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </button>
                <div class="lb-counter" id="lbCounter"></div>
                <button class="lb-nav lb-next" id="lbNext" aria-label="Următor">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </button>
              </div>
            </div>
          `);
        }

        const lb        = document.getElementById('lightbox');
        const lbImg     = document.getElementById('lbImg');
        const lbCounter = document.getElementById('lbCounter');
        const lbPrev    = document.getElementById('lbPrev');
        const lbNext    = document.getElementById('lbNext');

        function lbShow(index) {
          lbIndex = ((index % poze.length) + poze.length) % poze.length;
          lbImg.src = poze[lbIndex];
          lbCounter.textContent = (lbIndex + 1) + ' / ' + poze.length;
          lbPrev.style.display = poze.length > 1 ? 'flex' : 'none';
          lbNext.style.display = poze.length > 1 ? 'flex' : 'none';
          lb.classList.add('active');
          document.body.style.overflow = 'hidden';
        }

        function lbClose() {
          lb.classList.remove('active');
          document.body.style.overflow = '';
          document.body.style.pointerEvents = '';
        }

        document.getElementById('lbClose').addEventListener('click', lbClose);
        lb.addEventListener('click', e => { if (e.target === lb) lbClose(); });
        lbPrev.addEventListener('click', e => { e.stopPropagation(); lbShow(lbIndex - 1); });
        lbNext.addEventListener('click', e => { e.stopPropagation(); lbShow(lbIndex + 1); });

        document.addEventListener('keydown', e => {
          if (!lb.classList.contains('active')) return;
          if (e.key === 'Escape')     lbClose();
          if (e.key === 'ArrowLeft')  lbShow(lbIndex - 1);
          if (e.key === 'ArrowRight') lbShow(lbIndex + 1);
        });

        let lbTouchX = 0;
        lb.addEventListener('touchstart', e => { lbTouchX = e.touches[0].clientX; }, { passive: true });
        lb.addEventListener('touchend', e => {
          const diff = lbTouchX - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 50) lbShow(lbIndex + (diff > 0 ? 1 : -1));
        });

        // Click pe cover / single — deschide lightbox
        const coverEl = document.getElementById('galeriecover');
        if (coverEl) {
          coverEl.style.cursor = 'zoom-in';
          coverEl.addEventListener('click', () => {
            const active = document.querySelector('.galerie-thumb.active');
            lbShow(active ? parseInt(active.dataset.index) : 0);
          });
        }
        const singleEl = document.querySelector('.galerie-single');
        if (singleEl) {
          singleEl.addEventListener('click', () => lbShow(0));
        }

        // Buton "Vezi toate"
        const openBtn = document.getElementById('galerieOpenBtn');
        if (openBtn) {
          openBtn.addEventListener('click', e => { e.stopPropagation(); lbShow(0); });
        }

        // Thumbnail click — schimbă cover + marchează activ
        document.querySelectorAll('.galerie-thumb').forEach(thumb => {
          thumb.addEventListener('click', () => {
            if (thumbStrip._dragging) return;
            const idx = parseInt(thumb.dataset.index);
            const coverImg = document.getElementById('galerieCoverImg');
            if (coverImg) coverImg.src = poze[idx];
            document.querySelectorAll('.galerie-thumb').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
          });
        });

        // ── Thumbnail strip: scroll pe desktop, drag pe mobile ──
        const thumbStrip = document.getElementById('galerieThumbs');
        if (thumbStrip) {
          // Înfășoară strip-ul într-un wrap pentru fade gradient
          const wrap = document.createElement('div');
          wrap.className = 'galerie-thumbs-wrap';
          thumbStrip.parentNode.insertBefore(wrap, thumbStrip);
          wrap.appendChild(thumbStrip);

          function updateFade() {
            const atStart = thumbStrip.scrollLeft > 4;
            const atEnd = thumbStrip.scrollLeft + thumbStrip.clientWidth >= thumbStrip.scrollWidth - 4;
            wrap.classList.toggle('at-start', atStart);
            wrap.classList.toggle('at-end', atEnd);
          }
          updateFade();
          thumbStrip.addEventListener('scroll', updateFade, { passive: true });

          // Desktop: wheel orizontal
          thumbStrip.addEventListener('wheel', e => {
            if (e.deltaY === 0) return;
            e.preventDefault();
            thumbStrip.scrollLeft += e.deltaY;
          }, { passive: false });

          // Mobile: drag touch
          let touchStartX = 0;
          let scrollStartLeft = 0;
          thumbStrip._dragging = false;

          thumbStrip.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
            scrollStartLeft = thumbStrip.scrollLeft;
            thumbStrip._dragging = false;
          }, { passive: true });

          thumbStrip.addEventListener('touchmove', e => {
            const dx = touchStartX - e.touches[0].clientX;
            if (Math.abs(dx) > 5) thumbStrip._dragging = true;
            thumbStrip.scrollLeft = scrollStartLeft + dx;
          }, { passive: true });

          thumbStrip.addEventListener('touchend', () => {
            setTimeout(() => { thumbStrip._dragging = false; }, 0);
          });
        }
      }

      // ── Render related card ───────────────────────────────────
      function renderRelatedCard(art) {
        return `
          <article class="stiri-card fadeIn">
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

      // ── Render related section ────────────────────────────────
      function renderRelated(currentArt, allArticole) {
        const usedIds = new Set([currentArt.id]);

        // 1. Un articol cu nou:true, random (dacă există)
        const nouArticole = allArticole.filter(a => a.nou && !usedIds.has(a.id));
        let nouRandom = null;
        if (nouArticole.length > 0) {
          nouRandom = nouArticole[Math.floor(Math.random() * nouArticole.length)];
          usedIds.add(nouRandom.id);
        }

        // 2. Articole din aceeași categorie
        const sameCat = allArticole
          .filter(a => a.categorie === currentArt.categorie && !usedIds.has(a.id))
          .sort((a, b) => new Date(b.data) - new Date(a.data))
          .slice(0, nouRandom ? 2 : 3);
        sameCat.forEach(a => usedIds.add(a.id));

        // 3. Completăm până la 3 cu cele mai recente din orice categorie
        const needed = 3 - (nouRandom ? 1 : 0) - sameCat.length;
        const extra = needed > 0
          ? allArticole
              .filter(a => !usedIds.has(a.id))
              .sort((a, b) => new Date(b.data) - new Date(a.data))
              .slice(0, needed)
          : [];

        const related = [...(nouRandom ? [nouRandom] : []), ...sameCat, ...extra];

        if (related.length === 0) return;

        document.getElementById('relatedTitle').textContent = 'Vezi și alte articole';
        document.getElementById('relatedGrid').innerHTML = related.map(renderRelatedCard).join('');
        document.getElementById('relatedSection').style.display = 'block';
        observeFade();
      }

      // ── Error page ────────────────────────────────────────────
      function renderError() {
        document.title = 'Articol negăsit - Biserica Speranța Perg';
        document.getElementById('articolHeroTitle').textContent = 'Articolul nu a fost găsit';
        document.getElementById('articolContent').innerHTML = `
          <div style="text-align:center; padding: 3em 0;">
            <p class="paragraph">Ne pare rău, articolul căutat nu există sau a fost șters.</p>
            <a href="/stiri" class="btn" style="margin-top:1.5em;">← Înapoi la Noutăți</a>
          </div>`;
      }

      // ── Init ──────────────────────────────────────────────────
      const articleId = getIdFromUrl();

      if (!articleId) {
        renderError();
      } else {
        fetch('stiri.json')
          .then(r => r.json())
          .then(data => {
            const art = data.find(a => a.id === articleId);
            if (!art) { renderError(); return; }
            renderArticol(art);
            renderRelated(art, data);
          })
          .catch(() => renderError());
      }

      // ── Hamburger ─────────────────────────────────────────────