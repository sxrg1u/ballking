# Wallball Legend – Spielplan (Version 2, detailliert)

Pixeliges Fussball-Idle-Spiel fuer den Browser, veroeffentlicht ueber GitHub Pages.
Dieses Dokument ist der komplette Plan plus ein fertiger Prompt zum Bauen (ganz unten).

---

## 1. Die Idee in einem Satz

Ein unbekannter Strassenkicker aus Indien passt den ganzen Tag automatisch Baelle gegen eine Wand. Jeder Pass macht ihn ein kleines bisschen besser. Nach Stunden ueberholt er die ersten Profis, nach Tagen Nationalspieler und nach Wochen Messi. Danach geht es endlos weiter.

---

## 2. Grundentscheidungen (fest)

| Thema | Entscheidung |
|---|---|
| Stil | Pixel-Art, niedrige Aufloesung, scharf hochskaliert |
| Steuerung | Komplett automatisch, man muss nichts klicken ausser Upgrades kaufen |
| Offline | Kein Fortschritt. Training laeuft nur, solange der Tab offen und sichtbar ist |
| Baelle | Mehrere Baelle fliegen gleichzeitig gegen die Wand |
| Waehrung | Nur eine: **Trainingspunkte (TP)** |
| Fortschritt | Unendlich. Messi ist ein sehr spaetes Ziel (ca. 120+ Stunden aktive Spielzeit) |
| Neustart/Prestige | Nicht in Version 1 |
| Sprache | Deutsch (Englisch spaeter moeglich) |
| Technik | Reines HTML/CSS/JavaScript, kein Build-Schritt, laeuft direkt auf GitHub Pages |

---

## 3. Die zwei Fortschritts-Spuren

Das Spiel hat **zwei Zahlen**, die man auseinanderhalten muss:

1. **Trainingspunkte (TP)** – das "Geld". Kommt von jedem erfolgreichen Pass, wird fuer Upgrades ausgegeben.
2. **Erfahrung** – zaehlt alle erfolgreichen Paesse, die es je gab. Wird nie ausgegeben. Daraus berechnet sich das **Rating** des Spielers.

So passt es zur Idee: *"Je mehr er passt, desto besser wird er."* Upgrades machen das Passen schneller, das Passen selbst macht den Spieler besser.

---

## 4. Das Rating und die Vorbilder-Leiter

Der Spieler hat ein **Rating** wie in Fussballspielen: von **1** (kann kaum den Ball stoppen) bis **99** (Messi-Niveau). Danach geht es weiter: **100, 101, 102 ...** ohne Ende.

Dein Spieler bleibt immer derselbe (Standard-Name: **Ravi, 14, aus Mumbai**). Echte Fussballer sind **Vorbilder auf der Leiter**: Erreicht Ravi ihr Rating, heisst es *"Du hast Sunil Chhetri ueberholt!"*. Man spielt also nicht die Stars, man holt sie ein.

### Kapitel und Zielzeiten (aktive Spielzeit)

| Kapitel | Rating | Trainingsort | Beispiel-Vorbilder | Ziel-Spielzeit |
|---|---|---|---|---|
| 1. Strasse | 1–15 | Garagenwand im Hinterhof | erfundene Nachbarskinder | 0–20 min |
| 2. Bolzplatz | 15–35 | Bolzplatz mit Graffitiwand | erfundene Kreisliga-Kicker | bis 2 h |
| 3. Amateurverein | 35–55 | Vereinsgelaende mit Trainingswand | erfundene Regionalliga-Spieler | bis 8 h |
| 4. Profi | 55–72 | Profi-Trainingszentrum | z. B. Sunil Chhetri (Indien-Bezug!) | bis 25 h |
| 5. Nationalspieler | 72–85 | Nationales Leistungszentrum | z. B. Thomas Mueller, Son Heung-min | bis 55 h |
| 6. Weltklasse | 85–94 | Grosses Stadion | z. B. Modric, De Bruyne, Salah | bis 90 h |
| 7. Superstars | 94–98 | Weltstadion bei Nacht | z. B. Ronaldinho, Mbappe, Ronaldo | bis 120 h |
| 8. Messi | 99 | Goldenes Stadion | Messi | ca. 120–150 h |
| 9. Legende | 100+ | Sternen-Stadion | "Ueber allen" – jede Stufe ein neuer Stern | endlos |

