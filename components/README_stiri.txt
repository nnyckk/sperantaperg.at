================================================================
  GHID ADĂUGARE ȘTIRI — Biserica Speranța Perg
  Fișier: stiri.json
================================================================


----------------------------------------------------------------
  STRUCTURA UNUI ARTICOL
----------------------------------------------------------------

{
  "id": 1,                          ← număr unic, nu repeta niciodată
  "featured": true,                 ← apare mare sus pe pagina de știri (doar unul odată)
  "titlu": "Titlul articolului",
  "categorie": "evenimente",        ← vezi categoriile de mai jos
  "data": "2025-06-15",             ← format: YYYY-MM-DD
  "autor": "Andrei Popescu",
  "poza": "assets/img/stiri/cover.jpg",     ← thumbnail pe card + fundal hero articol
  "poze": [                                 ← poze afișate în articol (opțional)
    "assets/img/stiri/foto1.jpg",
    "assets/img/stiri/foto2.jpg"
  ],
  "rezumat": "Text scurt afișat pe card și în featured.",
  "text": "Conținutul complet al articolului.",
  "nou": false,                     ← badge roșu NOU pe card și în hero articol
  "link": "#"                       ← neutilizat momentan, lasă "#"
}


----------------------------------------------------------------
  CATEGORII DISPONIBILE
----------------------------------------------------------------

  "anunturi"      → badge albastru
  "evenimente"    → badge portocaliu
  "misiuni"       → badge verde
  "departamente"  → badge gri deschis


----------------------------------------------------------------
  REGULI IMPORTANTE
----------------------------------------------------------------

  FEATURED
  --------
  - Doar un articol ar trebui să aibă "featured": true
  - Dacă sunt mai multe, se afișează automat cel mai recent după dată
  - Celelalte apar ca și carduri normale în grid

  NOU
  ---
  - Poți avea oricâte articole cu "nou": true simultan
  - Badge-ul apare pe card (stânga sus pe imagine) și în hero articol
  - În secțiunea "Vezi și alte noutăți" apare mereu un articol nou random

  ID
  --
  - Fiecare articol trebuie să aibă un ID unic
  - Nu reutiliza ID-uri șterse
  - Incrementează mereu: 1, 2, 3, 4...

  DATA
  ----
  - Format obligatoriu: YYYY-MM-DD (ex: 2025-06-15)
  - Articolele sunt sortate automat după dată, cele mai noi primele

  POZE
  ----
  - "poza"  → apare DOAR pe card și ca fundal hero. Nu apare în corpul articolului.
  - "poze"  → apar în corpul articolului, DUPĂ text, cu layout automat:
      1 poză  → full width
      2 poze  → 50% | 50%
      3 poze  → una mare sus + două mici jos
  - Dacă nu ai poze în articol, omite câmpul "poze" complet


----------------------------------------------------------------
  FORMATARE TEXT ARTICOL
----------------------------------------------------------------

  PARAGRAFE
  ---------
  Separă paragrafele cu \n\n (linie goală între ele):

    "text": "Primul paragraf.\n\nAl doilea paragraf.\n\nAl treilea paragraf."

  Linie nouă în același paragraf (fără spațiu mare), folosește \n:

    "text": "Linia unu.\nLinia doi, același paragraf."


  HTML ÎN TEXT
  ------------
  Poți folosi HTML direct pentru formatare avansată:

    <p>Paragraf normal</p>
    <strong>Text bold</strong>
    <em>Text italic</em>
    <strong><em>Bold și italic</em></strong>

    <h2>Titlu secțiune mare</h2>
    <h3>Titlu secțiune mic</h3>

    <blockquote>Citat cu linie albastră în stânga</blockquote>

    <ul>
      <li>Element listă</li>
      <li>Alt element</li>
    </ul>

    <a href="https://...">Link în text</a>


  EXEMPLU COMPLET
  ---------------
  "text": "<p>Bine ați venit la tabăra de vară <strong>Speranța 2025</strong>!</p>

           <h2>Ce ne așteaptă</h2>

           <p>Patru zile de <em>părtășie</em>, Cuvânt și rugăciune.</p>

           <blockquote>„Căutați mai întâi Împărăția lui Dumnezeu." — Matei 6:33</blockquote>

           <ul>
             <li>Sesiuni de Cuvânt dimineața</li>
             <li>Activități în aer liber</li>
             <li>Seară de laudă și închinare</li>
           </ul>

           <p>Locuri <strong>limitate</strong> — înregistrează-te acum.</p>"


----------------------------------------------------------------
  FIȘIERE SISTEM
----------------------------------------------------------------

  stiri.json      ← editezi doar acesta pentru a adăuga știri
  stiri.html      ← pagina cu lista de știri (nu edita)
  articol.html    ← pagina individuală a fiecărui articol (nu edita)
  stiri.css       ← stiluri pagina știri (nu edita)
  articol.css     ← stiluri pagina articol (nu edita)


================================================================
  Made by Neagoe Nick
================================================================
