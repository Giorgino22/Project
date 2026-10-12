/**
 * Word lists for the typing test. Our own lists of everyday English words – no quotes, lyrics
 * or book text (those can be protected by copyright). Add or remove words freely: one space
 * between words, line breaks don't matter.
 */

/** Splits "one two three" into ['one', 'two', 'three']. */
const list = (text: string): string[] => text.trim().split(/\s+/);

/** Frequent English words – the words people type most in real life. */
export const commonWords = list(`
  the be to of and a in that have it for not on with he as you do at this but his by from they
  we say her she or an will my one all would there their what so up out if about who get which go
  me when make can like time no just him know take people into year your good some could them see
  other than then now look only come its over think also back after use two how our work first well
  way even new want because any these give day most us great little world very still own long small
  part place case week point home hand high life house right school should both between under last
  never same another while might number again before around always often together during without
  against family friend water money story light night word city name car room game idea face door
  book food music open start close live call find leave keep help show play run move turn stand hear
  talk read write learn change begin follow stop ask need feel try tell mean seem become bring happen
  carry build spend grow walk watch wait plan hold sit early late young old real sure easy hard free
  full clear best better large short strong simple quick ready kind happy warm cold green blue red
  white black river mountain garden window table paper letter picture question answer minute hour
  morning evening summer winter animal country power problem reason result system moment travel
  market office field island ocean forest street bridge train plane phone voice smile dream color
  heart mind body eye head line side end air sun tree fire stone star sea sky road sound child woman
  man girl boy team group student teacher doctor movie beach party dinner coffee bread apple
  orange kitchen bottle chair clock shirt shoe ticket camera pocket wallet price shop sell buy pay
  send receive remember forget understand explain decide choose agree enjoy finish return arrive
  visit invite share cover fill pull push throw catch climb drive fly swim sing dance laugh cry
  sleep wake eat drink cook wash clean break fix lose win miss pass reach touch jump count
  thing person month today future area level order force state service health job care fact
`);

/** Short, easy words for the kids test. */
export const kidWords = list(`
  cat dog sun run fun hat bat red bed big pig sit hop top cup bus box fox map pen hen ten jam egg
  leg bag bug mud pot log fog sky fly toy boy joy day way play say see bee tree three green sleep
  jump swim sing ring king fish dish ship shop star car park dark bird book look cook moon soon food
  good wood milk cake lake bike kite ride hide smile rain train snow slow blue glue home nose rose
  frog duck lion bear cow owl zoo ball doll tall wall hand sand land apple happy funny sunny puppy
  kitten rabbit water pizza candy color friend school house mouse cloud clap draw paint read write
  game team dance laugh
`);

/** Words made only of the home row keys: A S D F G H J K L */
export const homeRowWords = list(`
  a as ask asks add adds all alas dad dads fad fall falls flask flag flags gas glad glass hall halls
  had has half hash lad lads lag sad salad salads shall flash dash lash slash ash
`);

/** Words for the bottom row (Z X C V B N M) – mixed with home row keys, because almost every word needs a vowel. */
export const bottomRowWords = list(`
  and an can man band hand land sand black back bad bank cab calm ban bang fan gang hang jam lamb mad
  snack slam scan flank clan clam class small shack smash cash chalk jazz van mask blank bland banana
  bash clash snag slab lab bag nag
`);