Bei 2–3 Stunden pro Tag sind das grob **6–8 Wochen bis Messi**.

Die Leiter wird als **Datendatei** gebaut (`data/ladder.js`): Rating, Name, Land, kurzer Text. So kann man Namen jederzeit austauschen, ohne Code zu aendern.

> **Hinweis zu echten Namen:** Echte Spielernamen in einem kostenlosen Hobbyprojekt sind meist unproblematisch, ganz ohne Risiko ist es aber nicht (Namens- und Bildrechte). Deshalb: nur Namen als Vorbilder, **keine** Pixel-Portraets der echten Spieler, keine Vereinslogos, kein Geld mit dem Spiel verdienen. Ueber die Datendatei kann man im Zweifel schnell auf erfundene Namen umstellen.

---

## 5. Spielmechanik genau

### Ein Pass
1. Spieler nimmt den Ball an.
2. Pass gegen die Wand.
3. Ball prallt ab und rollt zurueck.
4. Erfolgreich: `+TP`, `+1 Erfahrung`, kleine schwebende Zahl.
5. Fehlpass (am Anfang haeufig!): Ball springt daneben und rollt weg, Spieler holt ihn, kein TP, Serie bricht ab.

### Grundformeln (Startwerte, werden spaeter per Simulation feinjustiert)

```
Paesse pro Sekunde (pro Ball) = 0.5 * Passtempo-Faktor
Erfolgsquote                  = 99% - 39% * 0.93^(Ballkontrolle-Stufe)   -> startet bei 60%, naehert sich 99%
TP pro Pass                   = (1 + Technik-Stufe) * Serien-Bonus * Platz-Bonus * Trainer-Bonus * Meilenstein-Bonus
TP pro Sekunde                = Baelle * Paesse/s * Erfolgsquote * TP pro Pass
Upgrade-Kosten                = Grundpreis * Wachstum^Stufe
Erfahrung fuer Rating r       = waechst exponentiell, schneller als die Produktion (per Simulation anpassen)
```

### Die Serie (Combo)
Jeder erfolgreiche Pass in Folge erhoeht einen Serien-Bonus (z. B. +1 % pro Pass, gedeckelt). Ein Fehlpass setzt ihn auf 0. Dadurch wird **Ballkontrolle** wichtig, und man sieht eine schoene Zahl wachsen. Kein Klicken noetig.

---

## 6. Upgrades

### A. Wiederholbare Upgrades (unendlich)

| Upgrade | Wirkung pro Stufe | Grundpreis | Wachstum |
|---|---|---|---|
| Passtempo | +10 % Paesse/s | 10 TP | x1.15 |
| Technik | +1 TP pro Pass (Basis) | 25 TP | x1.17 |
| Ballkontrolle | Erfolgsquote steigt Richtung 99 % | 50 TP | x1.25 |
| Ausdauer | Hoeherer Deckel fuer den Serien-Bonus | 200 TP | x1.30 |
| Neuer Ball | +1 Ball gleichzeitig | 100 TP | x3.0 |

**Meilenstein-Boni:** Alle 25 Stufen eines Upgrades verdoppelt sich dessen Wirkung (Stufe 25, 50, 75 ...). Das gibt immer wieder spuerbare Spruenge.

**Kaufmenge:** Umschalter x1 / x10 / x100 / Max.

### B. Einmal-Freischaltungen

- **Trainingsplaetze** (einer pro Kapitel): Garagenwand -> Bolzplatz -> Vereinsgelaende -> Trainingszentrum -> Leistungszentrum -> Stadion -> Weltstadion -> Goldenes Stadion -> Sternen-Stadion. Jeder Platz: x3 auf alles + neuer Hintergrund. Wird erst kaufbar, wenn das Rating das Kapitel erreicht.
- **Trainer** (erfundene Namen, z. B. "Opa Rajesh", "Coach Heinz", "Professor Taktik"): einmalig, jeweils x2 auf einen Bereich.
- **Ausruestung** (Schuhe, Ball, Trikot in Stufen): kleine Boni + sichtbare Aenderung am Spieler.

