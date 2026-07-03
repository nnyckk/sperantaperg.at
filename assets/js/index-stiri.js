// Featured news on index
      fetch('stiri.json')
        .then(r => r.json())
        .then(data => {
          const featured = data
            .filter(a => a.featured)
            .sort((a, b) => new Date(b.data) - new Date(a.data))[0];
          if (!featured) return;

          const CATEGORII_LABEL = {
            anunturi: 'Anunțuri', evenimente: 'Evenimente',
            misiuni: 'Misiuni', departamente: 'Departamente'
          };
          const d = new Date(featured.data);
          const dataFormatata = d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });

          document.getElementById('indexFeaturedStire').innerHTML = `
            <article class="index-stire-card fadeIn">
              ${featured.poza ? `<div class="index-stire-img">
                <img src="${featured.poza}" alt="${featured.titlu}" loading="lazy" onerror="this.parentElement.style.display='none'" />
              </div>` : ''}
              <div class="index-stire-content">
                <span class="index-stire-tag badge-${featured.categorie}">${CATEGORII_LABEL[featured.categorie] || featured.categorie}</span>
                <h3 class="index-stire-title">${featured.titlu}</h3>
                <p class="index-stire-meta"><svg xmlns="http://www.w3.org/2000/svg" height="13px" viewBox="0 -960 960 960" width="13px" fill="currentColor"><path d="M367-527q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z"/></svg> ${featured.autor} &nbsp;·&nbsp; ${dataFormatata}</p>
                <p class="index-stire-rezumat">${featured.rezumat}</p>
                <a href="articol.html?id=${featured.id}" class="btn btn-filled">Citește mai mult</a>
              </div>
            </article>
          `;
        })
        .catch(() => {
          document.querySelector('.index-featured-stire').style.display = 'none';
        });