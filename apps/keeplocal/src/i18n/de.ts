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
    generator: 'QR-Codes, QR-Rechnungen, Zahlungscodes, Passwörter und Passwortkarten erstellen.',
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
    h1: 'PDF- & Bild-Tools, die Ihre Dateien nie hochladen',
    lead: 'PDFs zusammenfügen, Fotos komprimieren, QR-Codes erstellen und mehr. Die Tools laufen in Ihrem Browser, Ihre Dateien bleiben also auf Ihrem Computer oder Handy. Kostenlos, ohne Konto und ohne Wasserzeichen.',
    demo: {
      files: ['vertrag.pdf', 'rechnung.pdf', 'scan.jpg'],
      result: 'zusammengefuegt.pdf',
      uploaded: 'Auf einen Server hochgeladen: 0 Bytes',
    },
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
    affiliateLabel: 'Anzeige: unsere Empfehlung',
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
        'Dateien, die Sie mit unseren Tools öffnen (z. B. PDFs und Bilder), und alles, was Sie in ein Tool eingeben (z. B. QR-Code-Inhalte, Rechnungsadressen oder Bankdaten), werden ausschließlich auf Ihrem Gerät in Ihrem Browser verarbeitet. Sie werden weder an unsere Server noch an Dritte übertragen, und wir können sie nicht einsehen. Wenn Sie die Seite schließen, sind sie verschwunden.',
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
    SwissQrBill: {
      creditorTitle: 'Ihre Angaben (Zahlungsempfänger)',
      accountLabel: 'IBAN oder QR-IBAN',
      accountHelp: 'Ihr Konto in der Schweiz oder in Liechtenstein (CH… oder LI…).',
      accountQr: 'QR-IBAN – sie braucht eine QR-Referenz.',
      accountNormal: 'IBAN – mit Creditor Reference (RF) oder ohne Referenz.',
      nameLabel: 'Name oder Firma',
      streetLabel: 'Straße (optional)',
      numberLabel: 'Nr. (optional)',
      postalCodeLabel: 'PLZ',
      townLabel: 'Ort',
      countryLabel: 'Land',
      amountTitle: 'Betrag',
      currencyLabel: 'Währung',
      amountLabel: 'Betrag (optional)',
      amountHelp: 'Leer lassen, dann trägt der Zahlende den Betrag von Hand ein.',
      referenceTitle: 'Referenz',
      referenceQrr: 'QR-Referenz',
      referenceScor: 'Creditor Reference (RF)',
      referenceNone: 'Keine',
      referenceLabel: 'Referenz',
      referenceHelpQrr: '27 Ziffern. Nur eine Rechnungs- oder Kundennummer zur Hand? Eintippen und auf „Prüfziffer ergänzen“ klicken.',
      referenceHelpScor: 'Beginnt mit RF. Nur eine Rechnungsnummer zur Hand? Eintippen und auf „Prüfziffern ergänzen“ klicken.',
      makeReferenceQrr: 'Prüfziffer ergänzen',
      makeReferenceScor: 'Prüfziffern ergänzen',
      makeReferenceError:
        'Daraus lässt sich keine Referenz bilden: Eine QR-Referenz entsteht aus bis zu 26 Ziffern, eine Creditor Reference aus bis zu 21 Buchstaben und Ziffern.',
      messageLabel: 'Zusätzliche Informationen (optional)',
      messageHelp: 'Zum Beispiel „Rechnung 2026-114“. Bis zu 140 Zeichen.',
      debtorTitle: 'Zahlbar durch (optional)',
      debtorHelp: 'Leer lassen, dann erhält die Rechnung ein Feld für Name und Adresse des Zahlenden.',
      languageLabel: 'Sprache der Rechnung',
      previewLabel: 'Vorschau der QR-Rechnung',
      emptyHint: 'Geben Sie IBAN, Name, PLZ und Ort ein, um Ihre QR-Rechnung zu sehen.',
      downloadA4: 'PDF (A4)',
      downloadSlip: 'PDF (nur Einzahlungsschein)',
      downloadPng: 'QR-Code (PNG)',
      downloadSvg: 'QR-Code (SVG)',
      pdfTitle: 'QR-Rechnung',
      fileA4: 'qr-rechnung.pdf',
      fileSlip: 'qr-einzahlungsschein.pdf',
      fileQr: 'qr-rechnung-qr-code',
      countries: { CH: 'Schweiz', LI: 'Liechtenstein', DE: 'Deutschland', AT: 'Österreich', FR: 'Frankreich', IT: 'Italien' },
      errors: {
        required: 'Bitte füllen Sie „{field}“ aus.',
        'too-long': '„{field}“ darf höchstens {max} Zeichen lang sein.',
        character: '„{field}“ enthält „{char}“ – dieses Zeichen ist in einer QR-Rechnung nicht erlaubt. Bitte ersetzen Sie es.',
        iban: 'Diese IBAN ist ungültig – bitte prüfen Sie sie.',
        'iban-country': 'Eine QR-Rechnung braucht ein Konto in der Schweiz oder in Liechtenstein (IBAN beginnt mit CH oder LI).',
        country: 'Bitte geben Sie einen zweistelligen Ländercode ein, zum Beispiel CH.',
        amount: 'Bitte geben Sie einen Betrag zwischen 0.01 und 999 999 999.99 ein.',
        'qr-iban-needs-qrr': 'Das ist eine QR-IBAN: Sie braucht immer eine QR-Referenz (27 Ziffern).',
        'qrr-needs-qr-iban': 'Eine QR-Referenz funktioniert nur mit einer QR-IBAN. Verwenden Sie mit dieser IBAN eine Creditor Reference (RF) oder keine Referenz.',
        'qr-reference': 'Diese QR-Referenz ist ungültig: Sie hat 27 Ziffern, und die letzte ist eine Prüfziffer.',
        'creditor-reference': 'Diese Creditor Reference ist ungültig: Sie beginnt mit RF und zwei Prüfziffern.',
        'too-much': 'Zu viel Text für einen QR-Code. Bitte kürzen Sie die Adressen oder die zusätzlichen Informationen.',
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
    PasswordCard: {
      sizeLabel: 'Kartengröße',
      sizeWallet: 'Scheckkarte (85,6 × 54 mm)',
      sizeA4: 'A4-Seite',
      newCard: 'Neue Karte',
      print: 'Karte drucken',
      entropy: 'Jedes Zeichen bringt {bits} Bit. Ein Weg von 12 Zeichen: rund {total} Bit.',
      needOneType: 'Wählen Sie mindestens eine Zeichenart aus.',
      tableLabel: 'Passwortkarte: {rows} Zeilen und {columns} Spalten mit Zufallszeichen',
      printHint: 'Drucken Sie sie gleich aus: Die Karte gibt es nur in diesem Tab, später lässt sie sich nicht wiederherstellen.',
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
          a: 'Nein. Die Schweiz verwendet einen eigenen Standard, die „QR-Rechnung“, und GiroCodes sind für Euro-Zahlungen im SEPA-Raum gedacht. Für Schweizer Rechnungen nutzen Sie unseren Generator für QR-Rechnungen.',
        },
        {
          q: 'Brauche ich die BIC?',
          a: 'Für Zahlungen innerhalb des Europäischen Wirtschaftsraums nicht – Sie können das Feld leer lassen.',
        },
      ],
      seeAlso: { toolId: 'swiss-qr-bill', text: 'Rechnung an Kunden in der Schweiz? {link}: Zahlteil und Empfangsschein als PDF.' },
    },
    'swiss-qr-bill': {
      slug: 'qr-rechnung-erstellen',
      name: 'QR-Rechnung erstellen',
      short: 'QR-Rechnungen mit Empfangsschein als PDF.',
      title: 'QR-Rechnung erstellen – kostenlos als PDF, ohne Upload',
      description:
        'Schweizer QR-Rechnung mit Zahlteil und Empfangsschein als PDF erstellen (A4 oder nur Einzahlungsschein) oder nur den QR-Code. Aktueller SIX-Standard, kostenlos.',
      h1: 'QR-Rechnung erstellen',
      lead: 'Erstellen Sie Zahlteil und Empfangsschein einer Schweizer QR-Rechnung – als druckfertiges PDF oder als QR-Code für Ihre eigene Rechnungsvorlage. Nach dem aktuellen SIX-Standard und vollständig in Ihrem Browser.',
      steps: [
        'Geben Sie Ihre IBAN oder QR-IBAN, Ihren Namen und Ihre Adresse ein – also wer das Geld erhält.',
        'Ergänzen Sie nach Wunsch Betrag, Referenz, zusätzliche Informationen und die Adresse des Zahlenden. Was Sie leer lassen, füllt der Zahlende von Hand aus.',
        'Prüfen Sie die Vorschau. Laden Sie dann das PDF herunter – eine A4-Seite mit dem Einzahlungsschein unten oder nur den Einzahlungsschein – oder nur den QR-Code als PNG oder SVG.',
      ],
      sections: [
        {
          h: 'Was ist eine QR-Rechnung?',
          p: [
            'Die QR-Rechnung ist der Einzahlungsschein der Schweiz und Liechtensteins. Seit Oktober 2022 ist sie der einzige: Sie hat die alten orangen und roten Einzahlungsscheine abgelöst. Sie besteht aus zwei Teilen. Links steht der Empfangsschein, den der Zahlende bei einer Einzahlung am Postschalter behält. Rechts folgt der Zahlteil mit dem Swiss QR Code – dem quadratischen Code mit dem kleinen Schweizerkreuz in der Mitte.',
            'Der QR-Code enthält alles, was eine Bank braucht: Ihr Konto, Ihren Namen und Ihre Adresse, Betrag, Währung, Referenz und die Adresse des Zahlenden. Eine Banking-App liest ihn in einer Sekunde – niemand muss mehr eine IBAN oder eine 27-stellige Nummer abtippen. Dieselben Angaben stehen zusätzlich neben dem Code, für Zahlungen am Schalter oder von Hand im E-Banking.',
          ],
        },
        {
          h: 'IBAN oder QR-IBAN?',
          p: [
            'Eine QR-IBAN sieht aus wie eine normale IBAN, aber die Stellen 5 bis 9 – die Identifikationsnummer der Bank – liegen zwischen 30000 und 31999. Banken vergeben QR-IBANs an Kunden, die Zahlungseingänge automatisch zuordnen möchten: Eine Zahlung auf eine QR-IBAN trägt immer eine 27-stellige QR-Referenz, anhand derer Ihre Buchhaltungssoftware die richtige Rechnung als bezahlt markiert. Fragen Sie Ihre Bank, wenn Sie eine brauchen – meist ist es eine zusätzliche Nummer für Ihr bestehendes Konto.',
            'Mit einer normalen IBAN verwenden Sie die internationale Creditor Reference (sie beginnt mit RF) oder gar keine Referenz. Schreiben Sie dann die Rechnungsnummer in die zusätzlichen Informationen, damit Sie wissen, wofür eine Zahlung ist. Der Generator prüft die IBAN und die Prüfziffern beider Referenzarten und meldet, wenn etwas nicht zusammenpasst.',
          ],
        },
        {
          h: 'Seit November 2025: nur noch strukturierte Adressen',
          p: [
            'Seit dem 21. November 2025 akzeptieren Banken nur noch QR-Rechnungen mit strukturierten Adressen: Straße, Hausnummer, Postleitzahl und Ort stehen je in einem eigenen Feld. Die ältere „kombinierte“ Adresse – zwei freie Zeilen wie „Rue du Lac 1268“ und „2501 Biel“ – ist nicht mehr erlaubt, und Zahlungen mit solchen Rechnungen können abgelehnt werden. Erzeugen Ihre Buchhaltungssoftware oder alte Vorlagen noch kombinierte Adressen, ist es Zeit, sie zu ersetzen.',
            'Dieser Generator erstellt ausschließlich strukturierte Adressen, wie es Version 2.3 der Implementation Guidelines von SIX verlangt. Straße und Hausnummer sind optional – manche Adressen haben keine –, Postleitzahl, Ort und Land sind dagegen immer nötig.',
          ],
        },
        {
          h: 'QR-Rechnung richtig drucken',
          p: [
            'Der Einzahlungsschein ist genau 210 × 105 mm groß: das untere Drittel eines A4-Blatts. Drucken Sie das A4-PDF in Originalgröße (100 %), nicht „an Seite anpassen“ – sonst wird der QR-Code kleiner als die vorgeschriebenen 46 × 46 mm. Normales weißes Papier genügt. Auf Papier ohne Perforation zeigen die gestrichelten Linien mit der Schere, wo abgetrennt wird – so verlangt es der Standard.',
            'Das PDF mit nur dem Einzahlungsschein eignet sich für perforiertes QR-Rechnungspapier oder als letzte Seite Ihrer eigenen Rechnung. Eine QR-Rechnung als PDF per E-Mail zu verschicken ist ebenfalls erlaubt: Ihre Kunden scannen den Code direkt vom Bildschirm. Brauchen Sie den Code in Ihrer eigenen Rechnungsvorlage? Laden Sie ihn als SVG (in jeder Größe scharf) oder PNG herunter und platzieren Sie ihn in 46 × 46 mm.',
          ],
        },
      ],
      faq: [
        {
          q: 'Akzeptieren Banken diese QR-Rechnungen?',
          a: 'Ja. Sie entsprechen den Implementation Guidelines (Version 2.3) und dem Style Guide von SIX, deshalb kann jede Banking-App in der Schweiz und in Liechtenstein sie scannen. Wie bei jeder neuen Rechnungsvorlage lohnt es sich, die erste Rechnung vor dem Versand mit der eigenen Banking-App zu testen.',
        },
        {
          q: 'Werden meine Bankdaten und Adressen hochgeladen?',
          a: 'Nein. QR-Code und PDF entstehen in Ihrem Browser. Ihre IBAN, Namen und Adressen verlassen Ihr Gerät nie – wir können sie nicht sehen, und nach dem Schließen der Seite bleibt nichts zurück.',
        },
        {
          q: 'Woher bekomme ich eine QR-Referenz?',
          a: 'Meist aus Ihrer Buchhaltungssoftware. Haben Sie nur eine Rechnungs- oder Kundennummer, tippen Sie sie ins Referenzfeld und klicken Sie auf „Prüfziffer ergänzen“: Der Generator füllt sie auf 27 Stellen auf und hängt die Prüfziffer an. Manche Banken verlangen ihre eigene Kundennummer am Anfang jeder QR-Referenz – fragen Sie im Zweifel Ihre Bank.',
        },
        {
          q: 'Kann ich Betrag oder Zahlenden leer lassen?',
          a: 'Ja. Die Rechnung zeigt dann leere Felder mit Eckmarken, und der Zahlende trägt Betrag oder Name und Adresse von Hand ein – praktisch für Spenden oder für Einzahlungsscheine, die Sie verteilen.',
        },
        {
          q: 'Funktioniert das auch mit Euro?',
          a: 'Ja – wählen Sie EUR. Das Konto muss trotzdem eine Schweizer oder Liechtensteiner IBAN sein. Für Euro-Überweisungen auf Konten in anderen Ländern verwenden Sie stattdessen einen GiroCode (EPC-QR-Code).',
        },
      ],
      seeAlso: { toolId: 'epc-qr-code', text: 'Rechnung an Kunden im Euroraum? {link}: der Zahlungscode, den deren Banking-App scannt.' },
      privacy: {
        badge: 'Ihre Bankdaten verlassen nie Ihr Gerät',
        title: 'Warum Ihre Rechnungsdaten privat bleiben',
        text: 'QR-Rechnungen enthalten Namen, Adressen und Bankdaten. Deshalb läuft dieser Generator vollständig in Ihrem Browser: Was Sie eingeben, wird an keinen Server gesendet – weder an uns noch an Dritte. QR-Code und PDF entstehen auf Ihrem Gerät, und wenn Sie die Seite schließen, ist alles weg.',
      },
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
      seeAlso: { toolId: 'password-card', text: 'Lieber ein Passwort auf Papier? {link}: Drucken Sie ein Raster aus Zufallszeichen und lesen Sie Ihr Passwort darauf ab.' },
    },
    'password-card': {
      slug: 'passwortkarte',
      name: 'Passwortkarte',
      short: 'Druckbares Raster aus Zufallszeichen.',
      title: 'Passwortkarte erstellen – Zufallsraster zum Ausdrucken',
      description:
        'Passwortkarte erstellen: ein Raster aus Zufallszeichen fürs Portemonnaie oder den Schreibtisch. Sie merken sich nur Startfeld und Weg. Offline, nichts wird gespeichert.',
      h1: 'Passwortkarte erstellen',
      lead: 'Eine Passwortkarte ist ein Raster aus Zufallszeichen, das ins Portemonnaie passt. Sie merken sich nur, wo Sie anfangen und in welche Richtung Sie lesen – das eigentliche Passwort steht auf der Karte.',
      steps: [
        'Wählen Sie Größe und Zeichen – sofort erscheint eine neue Zufallskarte.',
        'Klicken Sie auf „Karte drucken“. Schneiden Sie die Karte im Scheckkartenformat aus oder bewahren Sie die A4-Seite sicher auf.',
        'Wählen Sie für jedes Konto ein Startfeld wie C4 und einen Weg, den Sie sich merken können, etwa „12 Zeichen nach rechts“. Die Zeichen entlang des Wegs sind Ihr Passwort.',
      ],
      sections: [
        {
          h: 'So verwenden Sie eine Passwortkarte',
          p: [
            'Stellen Sie sich die Karte als Landkarte vor: Das Geheimnis ist nicht die Karte, sondern wie Sie sie lesen. Wählen Sie ein Startfeld über Spaltenbuchstabe und Zeilennummer, dann einen Weg. Der einfachste Weg lautet „12 Zeichen nach rechts“. Andere sind genauso leicht zu merken: 6 nach rechts und dann 6 nach unten, eine Diagonale oder eine Zeile entlang und in der nächsten weiter. Am Rand geht es am Anfang der nächsten Zeile weiter.',
            'Sie können für alle Konten denselben Weg nutzen und nur das Startfeld ändern oder jedem Konto einen eigenen Weg geben. Eine kurze Notiz wie „Bank: F3“ ist harmlos – ohne die Karte nützt sie niemandem. Schreiben Sie die Startfelder nur nicht auf die Karte selbst.',
          ],
        },
        {
          h: 'Wie sicher ist das?',
          p: [
            'Jedes Zeichen stammt aus dem kryptografischen Zufallsgenerator Ihres Browsers (crypto.getRandomValues) – demselben, der auch für Verschlüsselung verwendet wird. Entlang eines Wegs von 12 Zeichen ergibt eine Karte mit Buchstaben, Ziffern und Sonderzeichen ein Passwort mit rund 76 Bit: so stark wie eines aus einem Passwort-Generator und viel stärker als alles, was man sich selbst ausdenkt.',
            'Die Schwachstelle ist die Karte selbst: Wer sie hat und Ihr Startfeld und Ihren Weg errät, kann das Passwort finden. Bewahren Sie sie auf wie eine Bankkarte und drucken Sie eine neue, wenn Sie sie verlieren. Für die meisten Menschen ist ein Passwort-Manager bequemer; eine Passwortkarte eignet sich gut für einige wichtige Passwörter, als Reserve oder für alle, die keine App verwenden möchten.',
          ],
        },
        {
          h: 'Tipps zum Drucken',
          p: [
            'Drucken Sie in Originalgröße (100 %). Die Karte im Scheckkartenformat ist genau so groß wie eine Bankkarte – 85,6 × 54 mm – und passt in jedes Kartenfach und jede Schutzhülle; schneiden Sie entlang des gestrichelten Rands. Die A4-Seite hat ein größeres Raster mit größerer Schrift, praktisch zu Hause neben dem Computer. Im Druckdialog können Sie auch „Als PDF speichern“ wählen – bewahren Sie die Datei sicher auf, denn sie ist so wertvoll wie die Karte aus Papier.',
          ],
        },
      ],
      faq: [
        {
          q: 'Wird meine Karte gespeichert oder gesendet?',
          a: 'Nein. Die Karte entsteht in Ihrem Browser und verlässt Ihr Gerät nie. Wir können sie nicht sehen, und sobald Sie die Seite schließen oder neu laden, ist sie endgültig weg – niemand, auch wir nicht, kann sie wiederherstellen.',
        },
        {
          q: 'Warum ähnliche Zeichen vermeiden?',
          a: 'Auf Papier verwechselt man I und l oder O und 0 leicht – besonders bei kleiner Schrift. Sie wegzulassen kostet ein klein wenig Stärke, erspart aber viele fehlgeschlagene Anmeldungen.',
        },
        {
          q: 'Was, wenn eine Website eine Ziffer oder ein Sonderzeichen verlangt?',
          a: 'Schauen Sie entlang Ihres Wegs: Sind alle Zeichenarten aktiviert, sind Ziffern und Sonderzeichen überall eingestreut. Fehlt eines, verlängern Sie den Weg um ein, zwei Zeichen oder hängen Sie ein festes Zeichen an, das Sie sich merken, etwa „!“.',
        },
        {
          q: 'Kann ich dieselbe Karte später noch einmal bekommen?',
          a: 'Nein, und das ist Absicht: Die Karte wird nirgends gespeichert. Drucken Sie sie aus – oder speichern Sie sie über den Druckdialog als PDF –, bevor Sie die Seite schließen.',
        },
      ],
      seeAlso: { toolId: 'password-generator', text: 'Ein einzelnes Passwort für den Passwort-Manager gesucht? {link}: starke Zufallspasswörter, offline erstellt.' },
      privacy: {
        badge: 'Ihre Karte wird nie gesendet oder gespeichert',
        title: 'Warum Ihre Karte privat bleibt',
        text: 'Die Karte entsteht auf Ihrem Gerät mit dem sicheren Zufallsgenerator Ihres Browsers. Sie wird an keinen Server gesendet und nirgends gespeichert – auch nicht in Ihrem Browser. Es gibt nur den Ausdruck, und Sie allein entscheiden, wo die Karte liegt.',
      },
    },
  },
};