### C. Baelle auf dem Bildschirm
Bis zu **12 Baelle** sind einzeln sichtbar, versetzt getaktet, damit es nicht chaotisch wirkt. Ab Ball 13 wird nicht mehr gezeichnet, sondern es erscheint ein Zaehler "x 47 Baelle" und die Szene bekommt zusaetzlich Ballmaschinen im Hintergrund. Berechnet wird trotzdem jeder Ball.

---

## 7. Sichtbare Entwicklung des Spielers

Ravi wird mit den Kapiteln sichtbar besser:

| Kapitel | Aussehen |
|---|---|
| Strasse | barfuss, altes T-Shirt, abgenutzter Ball |
| Bolzplatz | billige Turnschuhe, Shorts |
| Amateurverein | Vereinstrikot, echte Fussballschuhe |
| Profi | Profi-Trikot, Stutzen, saubere Schuhe |
| Nationalspieler | Nationaltrikot (fiktiv, nur Farben) |
| Weltklasse/Superstar | Kapitaensbinde, auffaellige Schuhe |
| Messi/Legende | goldene Schuhe, leuchtende Aura |

Zusaetzlich wird die **Animation** mit steigendem Rating fluessiger (am Anfang leicht wackelig, spaeter sauberer Bewegungsablauf).

---

## 8. Design

### Stil
- Interne Aufloesung der Szene: **320 x 180 Pixel**, scharf hochskaliert (`image-rendering: pixelated`).
- Sprites werden **im Code aus Pixel-Arrays** gezeichnet, nicht als Bilddateien. Das ist fuer eine KI viel leichter zu bauen und zu aendern.
- Farben: sattes Rasengruen, rote Backsteinwand, dunkle UI-Panels (`#1b1f2a`), Gold als Akzent fuer Rating und Erfolge.
- Schrift: "Press Start 2P" (Google Fonts) fuer Titel und grosse Zahlen, eine gut lesbare Schrift fuer laengere Texte.

### Desktop-Layout

```
+-------------------------------------------------------------------+
| WALLBALL LEGEND     TP 1.24M  (+3.4K/s)     12.5 Paesse/s     [=] |
+---------------------------------------+---------------------------+
| [Pixel-Spielerkarte]  RAVI   Rating 23 | UPGRADES                  |
| Kapitel 2: Bolzplatz                   | [Training][Plaetze]       |
| [#########.....] 64% bis Rating 24     | [Trainer][Ausruestung]    |
|                                        |                           |
|        +-------------------+           | +-----------------------+ |
|        |  Wand   o   o     |           | | Passtempo     Stufe 12| |
|        |      o     Ravi   |  CANVAS   | | +10% Paesse/s         | |
|        |   Rasen           |           | | 1.2K TP       [KAUFEN]| |
|        +-------------------+           | +-----------------------+ |
|                                        |  ...                      |
| Serie x1.8   Naechstes Vorbild: ...    | Kaufmenge: x1 x10 x100 Max|
+---------------------------------------+---------------------------+
| [Training]   [Karriere]   [Statistik]   [Einstellungen]           |
+-------------------------------------------------------------------+
```

### Handy-Layout
- Oben: TP und TP/s.
- Darunter: Canvas in voller Breite, darunter Rating-Leiste.
- Unten feste Navigationsleiste mit 4 Reitern: **Upgrades, Karriere, Statistik, Einstellungen**.
- Upgrades oeffnen sich als Liste unter der Szene, die Szene bleibt immer sichtbar.

### Menues im Detail

**Upgrades:** Karten mit Name, Stufe, Wirkung jetzt -> nach Kauf, Preis. Knopf ausgegraut, wenn zu teuer. Kleiner Balken, wie weit man vom Preis entfernt ist.

