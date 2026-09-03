# Formular înscriere — Bloc 2: Calificare & Segmentare Leaduri

**Workshop:** „Prima Mutare spre un Asistent Digital" — 16 septembrie 2026
**Poziționare în formular:** secțiune vizual separată, DUPĂ Bloc 1 (date personale/logistică). Titlu de secțiune recomandat: *„Câteva întrebări despre firma ta"* — nu „calificare", nu „segmentare" (jargon intern, nu vocabular pentru cititor).

---

## Q1 — Așteptări

```yaml
id: asteptari
label: "Cu ce ai vrea să pleci din sală pe 16 septembrie?"
tip: checkbox
obligatoriu: true
min_selectii: 1
max_selectii: 2
validare_ui: "blochează a 3-a bifă; dacă încearcă, afișează: 'Alege doar 2 — cele mai importante pentru tine'"
optiuni:
  - "Să înțeleg în sfârșit ce poate și ce nu poate AI-ul, concret"
  - "Să știu de unde încep în firma mea"
  - "Să văd cu ochii mei un sistem care chiar funcționează, nu promisiuni"
  - "Să pot da direcție echipei mele pentru implementare"
  - "Să știu ce riscuri îmi asum dacă încep"
```

---

## Q2 — Frica

```yaml
id: frica_principala
label: "Când te gândești să introduci AI în firma ta, ce te oprește cel mai mult?"
tip: radio
obligatoriu: true
min_selectii: 1
max_selectii: 1
optiuni:
  - "Că investesc timp și bani și nu iese nimic"
  - "Că nu am pe cineva care să-mi spună obiectiv ce merită și ce nu, în cazul meu"
  - "Că oamenii mei se vor simți amenințați"
  - "Că datele firmei ajung unde nu trebuie"
  - "Că nu știu dacă e momentul potrivit"
  - "Nu mă oprește nimic, doar n-am prioritizat asta"
```

---

## Q3 — Provocarea de business (segmentare)

```yaml
id: provocare_business
label: "Dacă AI-ul ar rezolva o singură problemă în firma ta anul ăsta, care ar fi?"
tip: checkbox
obligatoriu: true
min_selectii: 1
max_selectii: 2
validare_ui: "blochează a 3-a bifă; dacă încearcă, afișează: 'Alege doar 2 — cele mai importante pentru tine'"
optiuni:
  - "Ofertele și devizele — durează prea mult, se fac manual"
  - "Răspunsurile către clienți — aceleași întrebări, iar și iar"
  - "Procesare documente și rapoarte — pierdem prea mult timp cu asta"
  - "Vânzarea — nu ajung la destui oameni potriviți"
  - "Inducția oamenilor noi, precum și dezvoltarea proceselor și procedurilor"
  - id: altceva
    label: "Altceva:"
    tip: text
    conditional: true
    trigger: "bifat ca a doua/singura opțiune selectată"
```

---

## Q4 — Blocajul

```yaml
id: blocaj_istoric
label: "Ce te-a ținut pe loc până acum?"
microcopy: "Bifează tot ce se aplică"
tip: checkbox
obligatoriu: true
min_selectii: 1
max_selectii: null   # fără limită — aici vrei tot ce se aplică, nu prioritizare
optiuni:
  - "N-am știut de unde să încep"
  - "N-am avut cu cine să vorbesc — pe cineva care înțelege și afacerea, nu doar tehnologia"
  - "Am crezut că e pentru firme mai mari decât a mea"
  - "Am încercat și n-am fost impresionat"
  - "N-am avut timp să mă uit serios"
  - "Nu m-a ținut nimic pe loc, abia acum devine relevant"
```

---

## Q5 — Calificare in-company

```yaml
id: interes_incompany
label: "Consideri că ar fi oportun un workshop în compania ta pentru colegii din echipa ta?"
tip: radio
obligatoriu: true
min_selectii: 1
max_selectii: 1
optiuni:
  - "Da — oamenii mei ar avea nevoie de asta mai mult decât mine"
  - "Poate — vreau întâi să văd formatul pe 16"
  - "Nu — ajunge să înțeleg eu"
  - "Nu e cazul, lucrez singur sau cu foarte puțini oameni"
```

---

## Referință rapidă — tip câmp per întrebare

| # | Temă | Tip | Min | Max |
|---|---|---|---|---|
| Q1 | Așteptări | checkbox | 1 | 2 |
| Q2 | Frica | radio | 1 | 1 |
| Q3 | Provocare business | checkbox | 1 | 2 |
| Q4 | Blocaj istoric | checkbox | 1 | fără limită |
| Q5 | Interes in-company | radio | 1 | 1 |

**Notă tehnică n8n/Baserow:** Q1 și Q3 necesită validare de limită pe frontend (JS disable după 2 bife) — dacă formularul nu suportă asta nativ, adaugă mesaj de eroare la submit dacă `selectii > 2`.
