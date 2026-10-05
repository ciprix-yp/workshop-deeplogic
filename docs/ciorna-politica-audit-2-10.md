# Ciornă — politica de confidențialitate, secțiunea pentru audit

**Stare:** ciornă din 05.10.2026, **nepublicată**. Se publică în
`legal/Politica_de_Confidentialitate_DeepLogic.md` și în `src/pages/confidentialitate.astro`
după confirmarea lui Ciprian și după punctele de validat de la final. Trebuie să fie live
**înainte de prima sesiune de calibrare**, fiindcă și calibrarea lucrează cu date reale.

Surse: metodologia `METODOLOGIE_PRIMUL_PAS_v2_1.md` (§2, §13, §16, §16.1, D14, D15) din repo-ul
assessment și câmpurile reale ale instrumentului (`src/stratul2/model.ts`). Voce: „dumneavoastră”,
ca restul politicii.

---

## Text propus: secțiune nouă, 2.10

### 2.10 Auditul „PRIMUL PAS · 7 piloni”

Auditul e o sesiune ghidată, de aproximativ 90 de minute, între proprietarul firmei și Deep
Logic, față în față sau online. Răspunsurile se notează într-un instrument digital, pe
dispozitivul Deep Logic.

Colectăm:
- numele dumneavoastră, numele firmei, rolul dumneavoastră în firmă, mărimea și domeniul firmei;
- răspunsurile la întrebările celor șapte piloni: ce vă costă cel mai mult, cine e implicat,
  cum se desfășoară procesul pas cu pas, unde stă informația, cine hotărăște și cine verifică,
  ce se poate strica și cât vă costă azi problema;
- textele pe care le spuneți sau le scriem împreună în sesiune, de exemplu descrierea ultimului
  caz și pașii procesului;
- rezultatul: verdictul, primul pas și planul livrat;
- adresa de email, pentru livrarea planului și pentru întrebarea de la ziua 60 (mai jos).

Vă rugăm să nu ne dați nume de colegi, clienți sau parteneri. În audit, oamenii se descriu prin
rol: „dispecerul”, „colega de la vânzări”.

**Unde stau datele.** Pe dispozitivul Deep Logic pe care rulează instrumentul și într-un fișier
separat pentru fiecare firmă. Datele unei firme nu se folosesc în auditul altei firme. Singurul
lucru refolosit între audituri sunt prețurile publice de pe piață, care nu conțin date despre
nicio firmă. Instrumentul nu trimite datele către servere terțe și nu le transmite unui model AI.
Dacă una dintre acestea se schimbă (de exemplu, salvarea pe un server sau compunerea planului cu
AI), secțiunea se actualizează înainte de schimbare.

**Scop:** realizarea auditului, livrarea planului primului pas și, dacă o cereți, pregătirea unei
oferte.

**Temei legal:** executarea contractului încheiat cu firma dumneavoastră (art. 6 alin. 1 lit. b
din GDPR). Pentru sesiunile fără plată, consimțământul dumneavoastră (art. 6 alin. 1 lit. a).

**Cât păstrăm.** 90 de zile de la livrarea planului. La ziua 60 vă trimitem un email în care vă
întrebăm dacă doriți să păstrăm datele, de exemplu pentru o reevaluare. Dacă nu răspundeți, la
ziua 90 ștergem tot ce ține de auditul firmei: sesiunea, notele, fișierele și calculele.
Contractul și documentele contabile se păstrează separat, pe termenele cerute de lege.

---

## Text propus: completare la secțiunea 5

La finalul secțiunii 5, un paragraf nou:

> Pentru auditul „PRIMUL PAS · 7 piloni” (secțiunea 2.10) se aplică regula proprie de 90 de zile,
> descrisă acolo, nu termenul general de 1 an.

## Ce NU se schimbă acum

- **Secțiunile 3 și 4 (furnizori, transferuri):** instrumentul nu folosește încă niciun furnizor.
  Când salvarea trece pe server (etapa 2, candidat Cloudflare D1, D14), se adaugă rândul
  furnizorului, cu locația reală a datelor.
- **Secțiunea 7:** verdictul se calculează după reguli scrise, dar îl citește și îl discută
  Ciprian cu proprietarul. Nu e o decizie automată cu efecte juridice.

---

## De validat înainte de publicare

1. **Rolul Deep Logic.** Metodologia (§2) spune că, în audit, Deep Logic e persoană împuternicită
   și că se semnează un acord de prelucrare a datelor (DPA). Politica asta e a Deep Logic ca
   operator. Probabil Deep Logic e operator pentru datele proprietarului și persoană
   împuternicită pentru ce ține de oamenii și procesele firmei. Se validează juridic, ca și
   textele de consimțământ din 18.09.
2. **Sesiunile de calibrare: cu plată sau fără?** Temeiul legal depinde de asta: contract sau
   consimțământ. Textul de mai sus le acoperă pe amândouă.
3. **Cât păstrăm dacă omul cere păstrarea la ziua 60.** Nedecis. Propunere: încă 12 luni, apoi
   aceeași întrebare, ca regula generală din secțiunea 5.
4. **Adresa de email nu e încă un câmp în instrument.** La calibrare, emailul de la ziua 60 și
   ștergerea de la ziua 90 se fac de mână, din calendarul lui Ciprian. Automat abia din etapa 2
   (D15). Textul propus nu spune „automat”, ca să rămână adevărat în ambele faze.