**Karriere:** Die Vorbilder-Leiter als senkrechte Liste. Ueberholte Spieler abgehakt, der naechste hervorgehoben, weit entfernte (Messi) sichtbar, aber ausgegraut mit "Rating 99". Dazu die Kapitel mit ihren Plaetzen.

**Statistik:** Gesamtpaesse, Fehlpaesse, beste Serie, hoechstes Rating, TP gesamt, Trainingszeit, Datum des Spielbeginns, gekaufte Upgrades.

**Einstellungen:** Ton an/aus, Lautstaerke, Zahlenformat (1.2M / wissenschaftlich 1.2e6), Animationen reduzieren, Spielstand exportieren/importieren (Text zum Kopieren), Spielstand loeschen (mit Sicherheitsabfrage).

### Rueckmeldung
- Kleine "+12" Zahlen ueber dem Spieler.
- Leises "Tock" beim Wandtreffer (abschaltbar, gedrosselt bei vielen Baellen).
- Rating-Aufstieg: kurzer Banner oben, Rating-Zahl blinkt golden.
- Vorbild ueberholt: Meldung *"Du hast ... ueberholt!"* fuer ein paar Sekunden.
- Neues Kapitel: groesserer Moment mit Konfetti und neuem Platz.

---

## 9. Technik

### Dateistruktur

```
index.html
css/style.css
js/main.js        Spielschleife, Start
js/state.js       Spielzustand, Formeln
js/upgrades.js    Upgrade-Definitionen (Daten)
js/ladder.js      Vorbilder-Leiter und Kapitel (Daten)
js/render.js      Canvas, Pixel-Sprites, Animation
js/ui.js          Menues, Upgrade-Karten, Meldungen
js/save.js        Speichern, Laden, Export/Import
js/format.js      Zahlenformat
js/audio.js       Soundeffekte (Web Audio, generiert, keine Dateien)
tools/simulate.js Balancing-Simulation (Node)
README.md
```

### Wichtige technische Regeln
- **Grosse Zahlen:** `break_infinity.js` verwenden (per CDN), da das Spiel endlos ist und normale JavaScript-Zahlen bei 1e308 enden.
- **Kein Offline-Fortschritt:** Spielschleife mit `requestAnimationFrame`. Bei `visibilitychange` (Tab versteckt) pausieren. Zeitschritt pro Frame auf max. 1 Sekunde begrenzen, damit Wegklicken keinen Bonus gibt.
- **Speichern:** `localStorage`, automatisch alle 10 Sekunden und beim Schliessen. Spielstand hat eine Versionsnummer, damit spaetere Updates alte Speicherstaende umwandeln koennen.
- **Balancing:** `tools/simulate.js` spielt das Spiel im Schnelldurchlauf mit einem "kauft immer das guenstigste sinnvolle Upgrade"-Bot und gibt aus, nach wie vielen Stunden welches Rating erreicht wird. Die Konstanten werden angepasst, bis die Zielzeiten aus Abschnitt 4 stimmen.
- **GitHub Pages:** Repository -> Settings -> Pages -> "Deploy from a branch" -> `main` / Root. Keine weiteren Schritte noetig.

---

## 10. Bau-Reihenfolge

1. **Grundgeruest:** Seite, Canvas, ein Spieler, ein Ball, TP-Anzeige.
2. **Upgrades:** Passtempo, Technik, Ballkontrolle, Neuer Ball, Kaufmenge.
3. **Speichern:** Autosave, Export/Import.
4. **Rating und Leiter:** Erfahrung, Rating-Balken, Karriere-Menue, Meldungen.
5. **Tiefe:** Serie, Ausdauer, Plaetze, Trainer, Ausruestung, Meilenstein-Boni.
6. **Aussehen:** Spieler-Outfits pro Kapitel, Hintergruende, Effekte, Sound.
7. **Handy-Layout** und Feinschliff.
8. **Balancing** mit der Simulation.
9. **Veroeffentlichen** auf GitHub Pages.

---

## 11. Fertiger Prompt zum Bauen

