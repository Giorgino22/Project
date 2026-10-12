/**
 * ALL ENGLISH TEXTS of the website.
 *
 * Other languages copy this structure (see de.ts). TypeScript checks that every
 * language has exactly the same keys, so nothing can be forgotten.
 * Placeholders like {name} are filled in by the code (see `fill` in src/lib/format.ts).
 */
import { IMAGE_FORMATS, type ImageFormat } from '../lib/formats';
import type { MainToolId } from '../tools/registry';

/** The texts of one tool page. */
export interface ToolText {
  /** Last part of the URL, e.g. "merge-pdf" → /merge-pdf/ */
  slug: string;
  /** Short name for menus and cards */
  name: string;
  /** One short sentence for tool cards (max. ~45 characters) */
  short: string;
  /** Browser tab title and Google headline (keep it under ~55 characters) */
  title: string;
  /** Google snippet (keep it under ~155 characters) */
  description: string;
  h1: string;
  lead: string;
  steps: string[];
  faq: { q: string; a: string }[];
}

export const en = {
  lang: 'en',
  /** Used for Facebook/LinkedIn previews */
  locale: 'en_US',
  /** Name of the language in the language menu */
  name: 'English',

  nav: {
    skip: 'Skip to content',
    home: 'Home',
    allTools: 'All tools',
    language: 'Language',
  },

  categories: {
    pdf: 'PDF tools',
    image: 'Image tools',
    generator: 'Generators',
  },

  categoryIntros: {
    pdf: 'Merge, split, rotate and convert PDF files – even confidential ones.',
    image: 'Compress, resize and convert photos, and remove hidden location data.',
    generator: 'Create QR codes, payment codes and strong passwords.',
  },

  badge: 'Your files never leave your device',

  footer: {
    about: 'All tools run directly in your browser. Your files are never uploaded to a server.',
    privacy: 'Privacy policy',
    imprint: 'Legal notice',
    languages: 'Languages',
    moreTools: 'More free tools',
    allTools: 'All our tools',
  },

  home: {
    title: '{site} – Free PDF & Image Tools Without Uploads',
    description:
      'Merge and split PDFs, compress and convert images, create QR codes and passwords. Free, no sign-up – everything runs in your browser, nothing is uploaded.',
    h1: 'Free PDF & image tools that never upload your files',
    lead: 'Merge PDFs, compress photos, create QR codes and more. Every tool runs directly in your browser – so your files stay on your device. Always.',
    cta: 'Choose a tool',
    features: [
      {
        title: 'Private by design',
        text: 'Your files are processed on your own device. They are never uploaded, stored or seen by anyone – not even by us.',
      },
      {
        title: 'Free & unlimited',
        text: 'No sign-up, no watermarks, no daily limits. Use every tool as often as you like.',
      },
      {
        title: 'Fast',
        text: 'No waiting for uploads and downloads. Most tasks are done in a second – it even works offline once the page has loaded.',
      },
    ],
    verifyTitle: 'Don’t trust us – check it yourself',
    verifyText:
      'Open your browser’s developer tools (F12 on most computers), switch to the “Network” tab and use any tool. You will see that your file is never sent anywhere.',
    faqTitle: 'Questions & answers',
    faq: [
      {
        q: 'How can the tools work without uploading my files?',
        a: 'Modern browsers are powerful enough to edit PDFs and images themselves. When you open a tool, your browser loads the program once – after that, your own device does all the work.',
      },
      {
        q: 'Is it really free?',
        a: 'Yes. The site is financed by advertising and voluntary tips – never by selling your data. There are no hidden limits or paid “pro” versions of these tools.',
      },
      {
        q: 'Do I need to install anything?',
        a: 'No. Everything works in your browser on Windows, Mac, Linux, Android and iPhone.',
      },
      {
        q: 'Is it safe for confidential documents?',
        a: 'Yes – that’s exactly what it’s made for. Contracts, bank statements, IDs or medical documents never leave your device, so they can’t be leaked, stored or analysed by a server.',
      },
    ],
  },

  toolPage: {
    howTo: 'How it works',
    faq: 'Frequently asked questions',
    related: 'More free tools',
    privacyTitle: 'Why your files stay private',
    privacyText:
      'Most online tools upload your files to their servers. This one doesn’t: the program runs inside your browser, so your files are processed on your own device and are never sent anywhere. You can even go offline after the page has loaded.',
    aboutFormats: 'About the formats',
    popularConversions: 'Popular conversions',
  },

  support: {
    title: 'Did this save you time?',
    text: 'This site is free and has no paywalls. If you’d like to say thanks, you can buy me a coffee.',
    button: 'Buy me a coffee',
  },

  ads: {
    label: 'Advertisement',
    affiliateLabel: 'Ad · Recommendation',
  },

  notFound: {
    title: 'Page not found',
    text: 'This page doesn’t exist (anymore). Maybe one of these tools is what you were looking for:',
    home: 'Go to the homepage',
  },

  legal: {
    privacy: {
      slug: 'privacy',
      title: 'Privacy policy',
      description: 'How {site} handles your data: your files are processed in your browser and never uploaded.',
      updated: 'Last updated: {date}',
      intro:
        'In short: the tools on this website process your files entirely in your web browser. Your files are never uploaded to us or to anyone else. Below we explain which other data is processed when you visit this website.',
      controllerTitle: 'Who is responsible',
      controllerText: 'Responsible for data processing on this website:',
      filesTitle: 'Your files and inputs',
      filesText:
        'Files you open with our tools (for example PDFs and images) and anything you type into a tool (for example QR code content or bank details) are processed only on your device, inside your browser. They are not transmitted to our servers or to third parties, and we cannot see them. When you close the page, they are gone.',
      hostingTitle: 'Hosting and server log files',
      hostingText:
        'This website is delivered by {hostName}, {hostAddress}. When you open a page, your browser automatically transmits technical information such as your IP address, the date and time, the requested page and your browser type. The host needs this to deliver the website and to protect it against attacks. The legal basis is our legitimate interest in a secure and reliable website (Art. 6(1)(f) GDPR). Data may be processed outside the EU and Switzerland. More information: {hostPrivacyUrl}',
      analyticsTitle: 'Visitor statistics',
      analyticsText:
        'We use Cloudflare Web Analytics to count page views. It does not use cookies, does not create user profiles and does not store complete IP addresses. The legal basis is our legitimate interest in knowing which tools are used (Art. 6(1)(f) GDPR).',
      adsTitle: 'Advertising (Google AdSense)',
      adsText:
        'To keep the tools free, we show ads from Google AdSense, a service of Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland. Google may use cookies and similar technologies to show ads and to measure their performance. Personalised ads are only shown if you agree in the consent banner, and you can change your choice at any time. Data may be transferred to Google LLC in the USA. More information: https://policies.google.com/technologies/ads',
      affiliateTitle: 'Affiliate links',
      affiliateText:
        'Some recommendations on this website are affiliate links and are marked as ads. If you buy something after clicking such a link, we may receive a commission – the price for you stays the same. When you click, the partner may record that you came from our website.',
      supportTitle: 'Tips',
      supportText:
        'If you use the tip button, you are taken to an external payment provider. Their privacy policy applies there; we only receive the information you choose to share.',
      cookiesTitle: 'Cookies',
      cookiesNone: 'We do not use cookies.',
      cookiesAds:
        'We do not set cookies ourselves. The advertising provider may set cookies as described above, depending on your consent.',
      rightsTitle: 'Your rights',
      rightsText:
        'You have the right to access, correct and delete your personal data, to restrict or object to its processing, and to data portability. You can also lodge a complaint with a data protection authority. To exercise your rights, contact us using the details above.',
    },
    imprint: {
      slug: 'imprint',
      title: 'Legal notice',
      description: 'Legal notice of {site}: who runs this website and how to get in touch. Free PDF and image tools that work without uploads.',
      operatorTitle: 'Operator of this website',
      contactTitle: 'Contact',
      emailLabel: 'E-mail',
      disclaimerTitle: 'Disclaimer',
      disclaimerText:
        'The tools are provided free of charge and without any warranty. Please always keep a copy of your original files. We are not responsible for the content of external websites we link to.',
      missing: 'The operator details have not been filled in yet (packages/shared/src/network.ts → owner).',
    },
  },

  /** Texts shared by all tool components (also used by their browser scripts). */
  common: {
    chooseFile: 'Choose file',
    chooseFiles: 'Choose files',
    orDrop: 'or drop it here',
    orDropMany: 'or drop them here',
    dropNow: 'Drop to add',
    addMore: 'Add more',
    processing: 'Working on it…',
    download: 'Download',
    downloadAll: 'Download all (ZIP)',
    startOver: 'Start over',
    remove: 'Remove',
    moveUp: 'Move up',
    moveDown: 'Move down',
    pagesOne: '1 page',
    pagesMany: '{count} pages',
    pagesAll: 'All pages',
    pagesSome: 'Only these pages:',
    pagesPlaceholder: 'e.g. 1-3, 5',
    pagesHelp: 'Separate with commas, use a dash for ranges.',
    done: 'Done!',
    smaller: '{percent}% smaller',
    keptOriginal: 'Already optimal – original kept',
    errorGeneric: 'Something went wrong: {message}',
    errorNotPdf: '“{name}” is not a PDF or is damaged.',
    errorNotImage: '“{name}” is not an image your browser can open.',
    errorMemory: 'Your device ran out of memory. Please try fewer or smaller files.',
    passwordNeeded: '“{name}” is protected with a password. Please enter it:',
    passwordWrong: 'That password is not correct. Please try again:',
    passwordLabel: 'Password',
    passwordSubmit: 'Unlock',
    cancel: 'Cancel',
    cancelled: 'Cancelled.',
    rangeEmpty: 'Please enter the pages.',
    rangeInvalid: '“{token}” is not a valid page or range. Example: 1-3, 5',
    rangeOutOfRange: '“{token}” is outside this document (it has {count} pages).',
  },

  /** Texts used by single tool components. */
  components: {
    MergePdf: {
      button: 'Merge PDFs',
      needTwo: 'Add at least two PDF files.',
      result: 'Your merged PDF has {pages}.',
    },
    SplitPdf: {
      modeLabel: 'What do you want to do?',
      modeExtract: 'Extract pages into one PDF',
      modeEach: 'Save every page as its own PDF',
      modeRanges: 'One PDF for each range',
      pagesLabel: 'Pages',
      button: 'Split PDF',
      result: 'Created {count} file(s).',
    },
    RotatePdf: {
      directionLabel: 'Rotate by',
      right: '90° clockwise',
      left: '90° counter-clockwise',
      flip: '180°',
      pagesLabel: 'Which pages?',
      button: 'Rotate PDF',
    },
    DeletePdfPages: {
      pagesLabel: 'Pages to delete',
      button: 'Delete pages',
      cannotDeleteAll: 'You can’t delete every page.',
      result: 'The new PDF has {pages}.',
    },
    ImagesToPdf: {
      pageSizeLabel: 'Page size',
      a4: 'A4',
      letter: 'US Letter',
      fit: 'Same as image',
      orientationLabel: 'Orientation',
      auto: 'Automatic',
      portrait: 'Portrait',
      landscape: 'Landscape',
      marginLabel: 'Margin',
      marginNone: 'None',
      marginSmall: 'Small',
      marginLarge: 'Large',
      button: 'Create PDF',
    },
    PdfToImages: {
      formatLabel: 'Image format',
      resolutionLabel: 'Resolution',
      resolutionLow: 'Low (72 DPI)',
      resolutionMedium: 'Standard (150 DPI)',
      resolutionHigh: 'High (300 DPI)',
      pagesLabel: 'Which pages?',
      button: 'Convert to images',
      progress: 'Rendering page {current} of {total}…',
    },
    CompressImage: {
      qualityLabel: 'Quality',
      qualityHelp: 'Lower quality = smaller file. 75% is a good balance.',
      formatLabel: 'Save as',
      formatSame: 'Same format',
      button: 'Compress',
    },
    ResizeImage: {
      modeLabel: 'Resize by',
      modePercent: 'Percentage',
      modePixels: 'Pixels',
      percentLabel: 'New size',
      widthLabel: 'Width (px)',
      heightLabel: 'Height (px)',
      keepAspect: 'Keep aspect ratio',
      button: 'Resize',
      needSize: 'Please enter a width or a height.',
    },
    ConvertImage: {
      toLabel: 'Convert to',
      qualityLabel: 'Quality',
      backgroundLabel: 'Background for transparent areas',
      button: 'Convert',
      webpUnsupported:
        'Your browser can’t create WebP images. Please use a current version of Chrome, Edge or Firefox.',
    },
    RemoveExif: {
      button: 'Remove metadata',
      found: 'Hidden information found:',
      nothingFound: 'No metadata found – this file looks clean.',
      gps: 'Location (GPS)',
      camera: 'Camera',
      date: 'Date taken',
      software: 'Software',
      author: 'Author / copyright',
      otherFields: '+ {count} more fields',
      mapLink: 'Show on map',
      removedList: 'Removed: {list}',
      nothingRemoved: 'Nothing to remove – the file was already clean.',
      unsupported: '“{name}”: only JPG, PNG and WebP files can be cleaned.',
      kinds: {
        exif: 'EXIF',
        xmp: 'XMP',
        iptc: 'IPTC',
        comment: 'comments',
        text: 'text notes',
        time: 'timestamp',
        other: 'other hidden data',
      },
    },
    QrCode: {
      typeLabel: 'Content',
      typeUrl: 'Website',
      typeText: 'Text',
      typeWifi: 'Wi-Fi',
      typeEmail: 'E-mail',
      typePhone: 'Phone',
      urlLabel: 'Web address',
      urlPlaceholder: 'https://example.com',
      textLabel: 'Text',
      ssidLabel: 'Network name (SSID)',
      wifiPasswordLabel: 'Password',
      securityLabel: 'Security',
      securityNone: 'None (open network)',
      hiddenLabel: 'Hidden network',
      emailLabel: 'E-mail address',
      subjectLabel: 'Subject (optional)',
      bodyLabel: 'Message (optional)',
      phoneLabel: 'Phone number',
      colorLabel: 'Color',
      backgroundLabel: 'Background',
      sizeLabel: 'Size (PNG)',
      errorCorrectionLabel: 'Error correction',
      errorCorrectionHelp: 'Higher = still readable when damaged or covered, but more dense.',
      downloadPng: 'Download PNG',
      downloadSvg: 'Download SVG',
      emptyHint: 'Fill in the fields to see your QR code.',
      tooLong: 'Too much content for one QR code. Please shorten it.',
      lowContrast: 'Low contrast – some phones may not be able to scan this code.',
    },
    EpcQrCode: {
      nameLabel: 'Recipient name',
      ibanLabel: 'IBAN',
      bicLabel: 'BIC (optional)',
      amountLabel: 'Amount in EUR (optional)',
      referenceLabel: 'Payment reference (optional)',
      referenceHelp: 'For example an invoice number, or an RF creditor reference.',
      downloadPng: 'Download PNG',
      downloadSvg: 'Download SVG',
      emptyHint: 'Enter a name and an IBAN to create the code.',
      errors: {
        name: 'Please enter the recipient name (max. 70 characters).',
        iban: 'This IBAN is not valid – please check it.',
        bic: 'This BIC is not valid.',
        amount: 'Please enter an amount between 0.01 and 999,999,999.99.',
        reference: 'The reference can have at most 140 characters.',
        'too-long': 'Too much text in total. Please shorten the name or the reference.',
      },
    },
    PasswordGenerator: {
      charactersLabel: 'Characters',
      lengthLabel: 'Length',
      lowercase: 'Lowercase (a–z)',
      uppercase: 'Uppercase (A–Z)',
      digits: 'Numbers (0–9)',
      symbols: 'Symbols (!#$…)',
      avoidAmbiguous: 'Avoid look-alikes (I, l, 1, O, 0)',
      generate: 'New password',
      copy: 'Copy',
      copied: 'Copied!',
      strengthLabel: 'Strength',
      strengths: {
        weak: 'Weak',
        fair: 'Fair',
        strong: 'Strong',
        excellent: 'Excellent',
      },
      entropy: '{bits} bits of entropy',
      needOneType: 'Select at least one character type.',
    },
  },

  /** Short descriptions of image formats, shown on the converter pages. */
  formats: {
    jpg: 'JPG (or JPEG) is the most widely used photo format. It uses lossy compression to keep files small, which is perfect for photos but can blur sharp text and lines. JPG does not support transparency.',
    png: 'PNG is a lossless format: every pixel is stored exactly. It is ideal for screenshots, logos, text and graphics, and it supports transparency. Photos saved as PNG are much larger than as JPG.',
    webp: 'WebP is a modern format developed by Google. It makes images about 25–35% smaller than JPG at the same visual quality and supports transparency. All current browsers can display it.',
  } satisfies Record<ImageFormat, string>,

  /** Texts of the format converter pages ("PNG to JPG" etc.), built from the formats involved. */
  converter(from: ImageFormat, to: ImageFormat): ToolText {
    const F = IMAGE_FORMATS[from].label;
    const T = IMAGE_FORMATS[to].label;
    const toLossy = IMAGE_FORMATS[to].lossy;
    const losesTransparency = IMAGE_FORMATS[from].transparency && !IMAGE_FORMATS[to].transparency;
    const why = {
      jpg: 'JPG works everywhere and keeps photos small.',
      png: 'PNG is lossless and keeps sharp edges and transparency.',
      webp: 'WebP files are much smaller – ideal for websites.',
    }[to];
    const reason = {
      jpg: 'Almost every program, website and device accepts JPG, and photos become much smaller than as PNG.',
      png: 'PNG is the right choice when you want to edit an image further without losing more quality, or when it contains text, lines or transparency.',
      webp: 'WebP images are typically 25–35% smaller than JPG at the same quality, so websites load faster and use less data.',
    }[to];

    return {
      slug: `${from}-to-${to}`,
      name: `${F} to ${T}`,
      short: `Convert ${F} images to ${T}.`,
      title: `${F} to ${T} – Convert Free, Without Uploading`,
      description: `Convert ${F} to ${T} for free, right in your browser. ${why} No upload, no sign-up, batch conversion.`,
      h1: `Convert ${F} to ${T}`,
      lead: `Turn ${F} images into ${T} files in seconds. ${why}`,
      steps: [
        `Choose one or more ${F} images (or drag them onto the box).`,
        toLossy
          ? 'Adjust the quality if you like – 90% is a good default.'
          : `There is nothing to set: ${T} is lossless.`,
        `Click “Convert” and download your ${T} files.`,
      ],
      faq: [
        {
          q: `Does converting ${F} to ${T} reduce the quality?`,
          a: toLossy
            ? `${T} uses lossy compression, but at the default quality of 90% the difference is practically invisible. Choose 100% for the best possible quality.`
            : `No. ${T} is lossless, so the image looks exactly the same as before. The file can get bigger, because ${T} doesn’t throw away any information.`,
        },
        losesTransparency
          ? {
              q: 'What happens to transparent areas?',
              a: `${T} can’t store transparency, so transparent areas are filled with a background color – white by default, or any color you choose.`,
            }
          : { q: `Why convert ${F} to ${T}?`, a: reason },
        {
          q: 'Can I convert many images at once?',
          a: 'Yes. Select as many images as you like – you can download each file separately or all of them in one ZIP archive.',
        },
        {
          q: 'Are my images uploaded?',
          a: 'No. The conversion runs entirely in your browser. Your images never leave your device.',
        },
      ],
    };
  },

  /** Texts of every tool page (except the converter pages, see `converter` above). */
  tools: {
    'merge-pdf': {
      slug: 'merge-pdf',
      name: 'Merge PDF',
      short: 'Combine several PDFs into one file.',
      title: 'Merge PDF Files – Free & Without Uploading',
      description:
        'Combine several PDFs into one file in seconds. Free, no sign-up, no watermark – your files are merged in your browser and never uploaded.',
      h1: 'Merge PDF files',
      lead: 'Combine several PDFs into one document. Put them in the right order, click merge – done. Your files never leave your device.',
      steps: [
        'Choose the PDF files you want to combine, or drag them onto the box.',
        'Put them in the right order with the arrow buttons.',
        'Click “Merge PDFs” and download your new document.',
      ],
      faq: [
        {
          q: 'Are my PDF files uploaded to a server?',
          a: 'No. The merging happens entirely in your web browser. Your files are never sent anywhere – you can even disconnect from the internet after the page has loaded.',
        },
        {
          q: 'Is there a limit on the number or size of files?',
          a: 'No artificial limit. Because your own device does the work, the only limit is its memory. Documents with hundreds of pages work fine on any modern computer or phone.',
        },
        {
          q: 'Can I merge password-protected PDFs?',
          a: 'Yes. PDFs that only restrict printing or copying open automatically. If a PDF needs a password to open, you will be asked for it – the password is only used inside your browser.',
        },
        {
          q: 'Will the quality change?',
          a: 'No. Pages are copied exactly as they are – text, images and fonts stay identical. Bookmarks and fillable form fields of the original files are not carried over.',
        },
      ],
    },
    'split-pdf': {
      slug: 'split-pdf',
      name: 'Split PDF',
      short: 'Extract pages or split a PDF into parts.',
      title: 'Split PDF – Extract Pages Free, No Upload',
      description:
        'Split a PDF into several files or extract just the pages you need. Free and private: everything happens in your browser, nothing is uploaded.',
      h1: 'Split a PDF',
      lead: 'Extract specific pages, save every page as its own PDF, or cut a document into parts – without uploading it anywhere.',
      steps: [
        'Choose the PDF you want to split.',
        'Pick what you want to do and enter the pages, for example “1-3, 5”.',
        'Click “Split PDF” and download the result.',
      ],
      faq: [
        {
          q: 'How do I enter page numbers?',
          a: 'Separate pages with commas and use a dash for ranges: “1-3, 5, 8-10”. “7-” means from page 7 to the end.',
        },
        {
          q: 'What is the difference between the options?',
          a: '“Extract pages” puts the pages you choose into one new PDF. “Every page as its own PDF” creates one file per page. “One PDF for each range” creates one file per range you type – “1-3, 4-6” gives two files.',
        },
        {
          q: 'Is it safe to split confidential documents?',
          a: 'Yes. The PDF is processed by your own browser and never uploaded, so contracts, statements and other sensitive files stay private.',
        },
        {
          q: 'Will I get lots of downloads?',
          a: 'No. When the result consists of several files, you get one ZIP archive that contains all of them.',
        },
      ],
    },
    'rotate-pdf': {
      slug: 'rotate-pdf',
      name: 'Rotate PDF',
      short: 'Turn pages permanently by 90° or 180°.',
      title: 'Rotate PDF Pages – Free, Without Uploading',
      description:
        'Rotate all or selected pages of a PDF by 90° or 180° and save the result permanently. Free, private and without sign-up.',
      h1: 'Rotate PDF pages',
      lead: 'Fix sideways or upside-down scans: rotate every page or just the ones you choose, and save the PDF permanently.',
      steps: [
        'Choose your PDF file.',
        'Select the direction and which pages to rotate.',
        'Click “Rotate PDF” and download the corrected file.',
      ],
      faq: [
        {
          q: 'Is the rotation permanent?',
          a: 'Yes. The rotation is saved in the PDF itself, so the pages appear correctly in every PDF viewer and when printing.',
        },
        {
          q: 'Can I rotate only some pages?',
          a: 'Yes. Choose “Only these pages” and enter page numbers such as “2, 4-6”.',
        },
        {
          q: 'Does rotating reduce the quality?',
          a: 'No. Only the orientation of the page changes; its content is not touched or re-compressed.',
        },
        {
          q: 'Is my file uploaded?',
          a: 'No. Your browser does all the work locally – the file is never sent to a server.',
        },
      ],
    },
    'delete-pdf-pages': {
      slug: 'delete-pdf-pages',
      name: 'Delete PDF pages',
      short: 'Remove unwanted pages from a PDF.',
      title: 'Delete Pages from a PDF – Free, No Upload',
      description:
        'Remove unwanted pages from a PDF in seconds: enter the page numbers and download the cleaned-up file. Private – nothing is uploaded.',
      h1: 'Delete pages from a PDF',
      lead: 'Remove blank, duplicate or confidential pages from a PDF. All other pages stay exactly as they were.',
      steps: [
        'Choose the PDF file.',
        'Enter the pages you want to remove, for example “2, 5-7”.',
        'Click “Delete pages” and download the new PDF.',
      ],
      faq: [
        {
          q: 'Can I undo it?',
          a: 'Your original file is never changed – you always get a new copy. If you made a mistake, simply start again.',
        },
        {
          q: 'Is the content of deleted pages really gone?',
          a: 'Yes. Deleted pages are not copied into the new PDF at all, so their content is really gone – not just hidden.',
        },
        {
          q: 'How do I know the page numbers?',
          a: 'The number of pages is shown as soon as you choose the file. Page 1 is the first page, no matter what numbers are printed on the pages.',
        },
        {
          q: 'Is my file uploaded?',
          a: 'No. Everything happens in your browser.',
        },
      ],
    },
    'jpg-to-pdf': {
      slug: 'jpg-to-pdf',
      name: 'JPG to PDF',
      short: 'Turn photos and scans into one PDF.',
      title: 'JPG to PDF – Convert Images Free, No Upload',
      description:
        'Turn JPG, PNG or WebP images into one PDF. Choose the order, page size and margins. Free, private and done right in your browser.',
      h1: 'Convert JPG to PDF',
      lead: 'Combine photos, scans or screenshots into one PDF – perfect for applications, receipts and forms.',
      steps: [
        'Choose one or more images (JPG, PNG or WebP).',
        'Arrange the order and choose page size, orientation and margin.',
        'Click “Create PDF” and download it.',
      ],
      faq: [
        {
          q: 'Which image formats are supported?',
          a: 'JPG, PNG and WebP, plus every other format your browser can display, such as GIF, BMP or AVIF.',
        },
        {
          q: 'Will my photos lose quality?',
          a: 'No. JPG and PNG images are embedded unchanged. Only images in other formats, and photos that first need to be turned upright, are re-encoded at high quality.',
        },
        {
          q: 'Can I put several images into one PDF?',
          a: 'Yes. Each image becomes one page, in the order you choose.',
        },
        {
          q: 'Are my photos uploaded?',
          a: 'No. The PDF is created in your browser, and your images never leave your device.',
        },
      ],
    },
    'pdf-to-jpg': {
      slug: 'pdf-to-jpg',
      name: 'PDF to JPG',
      short: 'Save PDF pages as JPG or PNG images.',
      title: 'PDF to JPG – Convert PDF Pages to Images',
      description:
        'Convert the pages of a PDF into high-quality JPG or PNG images. Free, private and without sign-up – everything is processed in your browser.',
      h1: 'Convert PDF to JPG',
      lead: 'Save PDF pages as images to share them in chats, on social media or in presentations.',
      steps: [
        'Choose a PDF file.',
        'Pick the image format, the resolution and which pages you need.',
        'Click “Convert to images” and download them – several pages come as one ZIP file.',
      ],
      faq: [
        {
          q: 'Which resolution should I choose?',
          a: '“Standard” (150 DPI) is good for screens. Choose “High” (300 DPI) for printing or when you need to zoom in a lot.',
        },
        {
          q: 'JPG or PNG?',
          a: 'JPG gives smaller files and is ideal for photos and scans. PNG is lossless and best for text, diagrams and screenshots.',
        },
        {
          q: 'Does it work with scanned PDFs?',
          a: 'Yes. Every page is rendered exactly as it looks in a PDF viewer.',
        },
        {
          q: 'Is my PDF uploaded?',
          a: 'No. The pages are rendered by your browser – nothing is sent to a server.',
        },
      ],
    },
    'compress-image': {
      slug: 'compress-image',
      name: 'Compress image',
      short: 'Make JPG, PNG and WebP files smaller.',
      title: 'Compress Images – JPG, PNG & WebP, No Upload',
      description:
        'Make images smaller without visible quality loss. Compress JPG, PNG and WebP in your browser – free, private and unlimited.',
      h1: 'Compress images',
      lead: 'Shrink photos and graphics for e-mails, websites and uploads. You choose the quality – and your images stay on your device.',
      steps: [
        'Choose one or more images.',
        'Adjust the quality – 75% is a good balance between size and quality.',
        'Click “Compress” and download the smaller files.',
      ],
      faq: [
        {
          q: 'How much smaller will my images get?',
          a: 'Typical photos shrink by 40–80% at 75% quality. Images that are already well compressed shrink less – if a result would be bigger, you simply get the original back.',
        },
        {
          q: 'How are PNG files compressed?',
          a: 'PNGs are reduced to a smart palette of up to 256 colors – the same technique popular PNG compressors use. Transparency is kept, and files usually get 50–70% smaller.',
        },
        {
          q: 'Is hidden metadata removed?',
          a: 'Yes. Compressed images no longer contain EXIF data such as GPS location or camera details.',
        },
        {
          q: 'Are my images uploaded?',
          a: 'No. Compression runs entirely in your browser.',
        },
      ],
    },
    'resize-image': {
      slug: 'resize-image',
      name: 'Resize image',
      short: 'Change the size in pixels or percent.',
      title: 'Resize Images – Pixels or Percent, No Upload',
      description:
        'Resize JPG, PNG and WebP images to exact pixel sizes or by percentage. Resize many images at once – free and private.',
      h1: 'Resize images',
      lead: 'Change the width and height of your images in pixels or percent – one image or many at once.',
      steps: [
        'Choose one or more images.',
        'Enter a new width and/or height, or choose a percentage.',
        'Click “Resize” and download the result.',
      ],
      faq: [
        {
          q: 'Will my image be distorted?',
          a: 'Not if “Keep aspect ratio” is switched on (the default). The image is then scaled to fit within the size you enter.',
        },
        {
          q: 'Can I make images bigger?',
          a: 'Yes, but enlarging can’t add detail that isn’t there, so enlarged images may look soft.',
        },
        {
          q: 'Which format will the result have?',
          a: 'The same as the original. JPG and WebP images are saved at a high quality of 92%.',
        },
        {
          q: 'Are my images uploaded?',
          a: 'No. Resizing is done locally by your browser.',
        },
      ],
    },
    'image-converter': {
      slug: 'image-converter',
      name: 'Image converter',
      short: 'Convert between JPG, PNG and WebP.',
      title: 'Image Converter – JPG, PNG & WebP, No Upload',
      description:
        'Convert images between JPG, PNG and WebP right in your browser. Batch conversion, adjustable quality – no upload, no sign-up.',
      h1: 'Image converter',
      lead: 'Convert pictures to JPG, PNG or WebP – fast, free and without uploading a single file.',
      steps: [
        'Choose one or more images.',
        'Pick the target format (and the quality for JPG and WebP).',
        'Click “Convert” and download your files.',
      ],
      faq: [
        {
          q: 'Which formats can I convert?',
          a: 'You can open JPG, PNG, WebP, GIF, BMP and – depending on your browser – AVIF, and save them as JPG, PNG or WebP.',
        },
        {
          q: 'Which format should I choose?',
          a: 'JPG for photos, PNG for graphics with sharp edges or transparency, and WebP for the smallest files on websites.',
        },
        {
          q: 'What happens to transparency when converting to JPG?',
          a: 'JPG doesn’t support transparency, so transparent areas are filled with a background color – white by default.',
        },
        {
          q: 'Are my images uploaded?',
          a: 'No. Everything runs in your browser.',
        },
      ],
    },
    'remove-exif': {
      slug: 'remove-exif-data',
      name: 'Remove EXIF data',
      short: 'Delete GPS location and camera data.',
      title: 'Remove EXIF Data – Delete Photo Location',
      description:
        'See and remove hidden photo metadata such as GPS location, camera and date. Lossless and private – your photos never leave your device.',
      h1: 'Remove EXIF data from photos',
      lead: 'Photos can reveal where you live, when they were taken and which phone you use. See what’s hidden in your pictures and remove it – without any loss of quality.',
      steps: [
        'Choose one or more photos (JPG, PNG or WebP).',
        'Check which hidden information was found – for example the GPS location.',
        'Click “Remove metadata” and download the clean copies.',
      ],
      faq: [
        {
          q: 'What is EXIF data?',
          a: 'Information that cameras and phones store inside a photo: GPS coordinates, date and time, camera model, settings and sometimes your name. Anyone who gets the file can read it.',
        },
        {
          q: 'Does removing metadata reduce the quality?',
          a: 'No. Only the metadata is removed; the image itself is copied bit for bit. The photo keeps its orientation and its color profile.',
        },
        {
          q: 'Which metadata is removed?',
          a: 'EXIF (including GPS), XMP, IPTC, comments, embedded thumbnails and other hidden data. Only the orientation and the color profile are kept, so the photo looks exactly the same.',
        },
        {
          q: 'Is it safe to use this with private photos?',
          a: 'Yes – that’s the whole point. Your photos are processed in your browser and never uploaded.',
        },
      ],
    },
    'qr-code-generator': {
      slug: 'qr-code-generator',
      name: 'QR code generator',
      short: 'QR codes for links, Wi-Fi and more.',
      title: 'Free QR Code Generator – No Sign-Up, No Expiry',
      description:
        'Create QR codes for links, text, Wi-Fi, e-mail and phone numbers. Download as PNG or SVG. Free forever – static codes that never expire.',
      h1: 'QR code generator',
      lead: 'Create QR codes for websites, Wi-Fi access, e-mail and more. No account, no tracking and no expiry date.',
      steps: [
        'Choose what the QR code should contain and fill in the fields.',
        'Adjust the colors and size if you like – the preview updates instantly.',
        'Download the QR code as PNG or SVG.',
      ],
      faq: [
        {
          q: 'Do these QR codes expire?',
          a: 'Never. They are static QR codes: the content is stored directly in the code, not behind a redirect link. Some websites sell “dynamic” codes that stop working when a trial ends – these codes don’t depend on any server.',
        },
        {
          q: 'Are scans tracked?',
          a: 'No. The code leads directly to your content, so nobody – including us – sees who scans it.',
        },
        {
          q: 'PNG or SVG?',
          a: 'PNG works everywhere. SVG is a vector format that stays perfectly sharp at any size – the best choice for printing.',
        },
        {
          q: 'Can I use the QR codes commercially?',
          a: 'Yes, for free and without any attribution.',
        },
      ],
    },
    'epc-qr-code': {
      slug: 'epc-qr-code-generator',
      name: 'Payment QR code (EPC)',
      short: 'Payment QR codes (GiroCode) for invoices.',
      title: 'EPC QR Code Generator – Free GiroCode for SEPA',
      description:
        'Create EPC payment QR codes (GiroCode) for invoices: customers scan the code and pay by SEPA transfer. Free, private, no sign-up.',
      h1: 'EPC payment QR code (GiroCode)',
      lead: 'Put a payment QR code on your invoices: your customer scans it with their banking app, and the IBAN, amount and reference are filled in automatically.',
      steps: [
        'Enter the recipient’s name and IBAN.',
        'Optionally add the amount and the payment reference.',
        'Download the QR code and add it to your invoice.',
      ],
      faq: [
        {
          q: 'What is an EPC QR code?',
          a: 'A standard of the European Payments Council for SEPA credit transfers, also known as GiroCode. Banking apps in Germany, Austria, the Netherlands, Belgium, Finland and many other countries can scan it.',
        },
        {
          q: 'Are my bank details sent anywhere?',
          a: 'No. The QR code is generated in your browser, so your IBAN and all other details stay on your device.',
        },
        {
          q: 'Does it work for Swiss QR-bills?',
          a: 'No. Switzerland uses its own “QR-bill” standard. EPC codes are for euro payments within the SEPA area.',
        },
        {
          q: 'Do I need the BIC?',
          a: 'Not for payments within the European Economic Area – you can leave it empty.',
        },
      ],
    },
    'password-generator': {
      slug: 'password-generator',
      name: 'Password generator',
      short: 'Strong random passwords, made offline.',
      title: 'Password Generator – Strong & Created Offline',
      description:
        'Generate strong, random passwords with your browser’s secure random generator. Choose length and characters. Nothing is sent or stored.',
      h1: 'Password generator',
      lead: 'Create strong, truly random passwords. They are generated on your device and are never sent or saved anywhere.',
      steps: [
        'Choose the length and which characters to use.',
        'A new password appears instantly – click “New password” for another one.',
        'Copy it and save it in a password manager.',
      ],
      faq: [
        {
          q: 'How long should my password be?',
          a: 'At least 16 characters for important accounts. Length matters more than complexity: every extra character multiplies the number of possible passwords.',
        },
        {
          q: 'Are the passwords really random?',
          a: 'Yes. They come from your browser’s cryptographic random number generator (crypto.getRandomValues), the same one that is used for encryption.',
        },
        {
          q: 'Do you store the passwords?',
          a: 'No. They are created on your device and never leave it. Close the page and they are gone.',
        },
        {
          q: 'How do I remember strong passwords?',
          a: 'You don’t have to: use a password manager. It remembers all your passwords and fills them in for you.',
        },
      ],
    },
  } satisfies Record<MainToolId, ToolText>,
};

export type Dictionary = typeof en;
