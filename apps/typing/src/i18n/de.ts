/**
 * ALLE DEUTSCHEN TEXTE der Tipptest-Seite.
 * Same structure as en.ts – TypeScript reports an error if a text is missing.
 * Like KeepLocal, the pages address visitors with "Sie"; buttons and messages avoid pronouns
 * (they also appear on the page for children). German speakers measure typing speed in
 * "Anschläge pro Minute", so that is the big number – words per minute are shown next to it.
 * The tests use German words (src/lib/words-de.ts) and the keyboard test a QWERTZ keyboard.
 */
import type { Dictionary } from './en';

const steps = [
  'Klicken Sie in das Feld und tippen Sie das markierte Wort. Die Zeit läuft ab dem ersten Tastendruck.',
  'Drücken Sie nach jedem Wort die Leertaste. Grüne Wörter sind richtig, rote falsch.',
  'Wenn die Zeit um ist, sehen Sie Ihre Anschläge und Wörter pro Minute, Ihre Genauigkeit und Ihre Bestleistung.',
];

export const de: Dictionary = {
  pages: {
    home: {
      slug: '',
      name: 'Tipptest',
      short: 'Ihre Tippgeschwindigkeit in einer Minute.',
      title: 'Tipptest – Schreibgeschwindigkeit testen (Anschläge/Min.)',
      description:
        'Wie schnell tippen Sie? Kostenloser Tipptest mit deutschen Wörtern: Anschläge pro Minute, Wörter pro Minute und Genauigkeit. Ohne Anmeldung, 30 Sekunden bis 5 Minuten.',
      h1: 'Tipptest: Schreibgeschwindigkeit testen',
      lead: 'Tippen Sie die Wörter so schnell und so genau wie möglich – die Zeit läuft ab dem ersten Tastendruck. Nach einer Minute sehen Sie, wie viele Anschläge und Wörter Sie pro Minute schaffen.',
      test: { duration: 60, durations: [30, 60, 120, 180, 300] },
      steps,
      faq: [
        {
          q: 'Wie viele Anschläge pro Minute sind gut?',
          a: 'Die meisten Erwachsenen tippen etwa 200 Anschläge pro Minute, das sind rund 40 Wörter. 250 bis 350 Anschläge gelten als schnell, ab etwa 400 tippen Sie auf dem Niveau geübter Profis. Achten Sie auch auf die Genauigkeit: 95 % oder mehr sind ein gutes Ziel.',
        },
        {
          q: 'Wie werden Anschläge und Wörter pro Minute berechnet?',
          a: 'Jedes richtig getippte Zeichen zählt als ein Anschlag, auch die Leertaste nach einem Wort; ein Großbuchstabe zählt als ein Anschlag. Für die Wörter pro Minute gelten, wie international üblich, je fünf Anschläge als ein Wort. Falsch getippte Wörter zählen nicht mit.',
        },
        {
          q: 'Wie kann ich schneller tippen?',
          a: 'Lernen Sie das 10-Finger-System: Die Finger liegen auf der Grundreihe (A S D F und J K L Ö), der Blick bleibt auf dem Bildschirm. Üben Sie jeden Tag ein paar Minuten – unsere kostenlosen Lektionen unter „Tippen üben“ helfen dabei.',
        },
        {
          q: 'Warum kommt im Test kein ß vor?',
          a: 'Damit der Test in Deutschland, Österreich und der Schweiz gleich fair ist: Schweizer Tastaturen haben keine ß-Taste, und in der Schweiz schreibt man ohnehin „ss“. Deshalb verwenden wir nur Wörter, die überall gleich geschrieben werden. Umlaute wie ä, ö und ü kommen dagegen vor.',
        },
        {
          q: 'Wird meine Bestleistung gespeichert?',
          a: 'Ja, in Ihrem eigenen Browser auf diesem Gerät. Nichts wird an einen Server gesendet, und Sie brauchen kein Konto.',
        },
        {
          q: 'Kann ich den Test auf dem Handy machen?',
          a: 'Ja, der Test funktioniert auch mit der Bildschirmtastatur – auf einer echten Tastatur tippen die meisten aber deutlich schneller.',
        },
      ],
    },
    threeMinutes: {
      slug: '3-minuten-tipptest',
      name: '3-Minuten-Test',
      short: 'Ein längerer Test für Ihr echtes Tempo.',
      title: '3-Minuten-Tipptest – Ihre echte Schreibgeschwindigkeit',
      description:
        'Kostenloser 3-Minuten-Tipptest mit deutschen Wörtern: Ihr echtes Tempo in Anschlägen und Wörtern pro Minute. Gute Übung für Schreibtests bei Bewerbungen.',
      h1: '3-Minuten-Tipptest',
      lead: 'Länger als die übliche Minute – ein schneller Start oder ein einzelner Fehler fällt weniger ins Gewicht. Halten Sie drei Minuten lang ein gleichmäßiges Tempo und sehen Sie Ihre echte Tippgeschwindigkeit.',
      test: { duration: 180, durations: [60, 180, 300] },
      steps,
      faq: [
        {
          q: 'Warum 3 Minuten statt 1 Minute?',
          a: 'In einer Minute verändern ein schneller Start oder ein einziger Patzer das Ergebnis stark. Drei Minuten zeigen das Tempo, das Sie wirklich halten können – genau das interessiert Arbeitgeber und Schreibkurse.',
        },
        {
          q: 'Was ist ein gutes Ergebnis für 3 Minuten?',
          a: 'Rund 200 Anschläge pro Minute (etwa 40 Wörter) sind Durchschnitt. Für viele Bürojobs werden um die 200 Anschläge bei hoher Genauigkeit erwartet, in der Datenerfassung oft mehr.',
        },
        {
          q: 'Kann ich den Test pausieren?',
          a: 'Nein – wie bei einem echten Schreibtest läuft die Uhr weiter. Mit Esc oder „Neu starten“ beginnen Sie von vorn.',
        },
      ],
    },
    fiveMinutes: {
      slug: '5-minuten-tipptest',
      name: '5-Minuten-Test',
      short: 'Die klassische Länge für Schreibtests im Job.',
      title: '5-Minuten-Tipptest – Anschläge pro Minute und Fehler',
      description:
        'Kostenloser 5-Minuten-Tipptest, die klassische Länge für Schreibtests bei Bewerbungen. Mit Anschlägen und Wörtern pro Minute, Genauigkeit und Ihren Fehlerwörtern.',
      h1: '5-Minuten-Tipptest',
      lead: 'Fünf Minuten zeigen Ihre wahre Tippgeschwindigkeit und Ausdauer. Setzen Sie sich bequem hin, lassen Sie den Blick auf dem Text und tippen Sie in einem Tempo, das Sie halten können.',
      test: { duration: 300, durations: [60, 180, 300] },
      steps,
      faq: [
        {
          q: 'Warum dauern Schreibtests im Job oft 5 Minuten?',
          a: 'Fünf Minuten sind lang genug, um zu zeigen, wie schnell und genau Sie über längere Zeit tippen – nicht nur in einem kurzen Sprint. Genau das brauchen Sie im Arbeitsalltag.',
        },
        {
          q: 'Wie bereite ich mich auf einen Schreibtest vor?',
          a: 'Üben Sie täglich 10 bis 15 Minuten, achten Sie zuerst auf Genauigkeit und dann auf Tempo, und machen Sie einige Probetests in derselben Länge wie der echte Test.',
        },
        {
          q: 'Werden Fehler gezählt?',
          a: 'Ja. Falsche Wörter zählen nicht zu Ihren Anschlägen, und jeder falsche Tastendruck senkt Ihre Genauigkeit. Am Ende sehen Sie, welche Wörter Sie üben sollten.',
        },
      ],
    },
    practice: {
      slug: 'tippen-ueben',
      name: 'Tippen üben',
      short: 'Kurze Lektionen für jede Tastenreihe.',
      title: 'Tippen üben – 10-Finger-System lernen (kostenlos)',
      description:
        'Kostenlos tippen üben mit kurzen Lektionen für das 10-Finger-System: Grundreihe, obere und untere Reihe, Zahlen und Satzzeichen. Ohne Zeitlimit, für QWERTZ-Tastaturen.',
      h1: 'Tippen üben mit dem 10-Finger-System',
      lead: 'Wählen Sie eine Lektion und tippen Sie in Ihrem eigenen Tempo – ohne Zeitlimit. Beginnen Sie mit der Grundreihe und arbeiten Sie sich bis zu ganzen Sätzen vor.',
      test: { duration: 0, lessons: true },
      steps: [
        'Wählen Sie eine Lektion, zum Beispiel „Grundreihe“.',
        'Tippen Sie die Wörter und drücken Sie nach jedem Wort die Leertaste. Es gibt kein Zeitlimit.',
        'Nach dem letzten Wort sehen Sie Tempo und Genauigkeit. Wiederholen Sie die Lektion, bis sie leichtfällt, und nehmen Sie dann die nächste.',
      ],
      faq: [
        {
          q: 'Was ist die Grundreihe?',
          a: 'Die mittlere Reihe der Buchstabentasten. Beim 10-Finger-System liegen die Finger der linken Hand auf A S D F und die der rechten Hand auf J K L Ö, die Daumen ruhen auf der Leertaste. Auf F und J sind kleine Erhebungen, damit Sie die Grundstellung ohne Hinsehen finden.',
        },
        {
          q: 'Wie lange sollte ich täglich üben?',
          a: 'Zehn bis zwanzig Minuten am Tag reichen völlig. Kurze, regelmäßige Übungen prägen sich besser ein als eine lange Sitzung pro Woche.',
        },
        {
          q: 'Soll ich auf Tempo oder auf Genauigkeit achten?',
          a: 'Zuerst auf Genauigkeit. Das Tempo kommt von selbst, sobald Ihre Finger wissen, wo die Tasten liegen – und Fehler zu korrigieren kostet mehr Zeit, als etwas langsamer zu tippen.',
        },
      ],
    },
    kids: {
      slug: 'tipptest-fuer-kinder',
      name: 'Tipptest für Kinder',
      short: 'Kurze Wörter in großer Schrift.',
      title: 'Tipptest für Kinder – einfache Wörter, große Schrift',
      description:
        'Kostenloser Tipptest für Kinder mit kurzen, einfachen deutschen Wörtern in großer Schrift. Mit Anschlägen pro Minute und eigenem Rekord. Ohne Anmeldung und ohne Werbung.',
      h1: 'Tipptest für Kinder',
      lead: 'Kurze, einfache Wörter in großer Schrift: Wort abtippen, Leertaste drücken, weiter geht’s. Wer knackt den eigenen Rekord?',
      test: { duration: 60, durations: [60, 120], words: 'kids', large: true },
      noAds: true,
      steps: [
        'Das markierte Wort abtippen und dann die Leertaste drücken.',
        'Grüne Wörter sind richtig. Rote Wörter waren falsch – kein Problem, einfach weitertippen!',
        'Wenn die Zeit um ist, zeigt der Test die Anschläge pro Minute. Gleich nochmal versuchen und den eigenen Rekord schlagen!',
      ],
      faq: [
        {
          q: 'Wie schnell tippen Kinder?',
          a: 'Das hängt vom Alter und von der Übung ab. Viele Kinder beginnen mit 25 bis 75 Anschlägen pro Minute, ältere Kinder mit Übung schaffen oft 100 bis 200. Das beste Ziel ist, den eigenen Rekord zu schlagen.',
        },
        {
          q: 'Ist die Seite für Kinder geeignet?',
          a: 'Ja. Auf dieser Seite gibt es keine Werbung, keine Anmeldung und keinen Chat. Ergebnisse werden nur im Browser auf Ihrem Gerät gespeichert.',
        },
        {
          q: 'Warum beginnen manche Wörter mit einem Großbuchstaben?',
          a: 'Weil Nomen im Deutschen großgeschrieben werden – genau wie in der Schule. So üben Kinder gleich die richtige Rechtschreibung und lernen nebenbei die Umschalttaste kennen.',
        },
        {
          q: 'Wie lernen Kinder schneller tippen?',
          a: 'Wenig, aber oft: Zehn Minuten am Tag bringen mehr als eine lange Übungsstunde. Am besten mit der Lektion „Grundreihe“ unter „Tippen üben“ beginnen und versuchen, nicht auf die Tasten zu schauen.',
        },
      ],
    },
    keyboard: {
      slug: 'tastaturtest',
      name: 'Tastaturtest',
      short: 'Prüfen, ob jede Taste funktioniert.',
      title: 'Tastaturtest – Tastatur online testen (QWERTZ)',
      description:
        'Testen Sie Ihre Tastatur online: Taste drücken und sehen, ob sie reagiert. Defekte und klemmende Tasten oder Ghosting in Sekunden finden. Mit QWERTZ-Layout (DE, AT, CH).',
      h1: 'Tastaturtest',
      lead: 'Drücken Sie die Tasten Ihrer Tastatur nacheinander. Jede Taste, die funktioniert, wird gelb. Tasten, die weiß bleiben, sind möglicherweise defekt.',
      steps: [
        'Klicken Sie auf das Tastaturbild (auf den meisten Computern ist es schon aktiv).',
        'Drücken Sie jede Taste, die Sie testen möchten. Funktionierende Tasten werden gelb, eine gedrückt gehaltene Taste erscheint eingedrückt.',
        'Tasten, die weiß bleiben, sind vielleicht defekt – oder fehlen auf Ihrer Tastatur. Mit „Zurücksetzen“ beginnen Sie von vorn.',
      ],
      faq: [
        {
          q: 'Warum wird eine Taste nicht gelb?',
          a: 'Die Taste kann defekt sein, oder der Computer nutzt sie für etwas anderes – Tasten wie Druck oder die Windows-Taste fängt oft das System ab. Tasten, die nicht im Bild sind, erscheinen trotzdem unter „Letzte Taste“.',
        },
        {
          q: 'Wie teste ich auf Ghosting?',
          a: 'Halten Sie mehrere Tasten gleichzeitig gedrückt. Jede gehaltene Taste sollte eingedrückt aussehen. Wenn eine nicht reagiert, kann Ihre Tastatur nicht so viele Tasten auf einmal erkennen.',
        },
        {
          q: 'Funktioniert der Test mit Laptop- und Funktastaturen?',
          a: 'Ja, mit jeder Tastatur, die Ihr Computer erkennt. Nichts wird installiert, und nichts, was Sie tippen, verlässt Ihr Gerät.',
        },
        {
          q: 'Ich habe eine Schweizer Tastatur. Funktioniert der Test?',
          a: 'Ja. Wählen Sie über dem Bild „Schweiz“, dann zeigt es die Schweizer Beschriftung, zum Beispiel ü, ö, ä und $. Der Test prüft ohnehin die Tasten an ihrer Position: Die Taste an derselben Stelle wird gelb, egal was darauf steht.',
        },
        {
          q: 'Warum leuchtet bei AltGr auch Strg auf?',
          a: 'Windows meldet die AltGr-Taste als Strg plus Alt. Das ist normal und kein Defekt Ihrer Tastatur.',
        },
      ],
    },
  },

  test: {
    measure: 'cpm',
    length: 'Testdauer',
    seconds: '{n} Sek.',
    minutes: '{n} Min.',
    lesson: 'Lektion',
    time: 'Zeit',
    inputLabel: 'Markiertes Wort tippen, dann Leertaste drücken',
    placeholder: 'Hier tippen, um zu starten',
    restart: 'Neu starten',
    restartTitle: 'Neu starten (Esc)',
    result: 'Ergebnis',
    wpm: 'Wörter pro Minute',
    cpm: 'Anschläge pro Minute',
    accuracy: 'Genauigkeit',
    correct: 'Richtige Wörter',
    wrong: 'Falsche Wörter',
    best: 'Bestleistung',
    again: 'Nochmal',
    share: 'Ergebnis teilen',
    bestSoFar: 'Bestleistung bisher: {best}',
    bestValue: '{n} Anschläge/Min.',
    newBest: 'Neue Bestleistung.',
    mistakes: 'Diese Wörter üben: {words}',
    shareText: 'Ich tippe {cpm} Anschläge pro Minute ({wpm} Wörter pro Minute) mit {accuracy} % Genauigkeit. Wer ist schneller?',
    copied: 'Kopiert! Einfach einfügen und andere herausfordern.',
  },

  lessons: {
    common: 'Häufige Wörter',
    home: 'Grundreihe (A S D F …)',
    top: 'Obere Reihe (Q W E R …)',
    bottom: 'Untere Reihe (Y X C V …)',
    numbers: 'Zahlen',
    sentences: 'Großbuchstaben & Satzzeichen',
  },

  // The same levels as in English (90, 70, 50, 35 and 20 words per minute = 450 … 100 Anschläge)
  ratings: [
    'Profi-Niveau. Schneller als fast alle anderen.',
    'Sehr schnell. Deutlich schneller als die meisten.',
    'Schnell. Über dem Durchschnitt.',
    'Durchschnitt. Etwa so schnell wie die meisten.',
    'Auf gutem Weg. Ein paar Minuten Übung am Tag bringen schnell mehr Tempo.',
    'Anfänger. Hier fängt jeder an – dranbleiben lohnt sich.',
  ],

  keyboard: {
    board: 'qwertz',
    variants: [
      { id: 'de', name: 'Deutschland & Österreich' },
      { id: 'ch', name: 'Schweiz' },
    ],
    variantLabel: 'Tastatur',
    last: 'Letzte Taste:',
    count: 'Getestete Tasten:',
    reset: 'Zurücksetzen',
    label: 'Tastaturtest: beliebige Taste drücken. Zum Verlassen erst Esc, dann Tab drücken.',
    paused: 'Hier klicken, um die Tasten zu testen',
    space: 'Leertaste',
    dead: 'Tottaste (Akzent)',
    unknown: 'Unbekannt',
    noCode: 'kein Code',
  },

  notFound: {
    title: 'Seite nicht gefunden',
    text: 'Diese Seite gibt es nicht (mehr). Vielleicht hilft eine dieser Seiten weiter:',
  },
};