> Kopiere alles zwischen den Linien und gib es einer KI (z. B. Claude Code) zusammen mit dieser Datei.

---

Baue das Browser-Spiel **"Wallball Legend"** nach dem Plan in `wallball-legend-plan.md`. Halte dich genau an den Plan.

**Kurzfassung:** Pixeliges Fussball-Idle-Spiel. Ein unbekannter 14-jaehriger Strassenkicker namens Ravi aus Mumbai passt automatisch Baelle gegen eine Wand. Erfolgreiche Paesse bringen Trainingspunkte (TP) und Erfahrung. Mit TP kauft man unendlich steigerbare Upgrades (Passtempo, Technik, Ballkontrolle, Ausdauer, Neuer Ball) sowie einmalige Trainingsplaetze, Trainer und Ausruestung. Aus der Erfahrung ergibt sich ein Rating von 1 bis 99 und danach endlos weiter. Auf dem Weg ueberholt Ravi echte Fussballer als Vorbilder; Messi ist bei Rating 99 und soll erst nach etwa 120–150 Stunden aktiver Spielzeit erreichbar sein.

**Pflicht:**
- Reines HTML, CSS und JavaScript ohne Build-Schritt, lauffaehig direkt auf GitHub Pages. Dateistruktur wie in Abschnitt 9.
- Canvas-Szene in 320x180, scharf hochskaliert. Alle Sprites im Code aus Pixel-Arrays gezeichnet. Keine Portraets echter Spieler, keine Vereinslogos.
- Mehrere Baelle gleichzeitig sichtbar (max. 12 gezeichnet, darueber ein Zaehler), versetzt getaktet, mit Annahme, Pass, Wandaufprall, Rueckweg und sichtbaren Fehlpaessen.
- Kein Offline-Fortschritt: Pause bei verstecktem Tab, Zeitschritt pro Frame auf 1 Sekunde begrenzt.
- `break_infinity.js` fuer alle grossen Zahlen. Zahlenformat umschaltbar.
- Speichern in localStorage mit Autosave, Versionsnummer, Export/Import und Loeschen mit Sicherheitsabfrage.
- Upgrades, Kapitel und Vorbilder-Leiter als Daten in eigenen Dateien, damit Namen und Werte leicht anpassbar sind.
- Layout fuer Desktop (Szene links, Upgrades rechts) und Handy (Szene oben, Navigationsleiste unten) wie in Abschnitt 8.
- Menues: Upgrades, Karriere, Statistik, Einstellungen.
- Sichtbare Entwicklung von Ravi pro Kapitel (Kleidung, Schuhe, fluessigere Animation) und neue Trainingsplaetze als Hintergruende.
- Rueckmeldungen: schwebende Zahlen, Rating-Aufstieg, "Du hast ... ueberholt!", Kapitel-Feier, abschaltbare Soundeffekte per Web Audio.
- Schreibe `tools/simulate.js` und stimme die Konstanten so ab, dass die Zielzeiten aus Abschnitt 4 ungefaehr erreicht werden. Gib die Ergebnisse der Simulation am Ende aus.
- Alle Texte im Spiel auf Deutsch. Code sauber kommentiert.

Baue in der Reihenfolge aus Abschnitt 10 und teste nach jedem Schritt, dass das Spiel im Browser laeuft.

---

## 12. Offene Fragen (bitte beantworten, bevor gebaut wird)

1. **Ravi ueberholt die Stars** (so steht es jetzt im Plan) – oder willst du, dass man **nacheinander die echten Spieler selbst spielt** (erst ein schwacher Spieler, dann der naechste, am Ende Messi)?
2. Passt der Name **Ravi aus Mumbai**, oder willst du einen anderen Namen / ein anderes Land?
3. Soll der Spielname **"Wallball Legend"** bleiben?
4. Sind ca. **120–150 Stunden bis Messi** richtig, oder soll es schneller/langsamer gehen?
5. Soll spaeter (Version 2) ein **freiwilliger Neustart mit dauerhaftem Bonus** dazukommen, z. B. "neue Saison"? Fuer Version 1 ist er nicht geplant.
