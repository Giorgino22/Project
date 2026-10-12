/**
 * ALLE DEUTSCHEN TEXTE der Website.
 * Same structure as en.ts – TypeScript reports an error if a text is missing.
 */
import { IMAGE_FORMATS, type ImageFormat } from '../lib/formats';
import type { Dictionary, ToolText } from './en';

export const de: Dictionary = {
  lang: 'de',
  locale: 'de_DE',
  name: 'Deutsch',

  nav: {
    skip: 'Zum Inhalt springen',
    home: 'Startseite',
    allTools: 'Alle Tools',
    language: 'Sprache',
  },

  categories: {
    pdf: 'PDF-Tools',
    image: 'Bild-Tools',
    generator: 'Generatoren',
  },

  categoryIntros: {
    pdf: 'PDFs zusammenfügen, teilen, drehen und umwandeln – auch vertrauliche.',
    image: 'Fotos komprimieren, verkleinern, umwandeln und versteckte Standortdaten entfernen.',
    generator: 'QR-Codes, Zahlungscodes und sichere Passwörter erstellen.',
  },

  badge: 'Ihre Dateien verlassen nie Ihr Gerät',

  footer: {
    about: 'Alle Tools laufen direkt in Ihrem Browser. Ihre Dateien werden nie auf einen Server hochgeladen.',
    privacy: 'Datenschutz',
    imprint: 'Impressum',
    languages: 'Sprachen',
    moreTools: 'Weitere kostenlose Tools',
    allTools: 'Alle unsere Tools',
  },

  home: {
    title: '{site} – Kostenlose PDF- & Bild-Tools ohne Upload',
    description:
      'PDFs zusammenfügen und teilen, Bilder komprimieren und umwandeln, QR-Codes und Passwörter erstellen. Kostenlos, ohne Anmeldung – alles läuft im Browser, nichts wird hochgeladen.',
    h1: 'Kostenlose PDF- & Bild-Tools, die Ihre Dateien nie hochladen',
    lead: 'PDFs zusammenfügen, Fotos komprimieren, QR-Codes erstellen und mehr. Jedes Tool läuft direkt in Ihrem Browser – Ihre Dateien bleiben auf Ihrem Gerät. Immer.',
    cta: 'Tool auswählen',
    features: [
      {
        title: 'Privat durch Technik',
        text: 'Ihre Dateien werden auf Ihrem eigenen Gerät verarbeitet. Sie werden nie hochgeladen, gespeichert oder von jemandem gesehen – auch nicht von uns.',
      },
      {
        title: 'Kostenlos & unbegrenzt',
        text: 'Keine Anmeldung, keine Wasserzeichen, keine Tageslimits. Nutzen Sie jedes Tool so oft Sie möchten.',
      },
      {
        title: 'Schnell',
        text: 'Kein Warten auf Uploads und Downloads. Die meisten Aufgaben sind in einer Sekunde erledigt – nach dem Laden der Seite sogar offline.',
      },
    ],
    verifyTitle: 'Vertrauen Sie uns nicht – prüfen Sie es selbst',
    verifyText:
      'Öffnen Sie die Entwicklertools Ihres Browsers (auf den meisten Computern mit F12), wechseln Sie zum Tab „Netzwerk“ und verwenden Sie ein beliebiges Tool. Sie werden sehen: Ihre Datei wird nirgendwohin gesendet.',
    faqTitle: 'Fragen & Antworten',
    faq: [
      {
        q: 'Wie funktionieren die Tools, ohne meine Dateien hochzuladen?',
        a: 'Moderne Browser sind leistungsfähig genug, um PDFs und Bilder selbst zu bearbeiten. Wenn Sie ein Tool öffnen, lädt Ihr Browser das Programm einmal – danach erledigt Ihr eigenes Gerät die ganze Arbeit.',
      },
      {
        q: 'Ist das wirklich kostenlos?',
        a: 'Ja. Die Seite finanziert sich durch Werbung und freiwillige Unterstützung – niemals durch den Verkauf Ihrer Daten. Es gibt keine versteckten Limits und keine kostenpflichtigen „Pro“-Versionen dieser Tools.',
      },
      {
        q: 'Muss ich etwas installieren?',
        a: 'Nein. Alles funktioniert im Browser – unter Windows, Mac und Linux, auf Android und auf dem iPhone.',
      },
      {
        q: 'Ist das sicher für vertrauliche Dokumente?',
        a: 'Ja – genau dafür ist es gemacht. Verträge, Kontoauszüge, Ausweise oder medizinische Unterlagen verlassen Ihr Gerät nie. Sie können also von keinem Server gespeichert, ausgewertet oder geleakt werden.',
      },
    ],
  },

  toolPage: {
    howTo: 'So funktioniert’s',
    faq: 'Häufige Fragen',
    related: 'Weitere kostenlose Tools',
    privacyTitle: 'Warum Ihre Dateien privat bleiben',
    privacyText:
      'Die meisten Online-Tools laden Ihre Dateien auf ihre Server hoch. Dieses nicht: Das Programm läuft in Ihrem Browser, Ihre Dateien werden also auf Ihrem eigenen Gerät verarbeitet und nirgendwohin gesendet. Nach dem Laden der Seite können Sie sogar offline gehen.',
    aboutFormats: 'Über die Formate',
    popularConversions: 'Beliebte Umwandlungen',
  },

  support: {
    title: 'Hat Ihnen das Zeit gespart?',
    text: 'Diese Seite ist kostenlos und ohne Bezahlschranke. Wenn Sie Danke sagen möchten, können Sie mir einen Kaffee spendieren.',
    button: 'Kaffee spendieren',
  },

  ads: {
    label: 'Anzeige',
    affiliateLabel: 'Anzeige · Empfehlung',
  },

  notFound: {
    title: 'Seite nicht gefunden',
    text: 'Diese Seite gibt es nicht (mehr). Vielleicht ist eines dieser Tools das Richtige:',
    home: 'Zur Startseite',
  },

  legal: {
    privacy: {
      slug: 'datenschutz',
      title: 'Datenschutzerklärung',
      description: 'Wie {site} mit Ihren Daten umgeht: Ihre Dateien werden in Ihrem Browser verarbeitet und nie hochgeladen.',
      updated: 'Stand: {date}',
      intro:
        'Kurz gesagt: Die Tools auf dieser Website verarbeiten Ihre Dateien vollständig in Ihrem Webbrowser. Ihre Dateien werden nie an uns oder an Dritte übertragen. Im Folgenden erklären wir, welche anderen Daten beim Besuch dieser Website verarbeitet werden.',
      controllerTitle: 'Verantwortliche Stelle',
      controllerText: 'Verantwortlich für die Datenverarbeitung auf dieser Website:',
      filesTitle: 'Ihre Dateien und Eingaben',
      filesText:
        'Dateien, die Sie mit unseren Tools öffnen (z. B. PDFs und Bilder), und alles, was Sie in ein Tool eingeben (z. B. QR-Code-Inhalte oder Bankdaten), werden ausschließlich auf Ihrem Gerät in Ihrem Browser verarbeitet. Sie werden weder an unsere Server noch an Dritte übertragen, und wir können sie nicht einsehen. Wenn Sie die Seite schließen, sind sie verschwunden.',
      hostingTitle: 'Hosting und Server-Logfiles',
      hostingText:
        'Diese Website wird von {hostName}, {hostAddress}, ausgeliefert. Beim Aufruf einer Seite übermittelt Ihr Browser automatisch technische Informationen wie Ihre IP-Adresse, Datum und Uhrzeit, die aufgerufene Seite und Ihren Browsertyp. Der Hoster benötigt diese Daten, um die Website auszuliefern und vor Angriffen zu schützen. Rechtsgrundlage ist unser berechtigtes Interesse an einer sicheren und zuverlässigen Website (Art. 6 Abs. 1 lit. f DSGVO). Daten können auch außerhalb der EU und der Schweiz verarbeitet werden. Weitere Informationen: {hostPrivacyUrl}',
      analyticsTitle: 'Besucherstatistik',
      analyticsText:
        'Wir verwenden Cloudflare Web Analytics, um Seitenaufrufe zu zählen. Der Dienst verwendet keine Cookies, erstellt keine Nutzerprofile und speichert keine vollständigen IP-Adressen. Rechtsgrundlage ist unser berechtigtes Interesse daran, zu erfahren, welche Tools genutzt werden (Art. 6 Abs. 1 lit. f DSGVO).',
      adsTitle: 'Werbung (Google AdSense)',
      adsText:
        'Damit die Tools kostenlos bleiben, zeigen wir Anzeigen von Google AdSense, einem Dienst der Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland. Google kann Cookies und ähnliche Technologien verwenden, um Anzeigen auszuspielen und ihre Wirkung zu messen. Personalisierte Anzeigen werden nur angezeigt, wenn Sie im Einwilligungs-Banner zustimmen; Ihre Auswahl können Sie jederzeit ändern. Dabei können Daten an die Google LLC in den USA übertragen werden. Weitere Informationen: https://policies.google.com/technologies/ads',
      affiliateTitle: 'Affiliate-Links',
      affiliateText:
        'Einige Empfehlungen auf dieser Website sind Affiliate-Links und als Anzeige gekennzeichnet. Wenn Sie nach einem Klick darauf etwas kaufen, erhalten wir möglicherweise eine Provision – für Sie ändert sich der Preis nicht. Beim Klick kann der Partner erfassen, dass Sie von unserer Website kommen.',
      supportTitle: 'Unterstützung',
      supportText:
        'Wenn Sie den Unterstützen-Button nutzen, werden Sie zu einem externen Zahlungsanbieter weitergeleitet. Dort gilt dessen Datenschutzerklärung; wir erhalten nur die Informationen, die Sie selbst angeben.',
      cookiesTitle: 'Cookies',
      cookiesNone: 'Wir verwenden keine Cookies.',
      cookiesAds:
        'Wir selbst setzen keine Cookies. Der Werbeanbieter kann – abhängig von Ihrer Einwilligung – Cookies setzen, wie oben beschrieben.',
      rightsTitle: 'Ihre Rechte',
      rightsText:
        'Sie haben das Recht auf Auskunft, Berichtigung und Löschung Ihrer personenbezogenen Daten, auf Einschränkung der Verarbeitung, auf Widerspruch und auf Datenübertragbarkeit. Außerdem können Sie sich bei einer Datenschutz-Aufsichtsbehörde beschweren. Um Ihre Rechte auszuüben, kontaktieren Sie uns über die oben genannten Angaben.',
    },
    imprint: {
      slug: 'impressum',
      title: 'Impressum',
      description: 'Impressum von {site}: wer diese Website betreibt und wie Sie uns erreichen. Kostenlose PDF- und Bild-Tools ohne Upload.',
      operatorTitle: 'Betreiber dieser Website',
      contactTitle: 'Kontakt',
      emailLabel: 'E-Mail',
      disclaimerTitle: 'Haftungsausschluss',
      disclaimerText:
        'Die Tools werden kostenlos und ohne Gewähr bereitgestellt. Bitte bewahren Sie immer eine Kopie Ihrer Originaldateien auf. Für die Inhalte verlinkter externer Websites sind ausschließlich deren Betreiber verantwortlich.',
      missing: 'Die Betreiberangaben wurden noch nicht ausgefüllt (packages/shared/src/network.ts → owner).',
    },
  },

  common: {
    chooseFile: 'Datei auswählen',
    chooseFiles: 'Dateien auswählen',
    orDrop: 'oder hierher ziehen',
    orDropMany: 'oder hierher ziehen',
    dropNow: 'Zum Hinzufügen loslassen',
    addMore: 'Weitere hinzufügen',
    processing: 'Wird bearbeitet …',
    download: 'Herunterladen',
    downloadAll: 'Alle herunterladen (ZIP)',
    startOver: 'Neu beginnen',
    remove: 'Entfernen',
    moveUp: 'Nach oben',
    moveDown: 'Nach unten',
    pagesOne: '1 Seite',
    pagesMany: '{count} Seiten',
    pagesAll: 'Alle Seiten',
    pagesSome: 'Nur diese Seiten:',
    pagesPlaceholder: 'z. B. 1-3, 5',
    pagesHelp: 'Mit Kommas trennen, Bereiche mit Bindestrich.',
    done: 'Fertig!',
    smaller: '{percent} % kleiner',
    keptOriginal: 'Bereits optimal – Original behalten',
    errorGeneric: 'Etwas ist schiefgelaufen: {message}',
    errorNotPdf: '„{name}“ ist keine PDF-Datei oder beschädigt.',
    errorNotImage: '„{name}“ ist kein Bild, das Ihr Browser öffnen kann.',
    errorMemory: 'Ihr Gerät hat nicht genug Arbeitsspeicher. Bitte versuchen Sie es mit weniger oder kleineren Dateien.',
    passwordNeeded: '„{name}“ ist mit einem Passwort geschützt. Bitte geben Sie es ein:',
    passwordWrong: 'Das Passwort ist nicht korrekt. Bitte versuchen Sie es erneut:',
    passwordLabel: 'Passwort',
    passwordSubmit: 'Entsperren',
    cancel: 'Abbrechen',
    cancelled: 'Abgebrochen.',
    rangeEmpty: 'Bitte geben Sie die Seiten ein.',
    rangeInvalid: '„{token}“ ist keine gültige Seite und kein gültiger Bereich. Beispiel: 1-3, 5',
    rangeOutOfRange: '„{token}“ liegt außerhalb des Dokuments (es hat {count} Seiten).',
  },

  components: {
    MergePdf: {
      button: 'PDFs zusammenfügen',
      needTwo: 'Fügen Sie mindestens zwei PDF-Dateien hinzu.',
      result: 'Ihr zusammengefügtes PDF hat {pages}.',
    },
    SplitPdf: {
      modeLabel: 'Was möchten Sie tun?',
      modeExtract: 'Seiten in ein PDF extrahieren',
      modeEach: 'Jede Seite als eigenes PDF speichern',
      modeRanges: 'Ein PDF pro Bereich',
      pagesLabel: 'Seiten',
      button: 'PDF teilen',
      result: '{count} Datei(en) erstellt.',
    },
    RotatePdf: {
      directionLabel: 'Drehen um',
      right: '90° im Uhrzeigersinn',
      left: '90° gegen den Uhrzeigersinn',
      flip: '180°',
      pagesLabel: 'Welche Seiten?',
      button: 'PDF drehen',
    },
    DeletePdfPages: {
      pagesLabel: 'Zu löschende Seiten',
      button: 'Seiten löschen',
      cannotDeleteAll: 'Sie können nicht alle Seiten löschen.',
      result: 'Das neue PDF hat {pages}.',
    },
    ImagesToPdf: {
      pageSizeLabel: 'Seitengröße',
      a4: 'A4',
      letter: 'US Letter',
      fit: 'Wie das Bild',
      orientationLabel: 'Ausrichtung',
      auto: 'Automatisch',
      portrait: 'Hochformat',
      landscape: 'Querformat',
      marginLabel: 'Rand',
      marginNone: 'Keiner',
      marginSmall: 'Schmal',
      marginLarge: 'Breit',
      button: 'PDF erstellen',
    },
    PdfToImages: {
      formatLabel: 'Bildformat',
      resolutionLabel: 'Auflösung',
      resolutionLow: 'Niedrig (72 DPI)',
      resolutionMedium: 'Standard (150 DPI)',
      resolutionHigh: 'Hoch (300 DPI)',
      pagesLabel: 'Welche Seiten?',
      button: 'In Bilder umwandeln',
      progress: 'Seite {current} von {total} wird umgewandelt …',
    },
    CompressImage: {
      qualityLabel: 'Qualität',
      qualityHelp: 'Weniger Qualität = kleinere Datei. 75 % sind ein guter Kompromiss.',
      formatLabel: 'Speichern als',
      formatSame: 'Gleiches Format',
      button: 'Komprimieren',
    },
    ResizeImage: {
      modeLabel: 'Größe ändern nach',
      modePercent: 'Prozent',
      modePixels: 'Pixel',
      percentLabel: 'Neue Größe',
      widthLabel: 'Breite (px)',
      heightLabel: 'Höhe (px)',
      keepAspect: 'Seitenverhältnis beibehalten',
      button: 'Größe ändern',
      needSize: 'Bitte geben Sie eine Breite oder eine Höhe ein.',
    },
    ConvertImage: {
      toLabel: 'Umwandeln in',
      qualityLabel: 'Qualität',
      backgroundLabel: 'Hintergrund für transparente Bereiche',
      button: 'Umwandeln',
      webpUnsupported:
        'Ihr Browser kann keine WebP-Bilder erstellen. Bitte verwenden Sie eine aktuelle Version von Chrome, Edge oder Firefox.',
    },
    RemoveExif: {
      button: 'Metadaten entfernen',
      found: 'Versteckte Informationen gefunden:',
      nothingFound: 'Keine Metadaten gefunden – diese Datei sieht sauber aus.',
      gps: 'Standort (GPS)',
      camera: 'Kamera',
      date: 'Aufnahmedatum',
      software: 'Software',
      author: 'Autor / Urheberrecht',
      otherFields: '+ {count} weitere Felder',
      mapLink: 'Auf Karte zeigen',
      removedList: 'Entfernt: {list}',
      nothingRemoved: 'Nichts zu entfernen – die Datei war bereits sauber.',
      unsupported: '„{name}“: Es können nur JPG-, PNG- und WebP-Dateien bereinigt werden.',
      kinds: {
        exif: 'EXIF',
        xmp: 'XMP',
        iptc: 'IPTC',
        comment: 'Kommentare',
        text: 'Textnotizen',
        time: 'Zeitstempel',
        other: 'weitere versteckte Daten',
      },
    },
    ImageToText: {
      pasteHint: 'Tipp: Sie können auch einen Screenshot mit Strg+V einfügen (⌘+V auf dem Mac).',
      language: 'Sprache des Textes',
      languages: { eng: 'Englisch', deu: 'Deutsch', both: 'Deutsch + Englisch' },
      loading: 'Texterkennung wird geladen … (beim ersten Mal dauert es einige Sekunden)',
      reading: 'Text wird gelesen … {percent} %',
      readingMany: 'Bild {current} von {total} wird gelesen … {percent} %',
      resultLabel: 'Erkannter Text',
      noText: 'Kein Text gefunden. Versuchen Sie ein schärferes Bild oder eine andere Sprache.',
      copy: 'Text kopieren',
      copied: 'In die Zwischenablage kopiert!',
      downloadTxt: 'Als .txt herunterladen',
      pastedName: 'eingefuegtes-bild',
    },
    QrCode: {
      typeLabel: 'Inhalt',
      typeUrl: 'Website',
      typeText: 'Text',
      typeWifi: 'WLAN',
      typeEmail: 'E-Mail',
      typePhone: 'Telefon',
      urlLabel: 'Webadresse',
      urlPlaceholder: 'https://beispiel.de',
      textLabel: 'Text',
      ssidLabel: 'Netzwerkname (SSID)',
      wifiPasswordLabel: 'Passwort',
      securityLabel: 'Verschlüsselung',
      securityNone: 'Keine (offenes Netzwerk)',
      hiddenLabel: 'Verstecktes Netzwerk',
      emailLabel: 'E-Mail-Adresse',
      subjectLabel: 'Betreff (optional)',
      bodyLabel: 'Nachricht (optional)',
      phoneLabel: 'Telefonnummer',
      colorLabel: 'Farbe',
      backgroundLabel: 'Hintergrund',
      sizeLabel: 'Größe (PNG)',
      errorCorrectionLabel: 'Fehlerkorrektur',
      errorCorrectionHelp: 'Höher = auch beschädigt oder teilweise verdeckt noch lesbar, aber dichter.',
      downloadPng: 'PNG herunterladen',
      downloadSvg: 'SVG herunterladen',
      emptyHint: 'Füllen Sie die Felder aus, um Ihren QR-Code zu sehen.',
      tooLong: 'Zu viel Inhalt für einen QR-Code. Bitte kürzen Sie ihn.',
      lowContrast: 'Geringer Kontrast – manche Handys können diesen Code eventuell nicht lesen.',
    },
    EpcQrCode: {
      nameLabel: 'Name des Empfängers',
      ibanLabel: 'IBAN',
      bicLabel: 'BIC (optional)',
      amountLabel: 'Betrag in EUR (optional)',
      referenceLabel: 'Verwendungszweck (optional)',
      referenceHelp: 'Zum Beispiel eine Rechnungsnummer oder eine RF-Gläubigerreferenz.',
      downloadPng: 'PNG herunterladen',
      downloadSvg: 'SVG herunterladen',
      emptyHint: 'Geben Sie Name und IBAN ein, um den Code zu erstellen.',
      errors: {
        name: 'Bitte geben Sie den Namen des Empfängers ein (max. 70 Zeichen).',
        iban: 'Diese IBAN ist ungültig – bitte prüfen Sie sie.',
        bic: 'Diese BIC ist ungültig.',
        amount: 'Bitte geben Sie einen Betrag zwischen 0,01 und 999.999.999,99 ein.',
        reference: 'Der Verwendungszweck darf höchstens 140 Zeichen lang sein.',
        'too-long': 'Insgesamt zu viel Text. Bitte kürzen Sie den Namen oder den Verwendungszweck.',
      },
    },
    PasswordGenerator: {
      charactersLabel: 'Zeichen',
      lengthLabel: 'Länge',
      lowercase: 'Kleinbuchstaben (a–z)',
      uppercase: 'Großbuchstaben (A–Z)',
      digits: 'Zahlen (0–9)',
      symbols: 'Sonderzeichen (!#$…)',
      avoidAmbiguous: 'Ähnliche Zeichen vermeiden (I, l, 1, O, 0)',
      generate: 'Neues Passwort',
      copy: 'Kopieren',
      copied: 'Kopiert!',
      strengthLabel: 'Stärke',
      strengths: {
        weak: 'Schwach',
        fair: 'Mittel',
        strong: 'Stark',
        excellent: 'Sehr stark',
      },
      entropy: '{bits} Bit Entropie',
      needOneType: 'Wählen Sie mindestens eine Zeichenart aus.',
    },
  },

  formats: {
    jpg: 'JPG (oder JPEG) ist das verbreitetste Fotoformat. Es komprimiert verlustbehaftet, damit Dateien klein bleiben – ideal für Fotos, kann aber scharfe Texte und Linien unscharf machen. JPG unterstützt keine Transparenz.',
    png: 'PNG ist ein verlustfreies Format: Jedes Pixel wird exakt gespeichert. Es eignet sich ideal für Screenshots, Logos, Texte und Grafiken und unterstützt Transparenz. Fotos sind als PNG deutlich größer als als JPG.',
    webp: 'WebP ist ein modernes Format von Google. Es macht Bilder bei gleicher Qualität etwa 25–35 % kleiner als JPG und unterstützt Transparenz. Alle aktuellen Browser können es anzeigen.',
  },

  converter(from: ImageFormat, to: ImageFormat): ToolText {
    const F = IMAGE_FORMATS[from].label;
    const T = IMAGE_FORMATS[to].label;
    const toLossy = IMAGE_FORMATS[to].lossy;
    const losesTransparency = IMAGE_FORMATS[from].transparency && !IMAGE_FORMATS[to].transparency;
    const why = {
      jpg: 'JPG funktioniert überall und hält Fotos klein.',
      png: 'PNG ist verlustfrei und erhält scharfe Kanten und Transparenz.',
      webp: 'WebP-Dateien sind deutlich kleiner – ideal für Websites.',
    }[to];
    const reason = {
      jpg: 'Fast jedes Programm, jede Website und jedes Gerät akzeptiert JPG, und Fotos werden viel kleiner als im PNG-Format.',
      png: 'PNG ist die richtige Wahl, wenn Sie ein Bild weiterbearbeiten möchten, ohne weitere Qualität zu verlieren, oder wenn es Text, Linien oder Transparenz enthält.',
      webp: 'WebP-Bilder sind bei gleicher Qualität meist 25–35 % kleiner als JPG – Websites laden dadurch schneller und verbrauchen weniger Datenvolumen.',
    }[to];

    return {
      slug: `${from}-in-${to}`,
      name: `${F} in ${T}`,
      short: `${F}-Bilder in ${T} umwandeln.`,
      title: `${F} in ${T} umwandeln – kostenlos & ohne Upload`,
      description: `${F} kostenlos im Browser in ${T} umwandeln. ${why} Ohne Upload und ohne Anmeldung.`,
      h1: `${F} in ${T} umwandeln`,
      lead: `Machen Sie aus ${F}-Bildern in Sekunden ${T}-Dateien. ${why}`,
      steps: [
        `Wählen Sie ein oder mehrere ${F}-Bilder aus (oder ziehen Sie sie auf das Feld).`,
        toLossy
          ? 'Passen Sie bei Bedarf die Qualität an – 90 % sind ein guter Standardwert.'
          : `Es gibt nichts einzustellen: ${T} ist verlustfrei.`,
        `Klicken Sie auf „Umwandeln“ und laden Sie Ihre ${T}-Dateien herunter.`,
      ],
      faq: [
        {
          q: `Verliert das Bild beim Umwandeln von ${F} in ${T} an Qualität?`,
          a: toLossy
            ? `${T} komprimiert verlustbehaftet, aber bei der Standardqualität von 90 % ist der Unterschied praktisch unsichtbar. Für die bestmögliche Qualität wählen Sie 100 %.`
            : `Nein. ${T} ist verlustfrei, das Bild sieht also genauso aus wie vorher. Die Datei kann größer werden, weil ${T} keine Informationen verwirft.`,
        },
        losesTransparency
          ? {
              q: 'Was passiert mit transparenten Bereichen?',
              a: `${T} kann keine Transparenz speichern. Transparente Bereiche werden deshalb mit einer Hintergrundfarbe gefüllt – standardmäßig Weiß oder eine Farbe Ihrer Wahl.`,
            }
          : { q: `Warum ${F} in ${T} umwandeln?`, a: reason },
        {
          q: 'Kann ich viele Bilder auf einmal umwandeln?',
          a: 'Ja. Wählen Sie so viele Bilder aus, wie Sie möchten – Sie können jede Datei einzeln oder alle zusammen als ZIP-Archiv herunterladen.',
        },
        {
          q: 'Werden meine Bilder hochgeladen?',
          a: 'Nein. Die Umwandlung läuft vollständig in Ihrem Browser. Ihre Bilder verlassen Ihr Gerät nie.',
        },
      ],
    };
  },

  tools: {
    'merge-pdf': {
      slug: 'pdf-zusammenfuegen',
      name: 'PDF zusammenfügen',
      short: 'Mehrere PDFs zu einer Datei verbinden.',
      title: 'PDF zusammenfügen – kostenlos & ohne Upload',
      description:
        'Mehrere PDFs in Sekunden zu einer Datei zusammenfügen. Kostenlos, ohne Anmeldung, ohne Wasserzeichen – Ihre Dateien werden im Browser verarbeitet, nie hochgeladen.',
      h1: 'PDF-Dateien zusammenfügen',
      lead: 'Fügen Sie mehrere PDFs zu einem Dokument zusammen. Reihenfolge festlegen, klicken – fertig. Ihre Dateien verlassen nie Ihr Gerät.',
      steps: [
        'Wählen Sie die PDF-Dateien aus, die Sie zusammenfügen möchten, oder ziehen Sie sie auf das Feld.',
        'Bringen Sie sie mit den Pfeiltasten in die richtige Reihenfolge.',
        'Klicken Sie auf „PDFs zusammenfügen“ und laden Sie Ihr neues Dokument herunter.',
      ],
      faq: [
        {
          q: 'Werden meine PDF-Dateien auf einen Server hochgeladen?',
          a: 'Nein. Das Zusammenfügen geschieht vollständig in Ihrem Webbrowser. Ihre Dateien werden nirgendwohin gesendet – Sie können nach dem Laden der Seite sogar die Internetverbindung trennen.',
        },
        {
          q: 'Gibt es eine Begrenzung bei Anzahl oder Größe der Dateien?',
          a: 'Keine künstliche Grenze. Da Ihr eigenes Gerät die Arbeit erledigt, ist nur dessen Arbeitsspeicher die Grenze. Dokumente mit Hunderten von Seiten funktionieren auf jedem modernen Computer oder Smartphone.',
        },
        {
          q: 'Kann ich passwortgeschützte PDFs zusammenfügen?',
          a: 'Ja. PDFs, die nur Drucken oder Kopieren einschränken, werden automatisch geöffnet. Braucht ein PDF zum Öffnen ein Passwort, werden Sie danach gefragt – das Passwort wird nur in Ihrem Browser verwendet.',
        },
        {
          q: 'Ändert sich die Qualität?',
          a: 'Nein. Die Seiten werden exakt kopiert – Texte, Bilder und Schriften bleiben identisch. Lesezeichen und ausfüllbare Formularfelder der Originaldateien werden nicht übernommen.',
        },
      ],
    },
    'split-pdf': {
      slug: 'pdf-teilen',
      name: 'PDF teilen',
      short: 'Seiten extrahieren oder ein PDF aufteilen.',
      title: 'PDF teilen – Seiten extrahieren, ohne Upload',
      description:
        'Teilen Sie ein PDF in mehrere Dateien auf oder extrahieren Sie nur die Seiten, die Sie brauchen. Kostenlos und privat: alles im Browser, nichts wird hochgeladen.',
      h1: 'PDF teilen',
      lead: 'Extrahieren Sie bestimmte Seiten, speichern Sie jede Seite als eigenes PDF oder teilen Sie ein Dokument in Abschnitte – ohne es irgendwo hochzuladen.',
      steps: [
        'Wählen Sie das PDF aus, das Sie teilen möchten.',
        'Wählen Sie, was Sie tun möchten, und geben Sie die Seiten ein, z. B. „1-3, 5“.',
        'Klicken Sie auf „PDF teilen“ und laden Sie das Ergebnis herunter.',
      ],
      faq: [
        {
          q: 'Wie gebe ich Seitenzahlen ein?',
          a: 'Trennen Sie Seiten mit Kommas und verwenden Sie einen Bindestrich für Bereiche: „1-3, 5, 8-10“. „7-“ bedeutet von Seite 7 bis zum Ende.',
        },
        {
          q: 'Was ist der Unterschied zwischen den Optionen?',
          a: '„Seiten in ein PDF extrahieren“ fasst die gewählten Seiten in einem neuen PDF zusammen. „Jede Seite als eigenes PDF“ erzeugt eine Datei pro Seite. „Ein PDF pro Bereich“ erzeugt eine Datei pro eingegebenem Bereich – „1-3, 4-6“ ergibt zwei Dateien.',
        },
        {
          q: 'Ist das Teilen vertraulicher Dokumente sicher?',
          a: 'Ja. Das PDF wird von Ihrem eigenen Browser verarbeitet und nie hochgeladen. Verträge, Kontoauszüge und andere sensible Dateien bleiben privat.',
        },
        {
          q: 'Bekomme ich viele einzelne Downloads?',
          a: 'Nein. Besteht das Ergebnis aus mehreren Dateien, erhalten Sie ein ZIP-Archiv, das alle enthält.',
        },
      ],
    },
    'rotate-pdf': {
      slug: 'pdf-drehen',
      name: 'PDF drehen',
      short: 'Seiten dauerhaft um 90° oder 180° drehen.',
      title: 'PDF drehen – Seiten dauerhaft drehen, ohne Upload',
      description:
        'Drehen Sie alle oder einzelne Seiten eines PDFs um 90° oder 180° und speichern Sie das Ergebnis dauerhaft. Kostenlos, privat und ohne Anmeldung.',
      h1: 'PDF-Seiten drehen',
      lead: 'Korrigieren Sie quer oder kopfüber eingescannte Seiten: Drehen Sie alle oder nur ausgewählte Seiten und speichern Sie das PDF dauerhaft.',
      steps: [
        'Wählen Sie Ihre PDF-Datei aus.',
        'Wählen Sie die Richtung und die Seiten, die gedreht werden sollen.',
        'Klicken Sie auf „PDF drehen“ und laden Sie die korrigierte Datei herunter.',
      ],
      faq: [
        {
          q: 'Ist die Drehung dauerhaft?',
          a: 'Ja. Die Drehung wird im PDF selbst gespeichert, die Seiten erscheinen also in jedem PDF-Programm und beim Drucken richtig.',
        },
        {
          q: 'Kann ich nur einzelne Seiten drehen?',
          a: 'Ja. Wählen Sie „Nur diese Seiten“ und geben Sie Seitenzahlen ein, z. B. „2, 4-6“.',
        },
        {
          q: 'Verschlechtert das Drehen die Qualität?',
          a: 'Nein. Nur die Ausrichtung der Seite ändert sich; der Inhalt wird weder verändert noch neu komprimiert.',
        },
        {
          q: 'Wird meine Datei hochgeladen?',
          a: 'Nein. Ihr Browser erledigt alles lokal – die Datei wird nie an einen Server gesendet.',
        },
      ],
    },
    'delete-pdf-pages': {
      slug: 'pdf-seiten-loeschen',
      name: 'PDF-Seiten löschen',
      short: 'Unerwünschte Seiten aus einem PDF entfernen.',
      title: 'Seiten aus PDF löschen – kostenlos, ohne Upload',
      description:
        'Entfernen Sie unerwünschte Seiten in Sekunden aus einem PDF: Seitenzahlen eingeben, bereinigte Datei herunterladen. Privat – nichts wird hochgeladen.',
      h1: 'Seiten aus einem PDF löschen',
      lead: 'Entfernen Sie leere, doppelte oder vertrauliche Seiten aus einem PDF. Alle anderen Seiten bleiben genau so, wie sie waren.',
      steps: [
        'Wählen Sie die PDF-Datei aus.',
        'Geben Sie die Seiten ein, die Sie entfernen möchten, z. B. „2, 5-7“.',
        'Klicken Sie auf „Seiten löschen“ und laden Sie das neue PDF herunter.',
      ],
      faq: [
        {
          q: 'Kann ich das rückgängig machen?',
          a: 'Ihre Originaldatei wird nie verändert – Sie erhalten immer eine neue Kopie. Wenn Sie sich vertan haben, beginnen Sie einfach neu.',
        },
        {
          q: 'Ist der Inhalt gelöschter Seiten wirklich weg?',
          a: 'Ja. Gelöschte Seiten werden gar nicht erst in das neue PDF kopiert – ihr Inhalt ist also wirklich weg und nicht nur ausgeblendet.',
        },
        {
          q: 'Woher kenne ich die Seitenzahlen?',
          a: 'Die Seitenanzahl wird angezeigt, sobald Sie die Datei auswählen. Seite 1 ist immer die erste Seite – unabhängig davon, welche Nummern auf den Seiten gedruckt sind.',
        },
        {
          q: 'Wird meine Datei hochgeladen?',
          a: 'Nein. Alles passiert in Ihrem Browser.',
        },
      ],
    },
    'jpg-to-pdf': {
      slug: 'jpg-in-pdf',
      name: 'JPG in PDF',
      short: 'Fotos und Scans in ein PDF umwandeln.',
      title: 'JPG in PDF umwandeln – kostenlos, ohne Upload',
      description:
        'Machen Sie aus JPG-, PNG- oder WebP-Bildern ein PDF. Reihenfolge, Seitengröße und Rand frei wählbar. Kostenlos, privat, direkt im Browser.',
      h1: 'JPG in PDF umwandeln',
      lead: 'Fassen Sie Fotos, Scans oder Screenshots in einem PDF zusammen – ideal für Bewerbungen, Belege und Formulare.',
      steps: [
        'Wählen Sie ein oder mehrere Bilder aus (JPG, PNG oder WebP).',
        'Legen Sie die Reihenfolge fest und wählen Sie Seitengröße, Ausrichtung und Rand.',
        'Klicken Sie auf „PDF erstellen“ und laden Sie es herunter.',
      ],
      faq: [
        {
          q: 'Welche Bildformate werden unterstützt?',
          a: 'JPG, PNG und WebP sowie jedes andere Format, das Ihr Browser anzeigen kann, z. B. GIF, BMP oder AVIF.',
        },
        {
          q: 'Verlieren meine Fotos an Qualität?',
          a: 'Nein. JPG- und PNG-Bilder werden unverändert eingebettet. Nur Bilder in anderen Formaten und Fotos, die erst aufgerichtet werden müssen, werden in hoher Qualität neu gespeichert.',
        },
        {
          q: 'Kann ich mehrere Bilder in ein PDF packen?',
          a: 'Ja. Jedes Bild wird zu einer Seite – in der Reihenfolge, die Sie festlegen.',
        },
        {
          q: 'Werden meine Fotos hochgeladen?',
          a: 'Nein. Das PDF wird in Ihrem Browser erstellt, Ihre Bilder verlassen Ihr Gerät nie.',
        },
      ],
    },
    'pdf-to-jpg': {
      slug: 'pdf-in-jpg',
      name: 'PDF in JPG',
      short: 'PDF-Seiten als JPG- oder PNG-Bilder speichern.',
      title: 'PDF in JPG umwandeln – Seiten als Bilder speichern',
      description:
        'Wandeln Sie die Seiten eines PDFs in hochwertige JPG- oder PNG-Bilder um. Kostenlos, privat und ohne Anmeldung – alles wird im Browser verarbeitet.',
      h1: 'PDF in JPG umwandeln',
      lead: 'Speichern Sie PDF-Seiten als Bilder, um sie in Chats, sozialen Netzwerken oder Präsentationen zu teilen.',
      steps: [
        'Wählen Sie eine PDF-Datei aus.',
        'Wählen Sie Bildformat, Auflösung und die gewünschten Seiten.',
        'Klicken Sie auf „In Bilder umwandeln“ und laden Sie sie herunter – mehrere Seiten erhalten Sie als ZIP-Datei.',
      ],
      faq: [
        {
          q: 'Welche Auflösung soll ich wählen?',
          a: '„Standard“ (150 DPI) eignet sich für Bildschirme. Wählen Sie „Hoch“ (300 DPI) zum Drucken oder wenn Sie stark hineinzoomen müssen.',
        },
        {
          q: 'JPG oder PNG?',
          a: 'JPG ergibt kleinere Dateien und ist ideal für Fotos und Scans. PNG ist verlustfrei und am besten für Text, Diagramme und Screenshots.',
        },
        {
          q: 'Funktioniert das mit eingescannten PDFs?',
          a: 'Ja. Jede Seite wird genau so dargestellt, wie sie in einem PDF-Programm aussieht.',
        },
        {
          q: 'Wird mein PDF hochgeladen?',
          a: 'Nein. Die Seiten werden von Ihrem Browser dargestellt – nichts wird an einen Server gesendet.',
        },
      ],
    },
    'compress-image': {
      slug: 'bild-komprimieren',
      name: 'Bild komprimieren',
      short: 'JPG-, PNG- und WebP-Dateien verkleinern.',
      title: 'Bilder komprimieren – JPG, PNG & WebP ohne Upload',
      description:
        'Machen Sie Bilder kleiner – ohne sichtbaren Qualitätsverlust. JPG, PNG und WebP direkt im Browser komprimieren: kostenlos, privat und unbegrenzt.',
      h1: 'Bilder komprimieren',
      lead: 'Verkleinern Sie Fotos und Grafiken für E-Mails, Websites und Uploads. Sie bestimmen die Qualität – und Ihre Bilder bleiben auf Ihrem Gerät.',
      steps: [
        'Wählen Sie ein oder mehrere Bilder aus.',
        'Stellen Sie die Qualität ein – 75 % sind ein guter Kompromiss aus Größe und Qualität.',
        'Klicken Sie auf „Komprimieren“ und laden Sie die kleineren Dateien herunter.',
      ],
      faq: [
        {
          q: 'Wie viel kleiner werden meine Bilder?',
          a: 'Typische Fotos werden bei 75 % Qualität 40–80 % kleiner. Bereits gut komprimierte Bilder schrumpfen weniger – wäre das Ergebnis größer, erhalten Sie einfach das Original zurück.',
        },
        {
          q: 'Wie werden PNG-Dateien komprimiert?',
          a: 'PNGs werden auf eine intelligente Palette mit bis zu 256 Farben reduziert – dieselbe Technik, die bekannte PNG-Kompressoren nutzen. Transparenz bleibt erhalten, und die Dateien werden meist 50–70 % kleiner.',
        },
        {
          q: 'Werden versteckte Metadaten entfernt?',
          a: 'Ja. Komprimierte Bilder enthalten keine EXIF-Daten wie GPS-Standort oder Kameradaten mehr.',
        },
        {
          q: 'Werden meine Bilder hochgeladen?',
          a: 'Nein. Die Komprimierung läuft vollständig in Ihrem Browser.',
        },
      ],
    },
    'resize-image': {
      slug: 'bildgroesse-aendern',
      name: 'Bildgröße ändern',
      short: 'Größe in Pixel oder Prozent ändern.',
      title: 'Bildgröße ändern – in Pixel oder Prozent, ohne Upload',
      description:
        'Ändern Sie die Größe von JPG-, PNG- und WebP-Bildern auf exakte Pixelmaße oder in Prozent. Viele Bilder auf einmal – kostenlos und privat.',
      h1: 'Bildgröße ändern',
      lead: 'Ändern Sie Breite und Höhe Ihrer Bilder in Pixel oder Prozent – für ein Bild oder viele auf einmal.',
      steps: [
        'Wählen Sie ein oder mehrere Bilder aus.',
        'Geben Sie eine neue Breite und/oder Höhe ein oder wählen Sie einen Prozentwert.',
        'Klicken Sie auf „Größe ändern“ und laden Sie das Ergebnis herunter.',
      ],
      faq: [
        {
          q: 'Wird mein Bild verzerrt?',
          a: 'Nicht, wenn „Seitenverhältnis beibehalten“ eingeschaltet ist (Standard). Das Bild wird dann so skaliert, dass es in die eingegebene Größe passt.',
        },
        {
          q: 'Kann ich Bilder vergrößern?',
          a: 'Ja, aber beim Vergrößern entstehen keine neuen Details – vergrößerte Bilder können daher weich wirken.',
        },
        {
          q: 'Welches Format hat das Ergebnis?',
          a: 'Dasselbe wie das Original. JPG- und WebP-Bilder werden in hoher Qualität (92 %) gespeichert.',
        },
        {
          q: 'Werden meine Bilder hochgeladen?',
          a: 'Nein. Die Größenänderung erledigt Ihr Browser lokal.',
        },
      ],
    },
    'image-converter': {
      slug: 'bild-umwandeln',
      name: 'Bildkonverter',
      short: 'Zwischen JPG, PNG und WebP umwandeln.',
      title: 'Bildkonverter – JPG, PNG & WebP ohne Upload',
      description:
        'Wandeln Sie Bilder direkt im Browser zwischen JPG, PNG und WebP um. Viele Dateien auf einmal, einstellbare Qualität – ohne Upload und ohne Anmeldung.',
      h1: 'Bildkonverter',
      lead: 'Wandeln Sie Bilder in JPG, PNG oder WebP um – schnell, kostenlos und ohne eine einzige Datei hochzuladen.',
      steps: [
        'Wählen Sie ein oder mehrere Bilder aus.',
        'Wählen Sie das Zielformat (und bei JPG und WebP die Qualität).',
        'Klicken Sie auf „Umwandeln“ und laden Sie Ihre Dateien herunter.',
      ],
      faq: [
        {
          q: 'Welche Formate kann ich umwandeln?',
          a: 'Sie können JPG, PNG, WebP, GIF, BMP und – je nach Browser – AVIF öffnen und als JPG, PNG oder WebP speichern.',
        },
        {
          q: 'Welches Format soll ich wählen?',
          a: 'JPG für Fotos, PNG für Grafiken mit scharfen Kanten oder Transparenz und WebP für möglichst kleine Dateien auf Websites.',
        },
        {
          q: 'Was passiert mit Transparenz beim Umwandeln in JPG?',
          a: 'JPG unterstützt keine Transparenz. Transparente Bereiche werden deshalb mit einer Hintergrundfarbe gefüllt – standardmäßig Weiß.',
        },
        {
          q: 'Werden meine Bilder hochgeladen?',
          a: 'Nein. Alles läuft in Ihrem Browser.',
        },
      ],
    },
    'remove-exif': {
      slug: 'exif-daten-entfernen',
      name: 'EXIF-Daten entfernen',
      short: 'GPS-Standort und Kameradaten löschen.',
      title: 'EXIF-Daten entfernen – Standort aus Fotos löschen',
      description:
        'Versteckte Foto-Metadaten wie GPS-Standort, Kamera und Datum anzeigen und entfernen. Verlustfrei und privat – Ihre Fotos verlassen nie Ihr Gerät.',
      h1: 'EXIF-Daten aus Fotos entfernen',
      lead: 'Fotos können verraten, wo Sie wohnen, wann sie aufgenommen wurden und welches Handy Sie nutzen. Sehen Sie, was in Ihren Bildern steckt, und entfernen Sie es – ganz ohne Qualitätsverlust.',
      steps: [
        'Wählen Sie ein oder mehrere Fotos aus (JPG, PNG oder WebP).',
        'Prüfen Sie, welche versteckten Informationen gefunden wurden – zum Beispiel der GPS-Standort.',
        'Klicken Sie auf „Metadaten entfernen“ und laden Sie die bereinigten Kopien herunter.',
      ],
      faq: [
        {
          q: 'Was sind EXIF-Daten?',
          a: 'Informationen, die Kameras und Smartphones in einem Foto speichern: GPS-Koordinaten, Datum und Uhrzeit, Kameramodell, Einstellungen und manchmal Ihren Namen. Jeder, der die Datei erhält, kann sie auslesen.',
        },
        {
          q: 'Verschlechtert das Entfernen die Qualität?',
          a: 'Nein. Nur die Metadaten werden entfernt; das Bild selbst wird Bit für Bit kopiert. Das Foto behält seine Ausrichtung und sein Farbprofil.',
        },
        {
          q: 'Welche Metadaten werden entfernt?',
          a: 'EXIF (inklusive GPS), XMP, IPTC, Kommentare, eingebettete Vorschaubilder und andere versteckte Daten. Nur Ausrichtung und Farbprofil bleiben erhalten, damit das Foto genau gleich aussieht.',
        },
        {
          q: 'Kann ich das bedenkenlos mit privaten Fotos nutzen?',
          a: 'Ja – genau darum geht es. Ihre Fotos werden in Ihrem Browser verarbeitet und nie hochgeladen.',
        },
      ],
    },
    'image-to-text': {
      slug: 'bild-zu-text',
      name: 'Bild zu Text',
      short: 'Text aus jedem Bild kopieren.',
      title: 'Bild zu Text – Kostenlose OCR, Text aus Bild erkennen',
      description:
        'Text aus Bildern, Fotos und Screenshots kostenlos erkennen. Die OCR läuft in Ihrem Browser – Ihre Bilder werden nie hochgeladen. Deutsch und Englisch.',
      h1: 'Bild zu Text (OCR)',
      lead: 'Machen Sie aus Fotos, Scans und Screenshots Text, den Sie kopieren und bearbeiten können. Die Texterkennung läuft auf Ihrem Gerät – Ihre Bilder verlassen es nie.',
      steps: [
        'Bild auswählen, hineinziehen oder einfügen (JPG, PNG, WebP …).',
        'Sprache des Textes wählen – die Erkennung startet von selbst.',
        'Text kopieren oder als .txt-Datei herunterladen.',
      ],
      faq: [
        {
          q: 'Was ist OCR?',
          a: 'OCR (optische Zeichenerkennung) bedeutet, dass ein Computer die Buchstaben in einem Bild liest und in echten Text verwandelt, den Sie kopieren, durchsuchen und bearbeiten können.',
        },
        {
          q: 'Werden meine Bilder hochgeladen?',
          a: 'Nein. Die Texterkennung wird einmal geladen und läuft dann in Ihrem Browser. Ihre Bilder und der erkannte Text verlassen Ihr Gerät nie.',
        },
        {
          q: 'Welche Sprachen werden unterstützt?',
          a: 'Deutsch und Englisch, inklusive Umlauten und ß. Wählen Sie „Deutsch + Englisch“ für Texte, die beide Sprachen mischen.',
        },
        {
          q: 'Wie erhalte ich die besten Ergebnisse?',
          a: 'Verwenden Sie scharfe, gut beleuchtete Bilder mit geraden Textzeilen. Screenshots funktionieren am besten; halten Sie die Kamera bei Fotos parallel zur Seite. Handschrift wird meist nicht gut erkannt.',
        },
        {
          q: 'Warum dauert es beim ersten Mal länger?',
          a: 'Beim ersten Mal lädt Ihr Browser die Texterkennung und die Sprachdaten (einige Megabyte). Danach kommen sie aus dem Browser-Cache und starten viel schneller.',
        },
      ],
    },
    'qr-code-generator': {
      slug: 'qr-code-generator',
      name: 'QR-Code-Generator',
      short: 'QR-Codes für Links, WLAN und mehr.',
      title: 'QR-Code-Generator – kostenlos, ohne Anmeldung & Ablauf',
      description:
        'Erstellen Sie QR-Codes für Links, Text, WLAN, E-Mail und Telefonnummern. Download als PNG oder SVG. Für immer kostenlos – statische Codes, die nie ablaufen.',
      h1: 'QR-Code-Generator',
      lead: 'Erstellen Sie QR-Codes für Websites, WLAN-Zugang, E-Mail und mehr. Ohne Konto, ohne Tracking und ohne Ablaufdatum.',
      steps: [
        'Wählen Sie, was der QR-Code enthalten soll, und füllen Sie die Felder aus.',
        'Passen Sie bei Bedarf Farben und Größe an – die Vorschau aktualisiert sich sofort.',
        'Laden Sie den QR-Code als PNG oder SVG herunter.',
      ],
      faq: [
        {
          q: 'Laufen diese QR-Codes ab?',
          a: 'Nie. Es sind statische QR-Codes: Der Inhalt steckt direkt im Code und nicht hinter einem Weiterleitungslink. Manche Websites verkaufen „dynamische“ Codes, die nach einer Testphase nicht mehr funktionieren – diese Codes hängen von keinem Server ab.',
        },
        {
          q: 'Werden Scans getrackt?',
          a: 'Nein. Der Code führt direkt zu Ihrem Inhalt – niemand, auch wir nicht, sieht, wer ihn scannt.',
        },
        {
          q: 'PNG oder SVG?',
          a: 'PNG funktioniert überall. SVG ist ein Vektorformat, das in jeder Größe gestochen scharf bleibt – die beste Wahl für den Druck.',
        },
        {
          q: 'Darf ich die QR-Codes kommerziell nutzen?',
          a: 'Ja, kostenlos und ohne Quellenangabe.',
        },
      ],
    },
    'epc-qr-code': {
      slug: 'girocode-generator',
      name: 'GiroCode (EPC-QR-Code)',
      short: 'Zahlungs-QR-Codes (GiroCode) für Rechnungen.',
      title: 'GiroCode-Generator – EPC-QR-Code kostenlos erstellen',
      description:
        'Erstellen Sie GiroCodes (EPC-QR-Codes) für Rechnungen: Kunden scannen den Code und überweisen per SEPA. Kostenlos, privat, ohne Anmeldung.',
      h1: 'GiroCode erstellen (EPC-QR-Code)',
      lead: 'Drucken Sie einen Zahlungs-QR-Code auf Ihre Rechnungen: Ihre Kunden scannen ihn mit der Banking-App, und IBAN, Betrag und Verwendungszweck werden automatisch ausgefüllt.',
      steps: [
        'Geben Sie den Namen des Empfängers und die IBAN ein.',
        'Fügen Sie optional Betrag und Verwendungszweck hinzu.',
        'Laden Sie den QR-Code herunter und fügen Sie ihn in Ihre Rechnung ein.',
      ],
      faq: [
        {
          q: 'Was ist ein GiroCode?',
          a: 'Ein Standard des European Payments Council für SEPA-Überweisungen, auch EPC-QR-Code genannt. Banking-Apps in Deutschland, Österreich, den Niederlanden, Belgien, Finnland und vielen weiteren Ländern können ihn scannen.',
        },
        {
          q: 'Werden meine Bankdaten irgendwohin gesendet?',
          a: 'Nein. Der QR-Code wird in Ihrem Browser erzeugt. Ihre IBAN und alle anderen Angaben bleiben auf Ihrem Gerät.',
        },
        {
          q: 'Funktioniert das für die Schweizer QR-Rechnung?',
          a: 'Nein. Die Schweiz verwendet einen eigenen Standard, die „QR-Rechnung“. GiroCodes sind für Euro-Zahlungen im SEPA-Raum gedacht.',
        },
        {
          q: 'Brauche ich die BIC?',
          a: 'Für Zahlungen innerhalb des Europäischen Wirtschaftsraums nicht – Sie können das Feld leer lassen.',
        },
      ],
    },
    'password-generator': {
      slug: 'passwort-generator',
      name: 'Passwort-Generator',
      short: 'Starke Zufallspasswörter, offline erstellt.',
      title: 'Passwort-Generator – sichere Passwörter, offline erstellt',
      description:
        'Erzeugen Sie starke Zufallspasswörter mit dem sicheren Zufallsgenerator Ihres Browsers. Länge und Zeichen frei wählbar. Nichts wird gesendet oder gespeichert.',
      h1: 'Passwort-Generator',
      lead: 'Erstellen Sie starke, wirklich zufällige Passwörter. Sie entstehen auf Ihrem Gerät und werden nirgendwohin gesendet oder gespeichert.',
      steps: [
        'Wählen Sie die Länge und die gewünschten Zeichenarten.',
        'Ein neues Passwort erscheint sofort – mit „Neues Passwort“ erhalten Sie ein weiteres.',
        'Kopieren Sie es und speichern Sie es in einem Passwort-Manager.',
      ],
      faq: [
        {
          q: 'Wie lang sollte mein Passwort sein?',
          a: 'Mindestens 16 Zeichen für wichtige Konten. Die Länge zählt mehr als die Komplexität: Jedes zusätzliche Zeichen vervielfacht die Zahl möglicher Passwörter.',
        },
        {
          q: 'Sind die Passwörter wirklich zufällig?',
          a: 'Ja. Sie stammen aus dem kryptografischen Zufallsgenerator Ihres Browsers (crypto.getRandomValues) – demselben, der auch für Verschlüsselung verwendet wird.',
        },
        {
          q: 'Speichern Sie die Passwörter?',
          a: 'Nein. Sie entstehen auf Ihrem Gerät und verlassen es nie. Schließen Sie die Seite, sind sie weg.',
        },
        {
          q: 'Wie merke ich mir sichere Passwörter?',
          a: 'Gar nicht: Verwenden Sie einen Passwort-Manager. Er merkt sich alle Passwörter und füllt sie für Sie aus.',
        },
      ],
    },
  },
};
