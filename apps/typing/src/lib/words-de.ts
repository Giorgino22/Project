/**
 * German word lists for the typing test (the English ones are in words.ts). Our own lists of
 * everyday words – no quotes, lyrics or book text. Add or remove words freely: one space between
 * words, line breaks don't matter.
 *
 * Rules, so the test is fair in Germany, Austria AND Switzerland (tests/unit/typing.test.ts checks them):
 * - Nouns start with a capital letter, as in any German text.
 * - Umlauts (ä ö ü) are welcome inside words, but no word STARTS with one: on Swiss keyboards
 *   Shift + ü gives è, so Ü, Ö and Ä are awkward to type there.
 * - No ß: Swiss keyboards have no ß key, and Swiss German always writes "ss". Words like
 *   "dass", "Wasser" or "essen" are written the same everywhere, so they are fine.
 */

/** Splits "eins zwei drei" into ['eins', 'zwei', 'drei']. */
const list = (text: string): string[] => text.trim().split(/\s+/);

/** Frequent German words – the words people type most in real life. */
export const germanCommonWords = list(`
  der die das und ist nicht ein eine einen einem einer ich du er sie es wir ihr mit auf für von zu
  den dem des im in an als auch so wie aber oder wenn dann noch nur schon mehr sehr hier dort da was
  wer wo wann warum wieder immer heute morgen gestern jetzt bald nie oft ganz gern viel viele wenig
  alle alles nichts etwas jeder jede man mein dein unser kein keine ob weil dass denn doch also nach
  bei aus vor seit bis ohne gegen unter zwischen neben hinter durch um zum zur am vom beim sich mir
  mich dir dich uns euch ihm ihn ihnen selbst vielleicht eigentlich trotzdem zusammen zuerst danach
  endlich genug fast kaum sogar wirklich natürlich leider
  sein haben werden können müssen sollen wollen dürfen möchten machen sagen gehen kommen sehen geben
  nehmen finden denken wissen lassen stehen liegen bleiben bringen halten spielen lernen lesen
  schreiben hören fragen antworten arbeiten wohnen leben laufen fahren fliegen essen trinken kochen
  kaufen zahlen helfen zeigen suchen warten tragen fallen beginnen lachen singen tanzen schlafen
  träumen glauben brauchen kennen rufen schicken bauen malen zählen wählen fühlen gehören erklären
  verstehen erzählen vergessen gewinnen verlieren teilen besuchen bekommen benutzen versuchen treffen
  sitzen stellen legen ziehen drücken tippen schauen
  gut neu alt klein lang kurz hoch tief schön schnell langsam früh spät leicht schwer warm kalt hell
  dunkel laut leise jung stark weich hart einfach richtig falsch wichtig möglich klar frei voll leer
  rund blau rot grün gelb schwarz grau braun ruhig fertig bereit sicher genau gleich froh müde lustig
  nett klug wach teuer billig sauber besser letzte nächste erste zweite
  Zeit Jahr Tag Woche Monat Stunde Minute Abend Nacht Haus Wohnung Zimmer Küche Tisch Stuhl Fenster
  Tür Garten Baum Blume Wald Berg See Meer Fluss Insel Himmel Sonne Mond Stern Regen Schnee Wind
  Wetter Wasser Feuer Erde Luft Stadt Dorf Land Welt Weg Brücke Bahnhof Zug Auto Fahrrad Bus Schiff
  Flugzeug Kind Frau Mann Mutter Vater Bruder Schwester Familie Freund Freundin Name Mensch Leute Hand
  Kopf Auge Herz Gesicht Stimme Schule Lehrer Klasse Buch Brief Seite Wort Satz Sprache Frage Antwort
  Idee Problem Grund Beispiel Arbeit Firma Geld Preis Markt Laden Brot Käse Kaffee Tee Milch Apfel
  Kuchen Suppe Glas Tasse Teller Musik Lied Film Bild Farbe Spiel Ball Hund Katze Pferd Vogel Fisch
  Tier Telefon Handy Computer Tastatur Bildschirm Nummer Zahl Teil Ende Anfang Moment Leben Liebe
  Glück Ferien Reise Urlaub Sommer Winter Frühling Herbst Montag Freitag Sonntag Licht Papier Stift
  Tasche Schlüssel Uhr Jacke Schuh Hose Platz Park Kirche Post Bank Arzt Hilfe Sport Team Ergebnis
  Plan Ziel Stück Gruppe Projekt Termin Nachricht Geschichte Zukunft Ruhe Frühstück Mittag Wochenende
  Ecke Mitte Richtung Ort Raum Boden Wand Dach Bett Sofa Lampe Spiegel Kino Theater Konzert Museum
  Hotel Pause Feier Geschenk Karte Foto Koffer Fahrt Ausflug Mannschaft Punkt Regel Aufgabe Prüfung
  Lösung Fehler
`);

/** Short, easy words for the kids test. */
export const germanKidWords = list(`
  Hund Katze Maus Ball Baum Haus Auto Bus Zug Boot Sonne Mond Stern Eis Hut Bär Kuh Pferd Fisch Vogel
  Ente Igel Hase Löwe Affe Schaf Ziege Apfel Birne Kuchen Brot Milch Saft Nase Mund Hand Bein Ohr Oma
  Opa Mama Papa Buch Bett Tisch Rad Ring Tor Nest Berg See Schnee Regen Wolke Blume Uhr Puppe Tasse
  Garten Schule Freund Spiel Lied Bild Farbe Pizza Zoo Wald Hof Dach Tür Tag Nacht Kind Ei
  rot blau grün gelb klein lieb froh nett gut neu alt warm kalt hell
  spielen malen singen lachen hüpfen rennen lesen essen schlafen tanzen baden kochen
  ja nein und mit auf
`);

/**
 * The home row of the 10-finger system on a German or Swiss keyboard: A S D F and J K L Ö.
 * Real words that only need these keys (and G, H, Ä between them), plus the classic finger drills.
 */
export const germanHomeRowWords = list(`
  als da das dass ja lass falls fad kahl half sag sah las lag all fass
  asdf jklö fjfj dkdk slsl aöaö ghgh fdsa
`);

/** Words for the bottom row (Y X C V B N M) – mixed with home row keys, because words need vowels. */
export const germanBottomRowWords = list(`
  an man kann dann bald mal nach nah flach schmal schlank lang damals manchmal fand band gab mag sank
  dank blass nass lahm manch längs mach lach ab hab schlaff
`);
