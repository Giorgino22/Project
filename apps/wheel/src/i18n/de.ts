/**
 * ALLE DEUTSCHEN TEXTE der Glücksrad-Seite.
 * Same structure as en.ts – TypeScript reports an error if a text is missing.
 * Like KeepLocal, the pages address visitors with "Sie"; buttons and messages avoid pronouns.
 * Titles, slugs and descriptions use what German speakers search for: "Glücksrad",
 * "Namen auslosen", "Zufallsrad", "Ja oder Nein", "Teams einteilen", "Stadt, Land, Fluss".
 */
import { letters, numbers, type Dictionary } from './en';

export const de: Dictionary = {
  pages: {
    home: {
      slug: '',
      name: 'Glücksrad',
      short: 'Namen eintragen, drehen, Gewinner steht fest.',
      title: 'Glücksrad online – Namen zufällig auslosen (kostenlos)',
      description:
        'Kostenloses Glücksrad: Namen oder Begriffe eintragen, Rad drehen und zufällig auslosen. Ohne Anmeldung, für Handy und Beamer – und per Link teilbar.',
      h1: 'Glücksrad online',
      lead: 'Tragen Sie Namen oder Optionen ein, klicken Sie auf „Drehen“ und lassen Sie das Zufallsrad entscheiden. Ideal für den Unterricht, Verlosungen, Spieleabende und schwierige Entscheidungen.',
      preset: ['Anna', 'Ben', 'Clara', 'David', 'Emma', 'Finn', 'Lena', 'Noah'],
      steps: [
        'Tragen Sie Ihre Einträge in das Feld ein – einen Namen oder eine Option pro Zeile.',
        'Klicken Sie auf das Rad oder auf „Drehen“. Das Glücksrad lost zufällig einen Gewinner aus.',
        'Entfernen Sie den Gewinner oder drehen Sie noch einmal. Mit „Link kopieren“ teilen Sie Ihr Glücksrad mit anderen.',
      ],
      faq: [
        {
          q: 'Ist das Glücksrad wirklich zufällig?',
          a: 'Ja. Der Gewinner wird mit dem kryptografischen Zufallsgenerator Ihres Browsers ausgelost, jeder Eintrag hat also genau die gleiche Chance. Die Animation hält immer beim ausgelosten Gewinner an.',
        },
        {
          q: 'Wie viele Einträge passen auf das Rad?',
          a: 'Bis zu 500. Ab etwa 100 Einträgen wird die Schrift klein, das Glücksrad funktioniert aber weiterhin.',
        },
        {
          q: 'Werden meine Einträge gespeichert?',
          a: 'Nur in Ihrem eigenen Browser, damit sie beim nächsten Besuch noch da sind. Nichts wird an einen Server gesendet. Wenn Sie einen Link teilen, stehen die Einträge im Link selbst.',
        },
        {
          q: 'Kann ich das Glücksrad im Unterricht am Beamer nutzen?',
          a: 'Ja – mit „Vollbild“ erscheint das Rad groß auf dem ganzen Bildschirm, und das Klickgeräusch lässt sich ein- und ausschalten.',
        },
        {
          q: 'Kann derselbe Name zweimal gewinnen?',
          a: 'Nur wenn er auf dem Rad bleibt. Klicken Sie nach dem Drehen auf „Vom Rad entfernen“, um den Gewinner herauszunehmen – so losen Sie zum Beispiel eine Reihenfolge aus.',
        },
      ],
    },
    yesNo: {
      slug: 'ja-nein-gluecksrad',
      name: 'Ja-oder-Nein-Rad',
      short: 'Zufällig Ja oder Nein erdrehen.',
      title: 'Ja oder Nein Glücksrad – drehen und entscheiden lassen',
      description:
        'Sie können sich nicht entscheiden? Drehen Sie das Ja-oder-Nein-Rad für eine zufällige Antwort. Auch mit „Vielleicht“ oder eigenen Optionen. Kostenlos und sofort.',
      h1: 'Ja oder Nein Glücksrad',
      lead: 'Stellen Sie Ihre Frage, drehen Sie das Rad und erhalten Sie ein zufälliges Ja oder Nein. Mehr Möglichkeiten gewünscht? Ergänzen Sie „Vielleicht“ oder etwas ganz anderes.',
      preset: ['Ja', 'Nein'],
      steps: [
        'Überlegen Sie sich eine Frage, die sich mit Ja oder Nein beantworten lässt.',
        'Klicken Sie auf „Drehen“ – das Rad bleibt zufällig bei Ja oder Nein stehen.',
        'Wenn Sie möchten, ergänzen Sie weitere Antworten wie „Vielleicht“ oder „Morgen nochmal fragen“.',
      ],
      faq: [
        {
          q: 'Steht die Chance wirklich 50:50?',
          a: 'Ja. Mit Ja und Nein auf dem Rad hat jede Antwort genau 50 % Wahrscheinlichkeit. Mit weiteren Einträgen ändern Sie die Chancen – zwei Zeilen „Ja“ machen ein Ja doppelt so wahrscheinlich.',
        },
        {
          q: 'Kann ich „Vielleicht“ hinzufügen?',
          a: 'Natürlich – schreiben Sie es in eine neue Zeile, und es erscheint sofort auf dem Rad.',
        },
        {
          q: 'Wofür eignet sich das Ja-oder-Nein-Rad?',
          a: 'Für schnelle Entscheidungen, Partyspiele oder die Frage, ob es heute Pizza gibt – immer dann, wenn eine Münze zu langweilig ist.',
        },
      ],
    },
    numbers: {
      slug: 'zahlen-gluecksrad',
      name: 'Zahlen-Glücksrad',
      short: 'Eine Zufallszahl in jedem Bereich.',
      title: 'Zahlen-Glücksrad – Zufallszahl von 1 bis 100 drehen',
      description:
        'Drehen Sie ein Rad voller Zahlen und erhalten Sie eine Zufallszahl – von 1 bis 10, 1 bis 100 oder in jedem anderen Bereich. Für Spiele, Verlosungen und die Schule.',
      h1: 'Zahlen-Glücksrad',
      lead: 'Wählen Sie einen Bereich, erstellen Sie das Rad und drehen Sie eine Zufallszahl – ideal für Verlosungen, Spiele oder um im Unterricht eine Nummer aufzurufen.',
      preset: numbers,
      steps: [
        'Geben Sie die kleinste und die größte Zahl ein und klicken Sie auf „Rad erstellen“.',
        'Klicken Sie auf „Drehen“, um eine Zufallszahl zu ziehen.',
        'Entfernen Sie gezogene Zahlen vom Rad, damit keine doppelt kommt – praktisch für Tombola und Verlosung.',
      ],
      faq: [
        {
          q: 'Wie viele Zahlen passen auf das Rad?',
          a: 'Bis zu 200. Für eine Verlosung mit mehr Losen entfernen Sie gezogene Zahlen nach und nach oder nutzen mehrere Räder.',
        },
        {
          q: 'Lassen sich doppelte Zahlen vermeiden?',
          a: 'Ja – klicken Sie nach jedem Drehen auf „Vom Rad entfernen“.',
        },
        {
          q: 'Ist jede Zahl gleich wahrscheinlich?',
          a: 'Ja. Die Ziehung nutzt den kryptografischen Zufallsgenerator Ihres Browsers.',
        },
      ],
    },
    letters: {
      slug: 'buchstaben-gluecksrad',
      name: 'Buchstaben-Glücksrad',
      short: 'Ein zufälliger Buchstabe von A bis Z.',
      title: 'Buchstaben-Glücksrad – Zufallsbuchstabe von A bis Z',
      description:
        'Drehen Sie das Buchstabenrad und erhalten Sie einen zufälligen Buchstaben von A bis Z – perfekt für Stadt, Land, Fluss, Wortspiele und den Unterricht. Kostenlos.',
      h1: 'Buchstaben-Glücksrad (A–Z)',
      lead: 'Drehen Sie das Alphabet und erhalten Sie einen zufälligen Buchstaben – für Stadt, Land, Fluss, Rechtschreibübungen und Quizrunden.',
      preset: letters,
      steps: [
        'Auf dem Rad stehen bereits alle 26 Buchstaben.',
        'Klicken Sie auf „Drehen“, um einen zufälligen Buchstaben zu erhalten.',
        'Löschen Sie Buchstaben, die Sie nicht möchten, etwa Q, X oder Y – so wird das Spiel leichter.',
      ],
      faq: [
        {
          q: 'Kann ich schwierige Buchstaben entfernen?',
          a: 'Ja – löschen Sie sie einfach aus der Liste, zum Beispiel Q, X und Y. Bei Stadt, Land, Fluss lassen viele Runden genau diese Buchstaben weg.',
        },
        {
          q: 'Kann ich Umlaute oder andere Zeichen verwenden?',
          a: 'Ja, tragen Sie beliebige Buchstaben oder Zeichen ein, jeweils einen pro Zeile – zum Beispiel Ä, Ö und Ü.',
        },
        {
          q: 'Für welche Spiele eignet sich ein Buchstabenrad?',
          a: 'Für Stadt, Land, Fluss, Kategorienspiele („ein Tier mit B“), Wortketten, Rechtschreibübungen und als Entscheidung bei Gleichstand im Quiz.',
        },
      ],
    },
    teams: {
      slug: 'teamgenerator',
      name: 'Teamgenerator',
      short: 'Namen fair in Teams aufteilen.',
      title: 'Teamgenerator – Teams und Gruppen zufällig einteilen',
      description:
        'Namensliste einfügen und mit einem Klick zufällige Teams oder Gruppen bilden. Anzahl der Teams oder Personen pro Team wählen. Kostenlos, schnell und privat.',
      h1: 'Teamgenerator: Teams zufällig einteilen',
      lead: 'Fügen Sie die Namen ein, wählen Sie die Anzahl der Teams und erhalten Sie sofort faire, zufällige Teams – für Sport, Gruppenarbeiten in der Schule und Spieleabende.',
      preset: ['Anna', 'Ben', 'Clara', 'David', 'Emma', 'Finn', 'Lena', 'Noah'],
      steps: [
        'Fügen Sie die Namen ein oder tippen Sie sie ab, einen pro Zeile.',
        'Wählen Sie die Anzahl der Teams – oder wie viele Personen in ein Team sollen.',
        'Klicken Sie auf „Teams bilden“. Nicht zufrieden? Mit „Neu mischen“ erhalten Sie neue zufällige Teams.',
      ],
      faq: [
        {
          q: 'Sind die Teams fair?',
          a: 'Die Namen werden zufällig gemischt und wie Spielkarten verteilt. Die Teams unterscheiden sich daher höchstens um eine Person.',
        },
        {
          q: 'Kann ich stattdessen die Teamgröße festlegen?',
          a: 'Ja – wählen Sie „Personen pro Team“, dann berechnet der Generator selbst, wie viele Teams nötig sind.',
        },
        {
          q: 'Werden die Namen gespeichert?',
          a: 'Nur in Ihrem eigenen Browser, damit Sie die Liste beim nächsten Mal wiederverwenden können. Nichts wird irgendwohin gesendet.',
        },
      ],
    },
  },

  wheel: {
    spin: 'Drehen',
    spinLabel: 'Glücksrad drehen',
    fullscreen: 'Vollbild',
    soundOn: 'Ton an',
    soundOff: 'Ton aus',
    spinTime: 'Drehdauer',
    seconds: '{n} Sek.',
    from: 'Von',
    to: 'Bis',
    createWheel: 'Rad erstellen',
    entries: 'Einträge',
    placeholder: 'Ein Name oder eine Option pro Zeile',
    shuffle: 'Mischen',
    sort: 'A–Z sortieren',
    clear: 'Leeren',
    share: 'Link kopieren',
    history: 'Bisher ausgelost',
    winner: 'Das Glücksrad hat entschieden',
    again: 'Nochmal drehen',
    remove: 'Vom Rad entfernen',
    close: 'Schließen',
    empty: 'Namen eintragen und los',
    linkCopied: 'Link kopiert! Wer ihn öffnet, sieht dieses Glücksrad.',
    rangeError: 'Bitte ganze Zahlen eingeben, „Von“ kleiner als „Bis“, höchstens 200 Zahlen.',
    needTwo: 'Zum Drehen braucht das Rad mindestens zwei Einträge.',
  },

  teams: {
    names: 'Namen',
    placeholder: 'Ein Name pro Zeile',
    splitBy: 'Aufteilen nach',
    byTeams: 'Anzahl Teams',
    bySize: 'Personen pro Team',
    make: 'Teams bilden',
    again: 'Neu mischen',
    copy: 'Teams kopieren',
    team: 'Team {n}',
    needTwo: 'Bitte mindestens zwei Namen eintragen.',
    needNumber: 'Bitte eine Zahl ab 1 eingeben.',
    copied: 'Teams in die Zwischenablage kopiert.',
  },

  notFound: {
    title: 'Seite nicht gefunden',
    text: 'Diese Seite gibt es nicht (mehr). Vielleicht hilft eine dieser Seiten weiter:',
  },
};
