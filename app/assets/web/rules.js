'use strict';
/* Rules per game mode (HTML). Shown for the selected mode; trick games add the basic rules below. */
const RULES = {};

// ====================================================================== Deutsch
RULES.de = {
  rules_basics: `
<p>Gespielt wird mit 36 Karten: 6, 7, 8, 9, Banner (10), Under (Bube), Ober (Dame), König, As. Schweizer Farben: Schellen, Rosen, Schilten, Eicheln – französisch: Schaufel, Herz, Kreuz, Ecke. Es wird im Gegenuhrzeigersinn gespielt.</p>
<p><b>Angeben:</b> Hast du die ausgespielte Farbe, musst du sie angeben – du darfst aber immer auch trumpfen. Liegt schon ein Trumpf im Stich, darfst du nicht tiefer trumpfen (untertrumpfen), ausser du hast nur noch Trümpfe. Den Trumpf-Under (Puur) musst du nie angeben. Wer den Stich macht, spielt wieder aus.</p>
<table><tr><th></th><th>Trumpf</th><th>sonst</th><th>Obenabe</th><th>Undenufe</th></tr>
<tr><td>As</td><td>11</td><td>11</td><td>11</td><td>0</td></tr>
<tr><td>König</td><td>4</td><td>4</td><td>4</td><td>4</td></tr>
<tr><td>Ober</td><td>3</td><td>3</td><td>3</td><td>3</td></tr>
<tr><td>Under</td><td>20 (Puur)</td><td>2</td><td>2</td><td>2</td></tr>
<tr><td>Banner</td><td>10</td><td>10</td><td>10</td><td>10</td></tr>
<tr><td>9</td><td>14 (Nell)</td><td>0</td><td>0</td><td>0</td></tr>
<tr><td>8</td><td>0</td><td>0</td><td>8</td><td>8</td></tr>
<tr><td>6</td><td>0</td><td>0</td><td>0</td><td>11</td></tr></table>
<p>Im Trumpf ist die Reihenfolge Puur, Nell, As, König, Ober, Banner, 8, 7, 6. Bei <b>Obenabe</b> sticht die höchste Karte (As), bei <b>Undenufe</b> die tiefste (6). Der letzte Stich zählt 5 Punkte extra; total gibt es 157 Punkte. Macht eine Partei alle Stiche (<b>Matsch</b>), bekommt sie 100 Punkte dazu (257).</p>
<p><b>Weis:</b> Drei Karten einer Farbe in Folge = 20, vier = 50, fünf = 100, sechs = 150, sieben = 200, acht = 250, neun = 300. Vier Under = 200, vier Neuner = 150, vier Asse, Könige, Ober oder Banner = 100. Gewiesen wird mit der ersten Karte; nur die Partei mit dem höchsten Weis schreibt – dann aber alle ihre Weise. Bei gleichem Wert gewinnt die höhere Karte (bei Undenufe die tiefere), dann der Trumpf-Weis, dann wer zuerst an der Reihe war.</p>
<p><b>Stöck:</b> Ober und König vom Trumpf geben 20 Punkte. Sie werden geschrieben, wenn die zweite der beiden Karten gespielt wird, und zählen immer.</p>
<p><b>In der App:</b> Karte antippen und nochmals tippen zum Spielen. Erlaubte Karten sind hell. Beim ersten Stich zeigt die App deine Weise – antippen, um einen nicht zu weisen. ⟲ zeigt den letzten Stich.</p>`,

  rules_klassisch: `
<p>Der klassische Jass für 3 oder 4 Spieler. Zu viert spielt man in <b>zwei Teams</b> (Partner sitzen sich gegenüber) oder jeder für sich, zu dritt immer jeder für sich (je 12 Karten).</p>
<p><b>Trumpf:</b> In der ersten Runde bestimmt, wer die Rosen 7 (Herz 7) hat, danach der nächste Spieler im Gegenuhrzeigersinn. Er wählt eine Trumpffarbe, Obenabe oder Undenufe und spielt aus.</p>
<p>Weis, Stöck und Matsch zählen. Je nach Zählweise werden alle Punkte einer Runde (auch Weis und Stöck) mit dem Faktor der Spielart multipliziert.</p>
<p><b>Ende:</b> Gespielt wird auf 1000, 1500 oder 2500 Punkte. Mit <b>«Bedanken von Hand»</b> gewinnt, wer das Ziel erreicht hat und als Erster auf «Bedanken» tippt – das geht jederzeit, auch mitten in der Runde. Wer sich zu früh bedankt, verliert; wer es vergisst, spielt weiter. Erreichen beide im gleichen Stich das Ziel, gilt die Reihenfolge <b>Stöck – Wyys – Stich</b>. Mit «automatisch» endet das Spiel, sobald jemand das Ziel erreicht.</p>`,

  rules_schieber: `
<p>Der beliebteste Jass: 4 Spieler in <b>zwei Teams</b>, die Partner sitzen sich gegenüber. Jeder bekommt 9 Karten.</p>
<p><b>Trumpf:</b> In der ersten Runde bestimmt, wer die Rosen 7 (Herz 7) hat, danach reihum im Gegenuhrzeigersinn. Wer an der Reihe ist, darf <b>schieben</b>: dann muss der Partner bestimmen. Ausgespielt wird immer von dem, der an der Reihe war.</p>
<p><b>Spielarten:</b> eine Trumpffarbe, <b>Obenabe</b> (As höchste Karte) oder <b>Undenufe</b> (6 höchste Karte). Wahlweise zusätzlich:</p>
<ul><li><b>Slalom:</b> abwechselnd Obenabe und Undenufe, der erste Stich wie gewählt; gezählt wird wie die erste Richtung.</li>
<li><b>Tutti:</b> in jedem Stich ist die ausgespielte Farbe Trumpf; alle Under zählen 20, alle Neuner 14 (253 Punkte).</li>
<li><b>Misère:</b> zu jeder Spielart wählbar – man will möglichst wenig Punkte; jede Partei bekommt die Stichpunkte der Gegner gutgeschrieben.</li></ul>
<p><b>Zählweise:</b> «alles einfach»; «Schellen/Schilten doppelt» (französisch: Schaufel/Kreuz), Obenabe und Undenufe dreifach; «Obe drü, Une vier»; oder Appenzeller: Schellen ×2, Rosen ×3, Schilten ×4, Obenabe ×5, Undenufe ×6, Eicheln ×7 auf 5000. Slalom zählt wie Obenabe, Tutti wie Undenufe. Der Faktor gilt auch für Weis, Stöck und Matsch.</p>
<p><b>Ende:</b> Wer das Ziel (1000 bis 5000) erreicht hat, muss sich <b>bedanken</b> (Knopf oben). Zu früh bedankt = verloren, vergessen = weiterspielen. Erreichen beide Teams das Ziel im gleichen Stich, gilt <b>Stöck – Wyys – Stich</b>.</p>`,

  rules_bieter: `
<p>Für 3, 4 oder 5 Spieler. Wer am meisten bietet, wird <b>König</b> und spielt allein (zu fünft mit einem Partner) gegen die <b>Bauern</b>. Das Gebot ist das Ziel des Königs für die ganze Partie; die Bauern brauchen immer <b>1000</b> Punkte. Wer zuerst sein Ziel erreicht, gewinnt.</p>
<p><b>Bieten:</b> Vorhand beginnt. Mindestgebot 600 (zu dritt), 350 (zu viert), 500 (zu fünft), erhöht wird um mindestens 10. «Fort» vor dem ersten Gebot bindet nicht; nach einem Gebot ist man draussen. Bietet niemand, wird neu gegeben.</p>
<p><b>Erstes Spiel:</b> Zu dritt bekommt jeder 10 Karten, 3 liegen offen und 3 verdeckt auf dem Tisch; zu viert je 8 Karten und 2 + 2 auf dem Tisch. Der König nimmt die Tischkarten, <b>drückt</b> gleich viele Karten (ihre Punkte gehören ihm) und wählt Trumpf, Obenabe, Undenufe oder <b>Hindersi</b> (der König darf keinen Stich machen: gelingt es, bekommt er 257, sonst bekommen die Bauern 257). Zu fünft (35 Karten, eine Sieben fehlt) bekommt jeder 7 Karten; der König wählt die Spielart und wünscht sich eine Karte – wer sie hat, ist für die ganze Partie sein Partner (erkennbar, sobald die Karte gespielt wird). Im ersten Spiel spielt der König aus.</p>
<p><b>Ab dem zweiten Spiel:</b> Der König gibt (danach reihum), jeder bekommt alle Karten; die letzte Karte des Gebers ist der <b>Bodentrumpf</b>. Der König kann vor der ersten Karte passen – dann schreiben die Bauern 257 (plus ihre Stöck).</p>
<p>Weis, Stöck und Matsch zählen nach den Grundregeln. Erreicht der Verlierer nicht einmal die Hälfte seines Ziels, ist er <b>Schneider</b>.</p>`,

  rules_differenzler: `
<p>Für 3 oder 4 Spieler, jeder für sich (zu dritt 12 Karten, zu viert 9). Die letzte Karte des Gebers ist offen der <b>Trumpf</b> (Bodentrumpf).</p>
<p><b>Ansagen:</b> Nach Ansicht der Karten sagt jeder, wie viele Punkte er machen wird – Vorhand zuerst, der Geber zuletzt. Normalerweise offen; bei «verdeckter Ansage» sieht man die Ansagen erst am Ende der Runde.</p>
<p>Es gibt keinen Weis und keine Stöck. Kann man nicht angeben, darf man auch untertrumpfen. Ein Matsch zählt 157.</p>
<p><b>Wertung:</b> Die Differenz zwischen Ansage und gemachten Punkten wird als Strafpunkte geschrieben. Wer genau trifft, bekommt 10 Punkte abgezogen (ausser bei Ansage 0 ohne Stich). Nach der vereinbarten Anzahl Runden (offiziell 16) gewinnt, wer am <b>wenigsten</b> Punkte hat.</p>`,

  rules_molotow: `
<p>Für 3 bis 6 Spieler, jeder für sich. Ziel: <b>möglichst wenig Punkte</b>. Zu dritt 12 Karten, zu viert 9, zu fünft 7 (die Schellen 6 wird weggelassen), zu sechst 6.</p>
<p><b>Trumpf:</b> Am Anfang gibt es keinen Trumpf (wie Obenabe). Wer als Erster nicht angeben kann, bestimmt mit der Farbe der Karte, die er spielt, den Trumpf für den Rest der Runde – diese Karte ist schon Trumpf. Untertrumpfen ist immer erlaubt.</p>
<p><b>Weis und Stöck</b> aus der eigenen Hand zählen als Minuspunkte (gut für dich). Ein <b>Tischweis</b> – ein Weis, der sich aus den Karten eines Stichs ergibt – wird dem gutgeschrieben, der den Stich macht.</p>
<p>Nach der vereinbarten Anzahl Runden gewinnt, wer am wenigsten Punkte hat. Die <b>letzte Runde zählt doppelt</b>.</p>`,

  rules_ohshit: `
<p>Für 4 Spieler, jeder gegen jeden. Es werden 9 Runden gespielt: zuerst mit 9 Karten pro Spieler, dann mit 8, 7 … bis zu einer Karte. Die übrigen Karten bleiben unbekannt.</p>
<p>Die Spielart jeder Runde (eine Trumpffarbe, Obenabe oder Undenufe) ist im Voraus ausgelost, nie zweimal die gleiche hintereinander.</p>
<p><b>Voraussagen:</b> Jeder sagt, wie viele Stiche er machen wird – Vorhand zuerst, der Geber zuletzt. Die Summe darf nicht gleich der Anzahl Stiche sein: dem Geber ist eine Zahl verboten. Dann gelten die normalen Jassregeln (angeben oder trumpfen, nicht untertrumpfen).</p>
<p><b>Wertung:</b> Wer genau trifft, bekommt so viele Punkte wie Stiche (plus 10 Bonuspunkte). Wer daneben liegt, bekommt nichts. Wer am Ende die meisten Punkte hat, gewinnt. Den Namen hat das Spiel vom Ausruf beim ersten Stich zu viel …</p>`,

  rules_arschloechle: `
<p>Für 3 bis 6 Spieler, jeder für sich. Es zählen nur die Werte: 6 tief, dann 7, 8, 9, Banner, Under, Ober, König, As hoch – die Farbe spielt keine Rolle. Wahlweise ist die Rosen-6 (Herz-6) ein <b>Joker</b>, der alles schlägt. Alle Karten werden verteilt; geht es nicht auf, bekommt das Arschloch (in der ersten Runde der Geber) eine Karte mehr.</p>
<p><b>Spielen:</b> Wer ausspielt, legt eine Karte oder mehrere gleiche (Paar, Drilling …). Reihum muss man mit <b>gleich vielen</b> Karten eines <b>höheren</b> Werts überbieten – drei Zehner schlagen nur drei höhere Gleiche. Wer kann, muss überbieten (ausser «Passen erlaubt» ist eingestellt); wer nicht kann, setzt für diesen Stich aus. Kann niemand mehr überbieten, spielt der zuletzt Erfolgreiche neu aus.</p>
<p><b>Titel:</b> Wer zuerst alle Karten los ist, wird <b>König</b>, dann Vize-König, Bürger, Vize-Arschloch – wer am Schluss noch Karten hat, ist das <b>Arschloch</b>. Zu dritt: König, Bürger, Arschloch; zu viert ohne Bürger.</p>
<p><b>Tauschen</b> (ab der zweiten Runde): Das Arschloch gibt dem König seine zwei besten Karten und bekommt zwei Karten nach Wahl des Königs zurück. Vize-Arschloch und Vize-König tauschen eine Karte. Das Arschloch spielt zuerst aus.</p>
<p><b>Punkte</b> pro Runde: König 3, Vize-König 2, Bürger 1, Vize-Arschloch 0, Arschloch −1. Nach der eingestellten Anzahl Runden gewinnt, wer am meisten Punkte hat.</p>
<p><b>In der App:</b> Tippe einen Wert an – die App wählt gleich so viele Karten wie nötig; antippen entfernt eine Karte wieder. Dann «Spielen».</p>`,

  rules_tschausepp: `
<p>Das Schweizer Mau-Mau für 2 bis 8 Spieler, ab 5 Spielern mit zwei Kartenspielen. Jeder bekommt 5 Karten, eine Karte wird aufgedeckt, der Rest ist der Stock.</p>
<p>Reihum legt man eine Karte, die in <b>Farbe oder Wert</b> zur obersten passt. Kann oder will man nicht, zieht man eine Karte – passt sie, darf man sie gleich spielen, sonst ist der Nächste dran.</p>
<ul><li><b>7:</b> der Nächste muss 2 Karten ziehen – ausser er legt auch eine 7, dann zieht der Übernächste 4 usw.</li>
<li><b>8:</b> der Nächste setzt aus.</li>
<li><b>Under (Bube):</b> passt auf jede Karte (nur nicht auf einen Under); man wünscht sich eine Farbe.</li>
<li><b>As:</b> muss gedeckt werden – man spielt gleich nochmals (oder zieht). Mit einem As kann man nicht fertig werden.</li>
<li><b>10</b> (wahlweise): die Richtung wechselt.</li></ul>
<p>Wer seine zweitletzte Karte legt, muss <b>«Tschau»</b> sagen, bei der letzten <b>«Sepp»</b> – in der App vorher den Knopf antippen. Wer es vergisst, zieht 4 Strafkarten.</p>
<p><b>Wertung:</b> Wer fertig ist, gewinnt die Runde. Die anderen zählen ihre Karten: 6–10 nach Wert, Under 20, Ober und König 10, As 11. Erreicht jemand das Limit, gewinnt, wer am wenigsten Punkte hat.</p>`,
};

// ====================================================================== Zürischnurre
RULES.zh = {
  rules_basics: `
<p>Mer spilt mit 36 Chaarte: 6, 7, 8, 9, Banner (10), Under (Bueb), Ober (Dame), Chönig, Ass. Schwiizer Farbe: Schälle, Rose, Schilte, Eichle – französisch: Schufle, Härz, Chrüz, Egge. Gspilt wird geg de Uhrzeiger.</p>
<p><b>Aagää:</b> Häsch d Farb, wo usgspilt worde isch, muesch si aagää – aber trumpfe darfsch immer. Lit scho en Trumpf im Stich, darfsch nöd undertrumpfe, usser du häsch nur no Trümpf. De Puur (Trumpf-Under) muesch nie aagää. Wer de Stich macht, spilt wider uus.</p>
<table><tr><th></th><th>Trumpf</th><th>suscht</th><th>Obenabe</th><th>Undenufe</th></tr>
<tr><td>Ass</td><td>11</td><td>11</td><td>11</td><td>0</td></tr>
<tr><td>Chönig</td><td>4</td><td>4</td><td>4</td><td>4</td></tr>
<tr><td>Ober</td><td>3</td><td>3</td><td>3</td><td>3</td></tr>
<tr><td>Under</td><td>20 (Puur)</td><td>2</td><td>2</td><td>2</td></tr>
<tr><td>Banner</td><td>10</td><td>10</td><td>10</td><td>10</td></tr>
<tr><td>9</td><td>14 (Näll)</td><td>0</td><td>0</td><td>0</td></tr>
<tr><td>8</td><td>0</td><td>0</td><td>8</td><td>8</td></tr>
<tr><td>6</td><td>0</td><td>0</td><td>0</td><td>11</td></tr></table>
<p>Im Trumpf gaht s so: Puur, Näll, Ass, Chönig, Ober, Banner, 8, 7, 6. Bi <b>Obenabe</b> sticht di höchscht Chaarte (s Ass), bi <b>Undenufe</b> di tüüfscht (s Sächsi). De letscht Stich git 5 Pünkt extra; total sinds 157 Pünkt. Macht e Partei alli Stich (<b>Matsch</b>), git s 100 Pünkt druf (257).</p>
<p><b>Wyys:</b> Drüü Chaarte vo de gliiche Farb inere Reie = 20, vier = 50, füüf = 100, sächs = 150, sibe = 200, acht = 250, nüün = 300. Vier Under = 200, vier Nüüni = 150, vier Ass, Chönig, Ober oder Banner = 100. Gwyyst wird mit de erschte Chaarte; nur d Partei mit em höchschte Wyys schriibt – dänn aber alli ihri Wyys. Bi gliichem Wert gwünnt di höcher Chaarte (bi Undenufe di tüüfer), dänn de Trumpf-Wyys, dänn wer zerscht dra gsi isch.</p>
<p><b>Stöck:</b> Ober und Chönig vom Trumpf gänd 20 Pünkt. Si wärded gschribe, wänn di zweit Chaarte gspilt wird, und zelled immer.</p>
<p><b>I de App:</b> Chaarte aatippe und nomal tippe zum Spile. Erlaubti Chaarte sind hell. Bim erschte Stich zeigt d App diini Wyys – aatippe, wänn du eine nöd wotsch wyyse. ⟲ zeigt de letscht Stich.</p>`,

  rules_klassisch: `
<p>De klassisch Jass für 3 oder 4 Spiler. Z viert spilt mer i <b>zwei Teams</b> (d Partner hocked vis-à-vis) oder jede für sich, z dritt immer jede für sich (je 12 Chaarte).</p>
<p><b>Trumpf:</b> I de erschte Rundi macht Trumpf, wer s Rose-Sibni (Härz-Sibni) hät, dänn de nächscht Spiler geg de Uhrzeiger. Er wählt e Trumpffarb, Obenabe oder Undenufe und spilt uus.</p>
<p>Wyys, Stöck und Matsch zelled. Je nach Zellwiis wärded alli Pünkt vonere Rundi (au Wyys und Stöck) mit em Faktor vo de Spiilart multipliziert.</p>
<p><b>Schluss:</b> Mer spilt uf 1000, 1500 oder 2500 Pünkt. Mit <b>«Bedanke vo Hand»</b> gwünnt, wer s Ziil erreicht hät und als Erschte uf «Bedanke» tippt – das gaht jederziit, au mitts i de Rundi. Wer sich z früe bedankt, verlüürt; wer s vergisst, spilt wiiter. Erreiched beidi im gliiche Stich s Ziil, gilt <b>Stöck – Wyys – Stich</b>. Mit «automatisch» isch s Spiil fertig, sobald öpper s Ziil hät.</p>`,

  rules_schieber: `
<p>De beliebtischt Jass: 4 Spiler i <b>zwei Teams</b>, d Partner hocked vis-à-vis. Jede überchunnt 9 Chaarte.</p>
<p><b>Trumpf:</b> I de erschte Rundi macht Trumpf, wer s Rose-Sibni (Härz-Sibni) hät, dänn reihum geg de Uhrzeiger. Wer dra isch, darf <b>schiebe</b>: dänn mues de Partner Trumpf mache. Usgspilt wird immer vo dem, wo dra gsi isch.</p>
<p><b>Spiilarte:</b> e Trumpffarb, <b>Obenabe</b> (s Ass isch di höchscht Chaarte) oder <b>Undenufe</b> (s Sächsi isch di höchscht). Wahlwiis no derzue:</p>
<ul><li><b>Slalom:</b> abwächslig Obenabe und Undenufe, de erscht Stich wie gwählt; zellt wird wie di erscht Richtig.</li>
<li><b>Tutti:</b> i jedem Stich isch di usgspilt Farb Trumpf; alli Under zelled 20, alli Nüüni 14 (253 Pünkt).</li>
<li><b>Misère:</b> zu jedere Spiilart wählbar – mer will so wenig Pünkt wie mögli; jedi Partei überchunnt d Stichpünkt vo de Gegner.</li></ul>
<p><b>Zellwiis:</b> «alles eifach»; «Schälle/Schilte dopplet» (französisch: Schufle/Chrüz), Obenabe und Undenufe drüfach; «Obe drüü, Une vier»; oder Appezäller: Schälle ×2, Rose ×3, Schilte ×4, Obenabe ×5, Undenufe ×6, Eichle ×7 uf 5000. Slalom zellt wie Obenabe, Tutti wie Undenufe. De Faktor gilt au für Wyys, Stöck und Matsch.</p>
<p><b>Schluss:</b> Wer s Ziil (1000 bis 5000) hät, mues sich <b>bedanke</b> (Chnopf obe). Z früe bedankt = verlore, vergässe = wiiterspile. Erreiched beidi Teams s Ziil im gliiche Stich, gilt <b>Stöck – Wyys – Stich</b>.</p>`,

  rules_bieter: `
<p>Für 3, 4 oder 5 Spiler. Wer am meischte bütet, wird <b>König</b> und spilt ellei (z füüft mit emne Partner) gäge d <b>Puure</b>. S Gebot isch s Ziil vom König für di ganz Partie; d Puure bruuched immer <b>1000</b> Pünkt. Wer zerscht am Ziil isch, gwünnt.</p>
<p><b>Büüte:</b> Vorhand faht aa. Mindeschtgebot 600 (z dritt), 350 (z viert), 500 (z füüft), uufegää wird um mindeschtens 10. «Furt» vor em erschte Gebot zellt nöd; nach emne Gebot isch mer duss. Bütet niemer, wird nomal gää.</p>
<p><b>Erschts Spiil:</b> Z dritt überchunnt jede 10 Chaarte, 3 lieged offe und 3 verdeckt uf em Tisch; z viert je 8 Chaarte und 2 + 2 uf em Tisch. De König nimmt d Tischchaarte, <b>drückt</b> gliich vill Chaarte (d Pünkt ghöred ihm) und wählt Trumpf, Obenabe, Undenufe oder <b>Hindersi</b> (de König darf kän Stich mache: wänn s klappt, überchunnt er 257, suscht d Puure 257). Z füüft (35 Chaarte, es Sibni fehlt) überchunnt jede 7 Chaarte; de König wählt d Spiilart und wünscht sich e Chaarte – wer si hät, isch für di ganz Partie sin Partner (mer gseht s, sobald d Chaarte gspilt wird). Im erschte Spiil spilt de König uus.</p>
<p><b>Ab em zweite Spiil:</b> De König git (dänn reihum), jede überchunnt alli Chaarte; di letscht Chaarte vom Geber isch de <b>Bodetrumpf</b>. De König cha vor de erschte Chaarte passe – dänn schriibed d Puure 257 (plus ihri Stöck).</p>
<p>Wyys, Stöck und Matsch zelled nach de Grundregle. Erreicht de Verlierer nöd emal d Hälfti vo sim Ziil, isch er <b>Schnider</b>.</p>`,

  rules_differenzler: `
<p>Für 3 oder 4 Spiler, jede für sich (z dritt 12 Chaarte, z viert 9). Di letscht Chaarte vom Geber isch offe de <b>Trumpf</b> (Bodetrumpf).</p>
<p><b>Aasäge:</b> Nachdem er d Chaarte aagluegt hät, seit jede, wie vill Pünkt er macht – Vorhand zerscht, de Geber zletscht. Normalerwiis offe; bi «verdeckter Aasaag» gseht mer d Aasage erscht am Schluss vo de Rundi.</p>
<p>S git kän Wyys und kei Stöck. Wer nöd cha aagää, darf au undertrumpfe. En Matsch zellt 157.</p>
<p><b>Wertig:</b> D Differänz zwüsched Aasaag und gmachte Pünkt wird als Straafpünkt gschribe. Wer gnau trifft, überchunnt 10 Pünkt abzoge (usser bi Aasaag 0 ohni Stich). Nach de abgmachte Aazahl Runde (offiziell 16) gwünnt, wer am <b>wenigschte</b> Pünkt hät.</p>`,

  rules_molotow: `
<p>Für 3 bis 6 Spiler, jede für sich. S Ziil: <b>so wenig Pünkt wie mögli</b>. Z dritt 12 Chaarte, z viert 9, z füüft 7 (s Schälle-Sächsi wird usegnaa), z sächst 6.</p>
<p><b>Trumpf:</b> Am Aafang git s kän Trumpf (wie Obenabe). Wer als Erschte nöd cha aagää, macht mit de Farb vo de Chaarte, won er spilt, de Trumpf für de Rescht vo de Rundi – die Chaarte isch scho Trumpf. Undertrumpfe isch immer erlaubt.</p>
<p><b>Wyys und Stöck</b> us de eigete Hand zelled als Minuspünkt (guet für dich). En <b>Tischwyys</b> – en Wyys, wo us de Chaarte vomene Stich zämechunnt – wird dem gutgschribe, wo de Stich macht.</p>
<p>Nach de abgmachte Aazahl Runde gwünnt, wer am wenigschte Pünkt hät. Di <b>letscht Rundi zellt dopplet</b>.</p>`,

  rules_ohshit: `
<p>Für 4 Spiler, jede gäge jede. Mer spilt 9 Runde: zerscht mit 9 Chaarte pro Spiler, dänn mit 8, 7 … bis zu einere Chaarte. Di übrige Chaarte blibed unbekannt.</p>
<p>D Spiilart vo jedere Rundi (e Trumpffarb, Obenabe oder Undenufe) isch im Voruus uusglost, nie zwöimal di gliich hinderenand.</p>
<p><b>Voruussäge:</b> Jede seit, wie vill Stich er macht – Vorhand zerscht, de Geber zletscht. D Summe darf nöd gliich sii wie d Aazahl Stich: em Geber isch e Zahl verbote. Dänn gälted di normale Jassregle (aagää oder trumpfe, nöd undertrumpfe).</p>
<p><b>Wertig:</b> Wer gnau trifft, überchunnt so vill Pünkt wie Stich (plus 10 Bonuspünkt). Wer dernäbe isch, überchunnt nüüt. Wer am Schluss am meischte Pünkt hät, gwünnt. De Name chunnt vom Uusruef bim erschte Stich z vill – uf Züritüütsch «Gopfertaminomal»…</p>`,

  rules_arschloechle: `
<p>Für 3 bis 6 Spiler, jede für sich. Es zelled nume d Wert: 6 tüüf, dänn 7, 8, 9, Banner, Under, Ober, Chönig, Ass höch – d Farb spilt kä Rolle. Wahlwiis isch s Rose-Sächsi (Härz-Sächsi) en <b>Joker</b>, wo alles schlaht. Alli Chaarte wärded verteilt; gaht s nöd uuf, überchunnt s Arschloch (i de erschte Rundi de Geber) ei Chaarte meh.</p>
<p><b>Spile:</b> Wer usspilt, leit ei Chaarte oder mehreri gliichi (Paar, Drilling …). Reihum muesch mit <b>gliich vill</b> Chaarte vomene <b>höchere</b> Wert überbüüte – drüü Zähni schlönd nume drüü höcheri Gliichi. Wer cha, mues überbüüte (usser «Passe erlaubt» isch iigschalte); wer nöd cha, setzt für dä Stich uus. Cha niemer meh überbüüte, spilt de, wo zletscht gleit hät, neu uus.</p>
<p><b>Titel:</b> Wer zerscht alli Chaarte los isch, wird <b>Chönig</b>, dänn Vize-Chönig, Burger, Vize-Arschloch – wer am Schluss no Chaarte hät, isch s <b>Arschloch</b>. Z dritt: Chönig, Burger, Arschloch; z viert ohni Burger.</p>
<p><b>Tuusche</b> (ab de zweite Rundi): S Arschloch git em Chönig sini zwei beschte Chaarte und überchunnt zwei Chaarte nach Wahl vom Chönig zrugg. Vize-Arschloch und Vize-Chönig tuusched ei Chaarte. S Arschloch spilt zerscht uus.</p>
<p><b>Pünkt</b> pro Rundi: Chönig 3, Vize-Chönig 2, Burger 1, Vize-Arschloch 0, Arschloch −1. Nach de iigstellte Aazahl Runde gwünnt, wer am meischte Pünkt hät.</p>
<p><b>I de App:</b> Tipp en Wert aa – d App wählt grad so vill Chaarte wie nötig; nomal aatippe nimmt eini wider weg. Dänn «Spile».</p>`,

  rules_tschausepp: `
<p>S Schwiizer Mau-Mau für 2 bis 8 Spiler, ab 5 Spiler mit zwei Chaartespiil. Jede überchunnt 5 Chaarte, ei Chaarte wird uufdeckt, de Rescht isch de Stock.</p>
<p>Reihum leit mer e Chaarte, wo i de <b>Farb oder im Wert</b> zu de oberschte passt. Chasch oder wotsch nöd, ziehsch e Chaarte – passt si, darfsch si grad spile, suscht isch de Nächscht dra.</p>
<ul><li><b>Sibni:</b> de Nächscht mues 2 Chaarte zie – usser er leit au es Sibni, dänn zieht de Übernächscht 4 usw.</li>
<li><b>Achti:</b> de Nächscht setzt uus.</li>
<li><b>Under (Bueb):</b> passt uf jedi Chaarte (nume nöd uf en Under); mer wünscht sich e Farb.</li>
<li><b>Ass:</b> mues deckt wärde – mer spilt grad nomal (oder zieht). Mit emne Ass chasch nöd fertig wärde.</li>
<li><b>Zähni</b> (wahlwiis): d Richtig wächslet.</li></ul>
<p>Wer sini zweitletscht Chaarte leit, mues <b>«Tschau»</b> säge, bi de letschte <b>«Sepp»</b> – i de App vorher de Chnopf aatippe. Wer s vergisst, zieht 4 Straafchaarte.</p>
<p><b>Wertig:</b> Wer fertig isch, gwünnt d Rundi. Di andere zelled ihri Chaarte: 6–10 nach Wert, Under 20, Ober und Chönig 10, Ass 11. Erreicht öpper s Limit, gwünnt, wer am wenigschte Pünkt hät.</p>`,
};

// ====================================================================== Bärndütsch
RULES.be = {
  rules_basics: `
<p>Mir spile mit 36 Charte: 6, 7, 8, 9, Banner (10), Under (Bueb), Ober (Dame), Chünig, Ass. Schwiizer Farbe: Schäue, Rose, Schilte, Eichle – französisch: Schufle, Härz, Chrüz, Egge. Gspiut wird gäge d Uhr.</p>
<p><b>Agä:</b> Hesch d Farb, wo usgspiut worde isch, muesch se agä – aber trumpfe darfsch geng. Lyt scho ne Trumpf im Stich, darfsch nid undertrumpfe, usser du hesch nume no Trümpf. Dr Puur (Trumpf-Under) muesch nie agä. Wär dr Stich macht, spiut wider us.</p>
<table><tr><th></th><th>Trumpf</th><th>süsch</th><th>Obenabe</th><th>Undenufe</th></tr>
<tr><td>Ass</td><td>11</td><td>11</td><td>11</td><td>0</td></tr>
<tr><td>Chünig</td><td>4</td><td>4</td><td>4</td><td>4</td></tr>
<tr><td>Ober</td><td>3</td><td>3</td><td>3</td><td>3</td></tr>
<tr><td>Under</td><td>20 (Puur)</td><td>2</td><td>2</td><td>2</td></tr>
<tr><td>Banner</td><td>10</td><td>10</td><td>10</td><td>10</td></tr>
<tr><td>9</td><td>14 (Näu)</td><td>0</td><td>0</td><td>0</td></tr>
<tr><td>8</td><td>0</td><td>0</td><td>8</td><td>8</td></tr>
<tr><td>6</td><td>0</td><td>0</td><td>0</td><td>11</td></tr></table>
<p>Im Trumpf geit s so: Puur, Näu, Ass, Chünig, Ober, Banner, 8, 7, 6. Bi <b>Obenabe</b> sticht di höchschti Charte (ds Ass), bi <b>Undenufe</b> di töifschti (ds Sächsi). Dr letscht Stich git 5 Pünkt extra; total sy s 157 Pünkt. Macht e Partei aui Stich (<b>Matsch</b>), git s 100 Pünkt drzue (257).</p>
<p><b>Wyys:</b> Drü Charte vo dr glyche Farb ir e Reie = 20, vier = 50, füf = 100, sächs = 150, sibe = 200, acht = 250, nün = 300. Vier Under = 200, vier Nüni = 150, vier Ass, Chünige, Ober oder Banner = 100. Gwyyst wird mit dr erschte Charte; nume d Partei mit em höchschte Wyys schrybt – de aber aui ihri Wyys. Bi glychem Wärt gwinnt di höcheri Charte (bi Undenufe di töiferi), de dr Trumpf-Wyys, de wär zersch dra gsi isch.</p>
<p><b>Stöck:</b> Ober u Chünig vom Trumpf gä 20 Pünkt. Si wärde gschribe, we di zwöiti Charte gspiut wird, u zeue geng.</p>
<p><b>I dr App:</b> Charte atippe u no einisch tippe zum Spile. Erloubti Charte sy häu. Bim erschte Stich zeigt d App dyni Wyys – atippe, we du eine nid wosch wyyse. ⟲ zeigt dr letscht Stich.</p>`,

  rules_klassisch: `
<p>Dr klassisch Jass für 3 oder 4 Spiler. Z viert spiut me i <b>zwöi Teams</b> (d Partner sitze vis-à-vis) oder jede für sech, z dritt geng jede für sech (je 12 Charte).</p>
<p><b>Trumpf:</b> I dr erschte Rundi macht Trumpf, wär ds Rose-Sibni (Härz-Sibni) het, när dr nächscht Spiler gäge d Uhr. Är wäut e Trumpffarb, Obenabe oder Undenufe u spiut us.</p>
<p>Wyys, Stöck u Matsch zeue. Je nach Zeuwys wärde aui Pünkt vore Rundi (o Wyys u Stöck) mit em Faktor vo dr Spiuart multipliziert.</p>
<p><b>Schluss:</b> Me spiut uf 1000, 1500 oder 2500 Pünkt. Mit <b>«Bedanke vo Hand»</b> gwinnt, wär ds Ziu erreicht het u als Erschte uf «Bedanke» tippt – das geit jederzyt, o mitts i dr Rundi. Wär sech z früech bedankt, verlüürt; wär s vergisst, spiut wyter. Erreiche beidi im glyche Stich ds Ziu, giut <b>Stöck – Wyys – Stich</b>. Mit «automatisch» isch ds Spiu fertig, sobau öpper ds Ziu het.</p>`,

  rules_schieber: `
<p>Dr beliebtischt Jass: 4 Spiler i <b>zwöi Teams</b>, d Partner sitze vis-à-vis. Jede überchunnt 9 Charte.</p>
<p><b>Trumpf:</b> I dr erschte Rundi macht Trumpf, wär ds Rose-Sibni (Härz-Sibni) het, när reihum gäge d Uhr. Wär dra isch, darf <b>schiebe</b>: de mues dr Partner Trumpf mache. Usgspiut wird geng vo däm, wo dra gsi isch.</p>
<p><b>Spiuarte:</b> e Trumpffarb, <b>Obenabe</b> (ds Ass isch di höchschti Charte) oder <b>Undenufe</b> (ds Sächsi isch di höchschti). Wauwys no drzue:</p>
<ul><li><b>Slalom:</b> abwächslungswys Obenabe u Undenufe, dr erscht Stich wie gwäut; zeut wird wie di erschti Richtig.</li>
<li><b>Tutti:</b> i jedem Stich isch di usgspiuti Farb Trumpf; aui Under zeue 20, aui Nüni 14 (253 Pünkt).</li>
<li><b>Misère:</b> zu jedere Spiuart wäubar – me wott so weni Pünkt wie müglech; jedi Partei überchunnt d Stichpünkt vo de Gägner.</li></ul>
<p><b>Zeuwys:</b> «aues eifach»; «Schäue/Schilte dopplet» (französisch: Schufle/Chrüz), Obenabe u Undenufe drüfach; «Obe drü, Une vier»; oder Appezäuer: Schäue ×2, Rose ×3, Schilte ×4, Obenabe ×5, Undenufe ×6, Eichle ×7 uf 5000. Slalom zeut wie Obenabe, Tutti wie Undenufe. Dr Faktor giut o für Wyys, Stöck u Matsch.</p>
<p><b>Schluss:</b> Wär ds Ziu (1000 bis 5000) het, mues sech <b>bedanke</b> (Chnopf obe). Z früech bedankt = verlore, vergässe = wyterspile. Erreiche beidi Teams ds Ziu im glyche Stich, giut <b>Stöck – Wyys – Stich</b>.</p>`,

  rules_bieter: `
<p>Für 3, 4 oder 5 Spiler. Wär am meischte bietet, wird <b>König</b> u spiut elei (z füft mit emne Partner) gäge d <b>Pure</b>. Ds Gebot isch ds Ziu vom König für di ganzi Partie; d Pure bruuche geng <b>1000</b> Pünkt. Wär zersch am Ziu isch, gwinnt.</p>
<p><b>Biete:</b> Vorhand faht a. Mindeschtgebot 600 (z dritt), 350 (z viert), 500 (z füft), ufegä wird um mindeschtens 10. «Furt» vor em erschte Gebot zeut nid; nach emne Gebot isch me dusse. Bietet niemer, wird no einisch gä.</p>
<p><b>Erschts Spiu:</b> Z dritt überchunnt jede 10 Charte, 3 lige offe u 3 verdeckt uf em Tisch; z viert je 8 Charte u 2 + 2 uf em Tisch. Dr König nimmt d Tischcharte, <b>drückt</b> glych viu Charte (d Pünkt ghöre ihm) u wäut Trumpf, Obenabe, Undenufe oder <b>Hindersi</b> (dr König darf ke Stich mache: we s klappt, überchunnt er 257, süsch d Pure 257). Z füft (35 Charte, es Sibni fäut) überchunnt jede 7 Charte; dr König wäut d Spiuart u wünscht sech e Charte – wär se het, isch für di ganzi Partie sy Partner (me gseht s, sobau d Charte gspiut wird). Im erschte Spiu spiut dr König us.</p>
<p><b>Ab em zwöite Spiu:</b> Dr König git (när reihum), jede überchunnt aui Charte; di letschti Charte vom Gäber isch dr <b>Bodetrumpf</b>. Dr König cha vor dr erschte Charte passe – de schrybe d Pure 257 (plus ihri Stöck).</p>
<p>Wyys, Stöck u Matsch zeue nach de Grundregle. Erreicht dr Verlierer nid emau d Häufti vo sym Ziu, isch er <b>Schnider</b>.</p>`,

  rules_differenzler: `
<p>Für 3 oder 4 Spiler, jede für sech (z dritt 12 Charte, z viert 9). Di letschti Charte vom Gäber isch offe dr <b>Trumpf</b> (Bodetrumpf).</p>
<p><b>Asäge:</b> Nachdäm er d Charte agluegt het, seit jede, wi viu Pünkt er macht – Vorhand zersch, dr Gäber zletscht. Normalerwys offe; bi «verdeckter Asag» gseht me d Asage ersch am Schluss vo dr Rundi.</p>
<p>S git ke Wyys u kener Stöck. Wär nid cha agä, darf o undertrumpfe. E Matsch zeut 157.</p>
<p><b>Wärtig:</b> D Differänz zwüsche Asag u gmachte Pünkt wird als Strafpünkt gschribe. Wär gnau trifft, überchunnt 10 Pünkt abzoge (usser bi Asag 0 ohni Stich). Nach dr abgmachte Azau Runde (offiziell 16) gwinnt, wär am <b>wenigschte</b> Pünkt het.</p>`,

  rules_molotow: `
<p>Für 3 bis 6 Spiler, jede für sech. Ds Ziu: <b>so weni Pünkt wie müglech</b>. Z dritt 12 Charte, z viert 9, z füft 7 (ds Schäue-Sächsi wird usegno), z sächst 6.</p>
<p><b>Trumpf:</b> Am Afang git s ke Trumpf (wie Obenabe). Wär als Erschte nid cha agä, macht mit dr Farb vo dr Charte, won er spiut, dr Trumpf für e Rescht vo dr Rundi – die Charte isch scho Trumpf. Undertrumpfe isch geng erloubt.</p>
<p><b>Wyys u Stöck</b> us dr eigete Hand zeue als Minuspünkt (guet für di). E <b>Tischwyys</b> – e Wyys, wo us de Charte vomne Stich zämechunnt – wird däm guetgschribe, wo dr Stich macht.</p>
<p>Nach dr abgmachte Azau Runde gwinnt, wär am wenigschte Pünkt het. Di <b>letschti Rundi zeut dopplet</b>.</p>`,

  rules_ohshit: `
<p>Für 4 Spiler, jede gäge jede. Me spiut 9 Runde: zersch mit 9 Charte pro Spiler, när mit 8, 7 … bis zu eire Charte. Di übrige Charte blybe unbekannt.</p>
<p>D Spiuart vo jedere Rundi (e Trumpffarb, Obenabe oder Undenufe) isch im Voruus usglost, nie zwöimau di glychi hingerenang.</p>
<p><b>Vorussäge:</b> Jede seit, wi viu Stich er macht – Vorhand zersch, dr Gäber zletscht. D Summe darf nid glych sy wie d Azau Stich: em Gäber isch e Zau verbote. När gälte di normale Jassregle (agä oder trumpfe, nid undertrumpfe).</p>
<p><b>Wärtig:</b> Wär gnau trifft, überchunnt so viu Pünkt wie Stich (plus 10 Bonuspünkt). Wär drnäbe isch, überchunnt nüt. Wär am Schluss am meischte Pünkt het, gwinnt. Dr Name chunnt vom Usruef bim erschte Stich z viu…</p>`,

  rules_arschloechle: `
<p>Für 3 bis 6 Spiler, jede für sech. Es zeue nume d Wärte: 6 töif, när 7, 8, 9, Banner, Under, Ober, Chünig, Ass höch – d Farb spiut ke Rolle. Wauwys isch ds Rose-Sächsi (Härz-Sächsi) e <b>Joker</b>, wo aues schlaht. Aui Charte wärde verteilt; geit s nid uf, überchunnt ds Arschloch (i dr erschte Rundi dr Gäber) ei Charte meh.</p>
<p><b>Spile:</b> Wär usspiut, leit ei Charte oder mehreri glychi (Paar, Drilling …). Reihum muesch mit <b>glych viu</b> Charte vomne <b>höchere</b> Wärt überbiete – drü Zähni schla nume drü höcheri Glychi. Wär cha, mues überbiete (usser «Passe erloubt» isch igschaltet); wär nid cha, setzt für dä Stich us. Cha niemer meh überbiete, spiut dä, wo zletscht gleit het, nöi us.</p>
<p><b>Titu:</b> Wär zersch aui Charte los isch, wird <b>Chünig</b>, när Vize-Chünig, Burger, Vize-Arschloch – wär am Schluss no Charte het, isch ds <b>Arschloch</b>. Z dritt: Chünig, Burger, Arschloch; z viert ohni Burger.</p>
<p><b>Tusche</b> (ab dr zwöite Rundi): Ds Arschloch git em Chünig sy zwöi beschte Charte u überchunnt zwöi Charte nach Wau vom Chünig zrügg. Vize-Arschloch u Vize-Chünig tusche ei Charte. Ds Arschloch spiut zersch us.</p>
<p><b>Pünkt</b> pro Rundi: Chünig 3, Vize-Chünig 2, Burger 1, Vize-Arschloch 0, Arschloch −1. Nach dr igstellte Azau Runde gwinnt, wär am meischte Pünkt het.</p>
<p><b>I dr App:</b> Tipp e Wärt a – d App wäut grad so viu Charte wie nötig; no einisch atippe nimmt eini wider wäg. När «Spile».</p>`,

  rules_tschausepp: `
<p>Ds Schwiizer Mau-Mau für 2 bis 8 Spiler, ab 5 Spiler mit zwöi Chartespiu. Jede überchunnt 5 Charte, ei Charte wird ufdeckt, dr Rescht isch dr Stock.</p>
<p>Reihum leit me e Charte, wo i dr <b>Farb oder im Wärt</b> zur oberschte passt. Chasch oder wosch nid, ziehsch e Charte – passt se, darfsch se grad spile, süsch isch dr Nächscht dra.</p>
<ul><li><b>Sibni:</b> dr Nächscht mues 2 Charte zie – usser er leit o es Sibni, de zieht dr Übernächscht 4 usw.</li>
<li><b>Achti:</b> dr Nächscht setzt us.</li>
<li><b>Under (Bueb):</b> passt uf jedi Charte (nume nid uf ne Under); me wünscht sech e Farb.</li>
<li><b>Ass:</b> mues deckt wärde – me spiut grad no einisch (oder zieht). Mit emne Ass chasch nid fertig wärde.</li>
<li><b>Zähni</b> (wauwys): d Richtig wächslet.</li></ul>
<p>Wär sy zwöitletschti Charte leit, mues <b>«Tschau»</b> säge, bi dr letschte <b>«Sepp»</b> – i dr App vorhär dr Chnopf atippe. Wär s vergisst, zieht 4 Strafcharte.</p>
<p><b>Wärtig:</b> Wär fertig isch, gwinnt d Rundi. Di angere zeue ihri Charte: 6–10 nach Wärt, Under 20, Ober u Chünig 10, Ass 11. Erreicht öpper ds Limit, gwinnt, wär am wenigschte Pünkt het.</p>`,
};

// ====================================================================== Bairisch
RULES.bar = {
  rules_basics: `
<p>Gspuit werd mit 36 Kartn: 6, 7, 8, 9, Banner (10), Unter (Bua), Ober (Dame), Kini, Sau (Ass). Schweizer Farbn: Schelln, Rosn, Schuidn, Oachln – französisch: Schaufl, Herz, Kreiz, Karo. Gspuit werd gegan Uhrzeiger.</p>
<p><b>Zuagebn:</b> Host de Farb, de ausgspuit worn is, muasst zuagebn – owa trumpfn derfst oiwei. Liegt scho a Trumpf im Stich, derfst ned untertrumpfn, außer du host bloß no Trümpf. Den Puur (Trumpf-Unter) muasst nia zuagebn. Wer an Stich macht, spuit wieder aus.</p>
<table><tr><th></th><th>Trumpf</th><th>sonst</th><th>Obenabe</th><th>Undenufe</th></tr>
<tr><td>Sau</td><td>11</td><td>11</td><td>11</td><td>0</td></tr>
<tr><td>Kini</td><td>4</td><td>4</td><td>4</td><td>4</td></tr>
<tr><td>Ober</td><td>3</td><td>3</td><td>3</td><td>3</td></tr>
<tr><td>Unter</td><td>20 (Puur)</td><td>2</td><td>2</td><td>2</td></tr>
<tr><td>Banner</td><td>10</td><td>10</td><td>10</td><td>10</td></tr>
<tr><td>9</td><td>14 (Nell)</td><td>0</td><td>0</td><td>0</td></tr>
<tr><td>8</td><td>0</td><td>0</td><td>8</td><td>8</td></tr>
<tr><td>6</td><td>0</td><td>0</td><td>0</td><td>11</td></tr></table>
<p>Im Trumpf geht’s so: Puur, Nell, Sau, Kini, Ober, Banner, 8, 7, 6. Bei <b>Obenabe</b> sticht de höchste Kartn (d’ Sau), bei <b>Undenufe</b> de niedrigste (da Sechsa). Da letzte Stich gibt 5 Punkte extra; insgesamt san’s 157 Punkte. Macht a Partei olle Stich (<b>Matsch</b>), gibt’s 100 Punkte drauf (257).</p>
<p><b>Weis:</b> Drei Kartn vo da gleichn Farb in da Reih = 20, via = 50, fümf = 100, sechs = 150, siebm = 200, acht = 250, nein = 300. Via Unter = 200, via Neina = 150, via Sau, Kini, Ober oder Banner = 100. Gweist werd mit da erstn Kartn; bloß de Partei mit am höchstn Weis schreibt – dann owa olle eahnane Weis. Bei gleichem Wert gwinnt de höhere Kartn (bei Undenufe de niedrigere), dann da Trumpf-Weis, dann wer zerscht dro war.</p>
<p><b>Stöck:</b> Ober und Kini vom Trumpf gebn 20 Punkte. De werdn gschriebm, wenn de zwoate Kartn gspuit werd, und zähln oiwei.</p>
<p><b>In da App:</b> Kartn odrucka und nomoi drucka zum Spuin. Erlaubte Kartn san hell. Beim erstn Stich zoagt d’ App deine Weis – odrucka, wennst oan ned weisn wuist. ⟲ zoagt an letztn Stich.</p>`,

  rules_klassisch: `
<p>Da klassische Jass für 3 oder 4 Spieler. Zu viert spuit ma in <b>zwoa Teams</b> (de Partner sitzn si gegnüber) oder a jeda für si, zu dritt oiwei a jeda für si (je 12 Kartn).</p>
<p><b>Trumpf:</b> In da erstn Rundn macht an Trumpf, wer an Rosn-Siebma (Herz-Siebma) hod, dann da nächste Spieler gegan Uhrzeiger. Der suacht a Trumpffarb, Obenabe oder Undenufe aus und spuit aus.</p>
<p>Weis, Stöck und Matsch zähln. Je nach Zählweis wern olle Punkte vo ana Rundn (aa Weis und Stöck) mitm Faktor vo da Spuiart maldenommen.</p>
<p><b>Schluss:</b> Gspuit werd auf 1000, 1500 oder 2500 Punkte. Mit <b>«Bedanken vo Hand»</b> gwinnt, wer’s Zui erreicht hod und als Erster auf «Bedanken» druckt – des geht jederzeit, aa mittn in da Rundn. Wer si z’ friah bedankt, valiert; wer’s vergisst, spuit weida. Kemma beide im gleichn Stich ans Zui, guit <b>Stöck – Wyys – Stich</b>. Mit «automatisch» is des Spui aus, sobald oana des Zui hod.</p>`,

  rules_schieber: `
<p>Da beliebteste Jass: 4 Spieler in <b>zwoa Teams</b>, de Partner sitzn si gegnüber. A jeda kriagt 9 Kartn.</p>
<p><b>Trumpf:</b> In da erstn Rundn macht an Trumpf, wer an Rosn-Siebma (Herz-Siebma) hod, dann reihum gegan Uhrzeiger. Wer dro is, derf <b>schiabn</b>: dann muass da Partner an Trumpf macha. Ausgspuit werd oiwei vo dem, der dro war.</p>
<p><b>Spuiartn:</b> a Trumpffarb, <b>Obenabe</b> (d’ Sau is de höchste Kartn) oder <b>Undenufe</b> (da Sechsa is da höchste). Wahlweis no dazua:</p>
<ul><li><b>Slalom:</b> abwechselnd Obenabe und Undenufe, da erste Stich wia gwäit; zählt werd wia de erste Richtung.</li>
<li><b>Tutti:</b> in jedem Stich is de ausgspuite Farb Trumpf; olle Unter zähln 20, olle Neina 14 (253 Punkte).</li>
<li><b>Misère:</b> zu jeda Spuiart wählbar – ma mog so wenig Punkte wia meglich; jede Partei kriagt de Stichpunkte vo de Gegner.</li></ul>
<p><b>Zählweis:</b> «ois oafach»; «Schelln/Schuidn doppit» (französisch: Schaufl/Kreiz), Obenabe und Undenufe dreifach; «Obe drei, Une via»; oder Appenzeller: Schelln ×2, Rosn ×3, Schuidn ×4, Obenabe ×5, Undenufe ×6, Oachln ×7 auf 5000. Slalom zählt wia Obenabe, Tutti wia Undenufe. Da Faktor guit aa für Weis, Stöck und Matsch.</p>
<p><b>Schluss:</b> Wer des Zui (1000 bis 5000) hod, muass si <b>bedanken</b> (Knopf obn). Z’ friah bedankt = valorn, vergessn = weidaspuin. Kemma beide Teams im gleichn Stich ans Zui, guit <b>Stöck – Wyys – Stich</b>.</p>`,

  rules_bieter: `
<p>Für 3, 4 oder 5 Spieler. Wer am meistn biat, werd <b>Kini</b> und spuit alloa (zu fümft mit am Partner) gega de <b>Bauern</b>. Des Gebot is des Zui vom Kini für de ganze Partie; de Bauern brauchan oiwei <b>1000</b> Punkte. Wer zerscht am Zui is, gwinnt.</p>
<p><b>Bietn:</b> Vorhand fangt o. Mindestgebot 600 (zu dritt), 350 (zu viert), 500 (zu fümft), erhöht werd um mindestns 10. «Furt» vorm erstn Gebot zählt ned; nach am Gebot is ma draußn. Biat koana, werd nomoi gebn.</p>
<p><b>Erstes Spui:</b> Zu dritt kriagt a jeda 10 Kartn, 3 liegn offn und 3 zuadeckt am Tisch; zu viert je 8 Kartn und 2 + 2 am Tisch. Da Kini nimmt de Tischkartn, <b>druckt</b> gleich vui Kartn (de Punkte ghörn eahm) und suacht Trumpf, Obenabe, Undenufe oder <b>Hindersi</b> aus (da Kini derf koan Stich macha: wenn’s klappt, kriagt er 257, sonst kriang de Bauern 257). Zu fümft (35 Kartn, a Siebma fehlt) kriagt a jeda 7 Kartn; da Kini suacht de Spuiart aus und wünscht si a Kartn – wer de hod, is für de ganze Partie sei Partner (ma siagt’s, sobald de Kartn gspuit werd). Im erstn Spui spuit da Kini aus.</p>
<p><b>Ab am zwoatn Spui:</b> Da Kini gibt (dann reihum), a jeda kriagt olle Kartn; de letzte Kartn vom Geber is da <b>Bodntrumpf</b>. Da Kini ko vor da erstn Kartn passn – dann schreibm de Bauern 257 (plus eahnane Stöck).</p>
<p>Weis, Stöck und Matsch zähln nach de Grundregln. Kimmt da Valierer ned amoi auf de Hälftn vo seim Zui, is er <b>Schneider</b>.</p>`,

  rules_differenzler: `
<p>Für 3 oder 4 Spieler, a jeda für si (zu dritt 12 Kartn, zu viert 9). De letzte Kartn vom Geber is offn da <b>Trumpf</b> (Bodntrumpf).</p>
<p><b>Osogn:</b> Wenn er seine Kartn ogschaugt hod, sogt a jeda, wia vui Punkte er macht – Vorhand zerscht, da Geber zletzt. Normal offn; bei da «zuadecktn Osog» siagt ma de Osogn erst am Schluss vo da Rundn.</p>
<p>Es gibt koan Weis und koane Stöck. Wer ned zuagebn ko, derf aa untertrumpfn. A Matsch zählt 157.</p>
<p><b>Wertung:</b> De Differenz zwischn Osog und gmachte Punkte werd ois Strafpunkte gschriebm. Wer gnau trifft, kriagt 10 Punkte obzogn (außer bei Osog 0 ohne Stich). Nach da ausgmachtn Ozahl Rundn (offiziell 16) gwinnt, wer am <b>wenigstn</b> Punkte hod.</p>`,

  rules_molotow: `
<p>Für 3 bis 6 Spieler, a jeda für si. Des Zui: <b>so wenig Punkte wia meglich</b>. Zu dritt 12 Kartn, zu viert 9, zu fümft 7 (da Schelln-Sechsa kimmt raus), zu sechst 6.</p>
<p><b>Trumpf:</b> Am Ofang gibt’s koan Trumpf (wia Obenabe). Wer ois Erster ned zuagebn ko, macht mit da Farb vo da Kartn, de er spuit, an Trumpf für an Rest vo da Rundn – de Kartn is scho Trumpf. Untertrumpfn is oiwei erlaubt.</p>
<p><b>Weis und Stöck</b> aus da eignen Hand zähln ois Minuspunkte (guad für di). A <b>Tischweis</b> – a Weis, der si aus de Kartn vo am Stich ergibt – werd dem gutgschriebm, der an Stich macht.</p>
<p>Nach da ausgmachtn Ozahl Rundn gwinnt, wer am wenigstn Punkte hod. De <b>letzte Rundn zählt doppit</b>.</p>`,

  rules_ohshit: `
<p>Für 4 Spieler, a jeda gega jedn. Es wern 9 Rundn gspuit: zerscht mit 9 Kartn pro Spieler, dann mit 8, 7 … bis zu oana Kartn. De übrign Kartn bleibm unbekannt.</p>
<p>De Spuiart vo jeda Rundn (a Trumpffarb, Obenabe oder Undenufe) is im Voraus auslost, nia zwoamoi de gleiche hinternand.</p>
<p><b>Vorhersogn:</b> A jeda sogt, wia vui Stich er macht – Vorhand zerscht, da Geber zletzt. De Summ derf ned gleich sei wia de Ozahl Stich: am Geber is a Zahl verbotn. Dann guidn de normaln Jassregln (zuagebn oder trumpfn, ned untertrumpfn).</p>
<p><b>Wertung:</b> Wer gnau trifft, kriagt so vui Punkte wia Stich (plus 10 Bonuspunkte). Wer danebn liegt, kriagt nix. Wer am Schluss de meistn Punkte hod, gwinnt. Den Nama hod des Spui vom Ausruaf beim erstn Stich z’ vui…</p>`,

  rules_arschloechle: `
<p>Für 3 bis 6 Spieler, a jeda für si. Es zähln bloß de Wert: 6 nieder, dann 7, 8, 9, Banner, Unter, Ober, Kini, Sau hoch – de Farb is wurscht. Wahlweis is da Rosn-Sechsa (Herz-Sechsa) a <b>Joker</b>, der ois sticht. Olle Kartn wern austeilt; geht’s ned auf, kriagt des Oarschloch (in da erstn Rundn da Geber) oa Kartn mehra.</p>
<p><b>Spuin:</b> Wer ausspuit, legt oa Kartn oder mehrere gleiche (Paar, Drilling …). Reihum muass ma mit <b>gleich vui</b> Kartn vo am <b>höhern</b> Wert überbietn – drei Zehna schlagt ma bloß mit drei höhern Gleichn. Wer ko, muass überbietn (außer «Passn derf ma» is eigstellt); wer ned ko, setzt für den Stich aus. Ko koana mehr überbietn, spuit der, der zletzt glegt hod, nei aus.</p>
<p><b>Titl:</b> Wer zerscht olle Kartn los is, werd <b>Kini</b>, dann Vize-Kini, Bürger, Vize-Oarschloch – wer am Schluss no Kartn hod, is des <b>Oarschloch</b>. Zu dritt: Kini, Bürger, Oarschloch; zu viert ohne Bürger.</p>
<p><b>Tauschn</b> (ab da zwoatn Rundn): Des Oarschloch gibt am Kini seine zwoa bestn Kartn und kriagt zwoa Kartn, de da Kini aussuacht, zruck. Vize-Oarschloch und Vize-Kini tauschn oa Kartn. Des Oarschloch spuit zerscht aus.</p>
<p><b>Punkte</b> pro Rundn: Kini 3, Vize-Kini 2, Bürger 1, Vize-Oarschloch 0, Oarschloch −1. Nach da eigstelltn Ozahl Rundn gwinnt, wer de meistn Punkte hod.</p>
<p><b>In da App:</b> Druck an Wert o – d’ App suacht glei so vui Kartn aus wia’s braucht; nomoi odrucka nimmt oane wieder weg. Dann «Spuin».</p>`,

  rules_tschausepp: `
<p>S’ Schweizer Mau-Mau für 2 bis 8 Spieler, ab 5 Spieler mit zwoa Kartnspui. A jeda kriagt 5 Kartn, oa Kartn werd aufdeckt, da Rest is da Stock.</p>
<p>Reihum legt ma a Kartn, de in da <b>Farb oder im Wert</b> zur oberstn passt. Konnst oder mogst ned, ziagst a Kartn – passt de, derfst as glei spuin, sonst is da Nächste dro.</p>
<ul><li><b>Siebma:</b> da Nächste muass 2 Kartn ziang – außer er legt aa an Siebma, dann ziagt da Übernächste 4 usw.</li>
<li><b>Achta:</b> da Nächste setzt aus.</li>
<li><b>Unter (Bua):</b> passt auf jede Kartn (bloß ned auf an Unter); ma wünscht si a Farb.</li>
<li><b>Sau (Ass):</b> muass zuadeckt wern – ma spuit glei nomoi (oder ziagt). Mit ana Sau konnst ned firte wern.</li>
<li><b>Zehna</b> (wahlweis): de Richtung draht si um.</li></ul>
<p>Wer sei zwoatletzte Kartn legt, muass <b>«Tschau»</b> sogn, bei da letztn <b>«Sepp»</b> – in da App vorher an Knopf odrucka. Wer’s vergisst, ziagt 4 Strafkartn.</p>
<p><b>Wertung:</b> Wer firte is, gwinnt de Rundn. De andern zähln eahnane Kartn: 6–10 nach Wert, Unter 20, Ober und Kini 10, Sau 11. Kimmt oana ans Limit, gwinnt, wer am wenigstn Punkte hod.</p>`,
};

// ====================================================================== English
RULES.en = {
  rules_basics: `
<p>Jass uses 36 cards: 6, 7, 8, 9, Banner (10), Under (Jack), Ober (Queen), King, Ace. Swiss suits: Bells, Roses, Shields, Acorns – French: Spades, Hearts, Clubs, Diamonds. Play goes counterclockwise.</p>
<p><b>Following suit:</b> If you hold the led suit you must follow – but you may always trump instead. If a trump is already in the trick you may not play a lower trump (undertrump), unless you hold only trumps. You never have to follow trump with the trump Under (Puur). The trick winner leads next.</p>
<table><tr><th></th><th>Trump</th><th>other</th><th>Obenabe</th><th>Undenufe</th></tr>
<tr><td>Ace</td><td>11</td><td>11</td><td>11</td><td>0</td></tr>
<tr><td>King</td><td>4</td><td>4</td><td>4</td><td>4</td></tr>
<tr><td>Ober</td><td>3</td><td>3</td><td>3</td><td>3</td></tr>
<tr><td>Under</td><td>20 (Puur)</td><td>2</td><td>2</td><td>2</td></tr>
<tr><td>Banner</td><td>10</td><td>10</td><td>10</td><td>10</td></tr>
<tr><td>9</td><td>14 (Nell)</td><td>0</td><td>0</td><td>0</td></tr>
<tr><td>8</td><td>0</td><td>0</td><td>8</td><td>8</td></tr>
<tr><td>6</td><td>0</td><td>0</td><td>0</td><td>11</td></tr></table>
<p>Trump order: Puur, Nell, Ace, King, Ober, Banner, 8, 7, 6. In <b>Obenabe</b> ("top down") the highest card (Ace) wins, in <b>Undenufe</b> ("bottom up") the lowest (6). The last trick is worth 5 extra points; 157 points in total. A side that takes every trick (<b>Matsch</b>) gets 100 extra (257).</p>
<p><b>Weis (melds):</b> three cards in sequence of one suit = 20, four = 50, five = 100, six = 150, seven = 200, eight = 250, nine = 300. Four Unders = 200, four Nines = 150, four Aces, Kings, Obers or Banners = 100. Melds are declared with your first card; only the side with the best meld scores – but then all of its melds. Equal melds: the higher card wins (in Undenufe the lower), then the trump meld, then whoever played first.</p>
<p><b>Stöck:</b> Ober and King of trump score 20. They are written when the second of them is played and always count.</p>
<p><b>In the app:</b> tap a card, tap again to play. Allowed cards are bright. With your first card the app suggests your melds – tap one to keep it secret. ⟲ shows the last trick.</p>`,

  rules_klassisch: `
<p>The classic Jass for 3 or 4 players. With four you play in <b>two teams</b> (partners opposite) or everybody alone; with three everybody plays alone (12 cards each).</p>
<p><b>Trump:</b> in the first deal the holder of the 7 of Roses (7 of Hearts) chooses, afterwards the next player counterclockwise. The chooser names a trump suit, Obenabe or Undenufe and leads.</p>
<p>Weis, Stöck and Matsch count. Depending on the counting option all points of a deal (melds and Stöck included) are multiplied by the factor of the chosen mode.</p>
<p><b>End:</b> play to 1000, 1500 or 2500. With <b>"claim with Bedanken"</b> the winner is whoever has reached the target and taps "Bedanken" first – at any time, even in the middle of a deal. Claiming too early loses; forgetting means playing on. If both sides reach the target in the same trick, the order <b>Stöck – Weis – trick</b> decides. With "automatic" the game ends as soon as anybody reaches the target.</p>`,

  rules_schieber: `
<p>The most popular Jass: 4 players in <b>two teams</b>, partners sit opposite. Everybody gets 9 cards.</p>
<p><b>Trump:</b> in the first deal the holder of the 7 of Roses (7 of Hearts) chooses, then it goes round counterclockwise. The player whose turn it is may <b>push</b> (schieben): then the partner must choose. The player whose turn it was always leads.</p>
<p><b>Modes:</b> a trump suit, <b>Obenabe</b> (Ace highest) or <b>Undenufe</b> (6 highest). Optionally also:</p>
<ul><li><b>Slalom:</b> Obenabe and Undenufe alternate trick by trick, starting as chosen; scored like the first direction.</li>
<li><b>Tutti:</b> in every trick the led suit is trump; all Unders count 20, all Nines 14 (253 points).</li>
<li><b>Misère:</b> can be added to any mode – you want as few points as possible; each side is credited with the opponents' card points.</li></ul>
<p><b>Counting:</b> "all single"; "Bells/Shields double" (French: Spades/Clubs), Obenabe and Undenufe triple; "Obe ×3, Une ×4"; or Appenzell: Bells ×2, Roses ×3, Shields ×4, Obenabe ×5, Undenufe ×6, Acorns ×7, played to 5000. Slalom counts like Obenabe, Tutti like Undenufe. The factor also applies to melds, Stöck and Matsch.</p>
<p><b>End:</b> once your team has reached the target (1000 to 5000) you must <b>claim</b> it with "Bedanken" (button at the top). Too early = lost, forgotten = play on. If both teams reach the target in the same trick, <b>Stöck – Weis – trick</b> decides.</p>`,

  rules_bieter: `
<p>For 3, 4 or 5 players. The highest bidder becomes <b>König</b> and plays alone (with five players together with a partner) against the <b>Bauern</b>. The bid is the König's target for the whole match; the Bauern always need <b>1000</b> points. Whoever reaches their target first wins.</p>
<p><b>Bidding:</b> the player after the dealer starts. Minimum bid 600 (three players), 350 (four), 500 (five); raise by at least 10. A pass before the first bid is not binding; after a bid, passing is final. If nobody bids, the cards are dealt again.</p>
<p><b>First game:</b> with three players everybody gets 10 cards, 3 lie face up and 3 face down on the table; with four, 8 cards each and 2 + 2 on the table. The König takes the table cards, <b>discards</b> the same number (their points are his) and chooses trump, Obenabe, Undenufe or <b>Hindersi</b> (the König must take no trick: if he succeeds he scores 257, otherwise the Bauern score 257). With five players (35 cards, one 7 removed) everybody gets 7 cards; the König chooses the mode and calls a card – whoever holds it is his partner for the whole match (revealed when the card is played). In the first game the König leads.</p>
<p><b>From the second game:</b> the König deals (then it goes round), all cards are dealt; the dealer's last card is the <b>trump card</b>. Before the first card the König may pass – then the Bauern score 257 (plus their Stöck).</p>
<p>Weis, Stöck and Matsch count as in the basic rules. A loser who did not reach half of their target is <b>Schneider</b> (double loss).</p>`,

  rules_differenzler: `
<p>For 3 or 4 players, everybody alone (12 cards each with three, 9 with four). The dealer's last card is shown and sets the <b>trump</b>.</p>
<p><b>Announcing:</b> after looking at the cards everybody announces how many card points they will make – the player after the dealer first, the dealer last. Normally open; with "hidden announcements" they are revealed only at the end of the deal.</p>
<p>No melds and no Stöck. If you cannot follow suit you may also undertrump. A Matsch counts 157.</p>
<p><b>Scoring:</b> the difference between announcement and points made is written as penalty. An exact hit takes 10 points off (except announcing 0 and taking no trick). After the agreed number of deals (officially 16) the player with the <b>fewest</b> points wins.</p>`,

  rules_molotow: `
<p>For 3 to 6 players, everybody alone. Goal: <b>as few points as possible</b>. 12 cards each with three players, 9 with four, 7 with five (the 6 of Bells is removed), 6 with six.</p>
<p><b>Trump:</b> there is no trump at first (like Obenabe). The first player who cannot follow suit makes the suit of the card he plays trump for the rest of the deal – that card is already a trump. Undertrumping is always allowed.</p>
<p><b>Melds and Stöck</b> from your own hand count as minus points (good for you). A <b>table meld</b> – a meld formed by the cards of one trick – is credited to the player who takes that trick.</p>
<p>After the agreed number of deals the player with the fewest points wins. The <b>last deal counts double</b>.</p>`,

  rules_ohshit: `
<p>For 4 players, everybody for themselves. Nine deals are played: first with 9 cards each, then 8, 7 … down to a single card. The remaining cards stay unknown.</p>
<p>The mode of every deal (a trump suit, Obenabe or Undenufe) is drawn in advance, never the same twice in a row.</p>
<p><b>Predictions:</b> everybody says how many tricks they will take – the player after the dealer first, the dealer last. The total must not equal the number of tricks, so one number is forbidden for the dealer. Then normal Jass rules apply (follow suit or trump, no undertrumping).</p>
<p><b>Scoring:</b> an exact prediction scores as many points as tricks (plus a 10 point bonus); a wrong one scores nothing. Most points at the end wins. The name comes from what people shout at the first trick too many…</p>`,

  rules_arschloechle: `
<p>For 3 to 6 players, everybody alone. Only ranks count: 6 low, then 7, 8, 9, Banner, Under, Ober, King, Ace high – suits do not matter. Optionally the 6 of Roses (6 of Hearts) is a <b>Joker</b> that beats everything. All cards are dealt; if they do not divide evenly, the Arschloch (in the first round the dealer) gets one card more.</p>
<p><b>Play:</b> the leader plays one card or several of the same rank (pair, triple …). In turn you must beat it with the <b>same number</b> of cards of a <b>higher</b> rank – three Tens are only beaten by three higher equal cards. If you can beat, you must (unless "passing allowed" is on); if you cannot, you sit out this round of play. When nobody can beat any more, whoever played last leads again.</p>
<p><b>Titles:</b> the first player out of cards becomes <b>King</b>, then Vice-King, Citizen, Vice-Arschloch – whoever still holds cards at the end is the <b>Arschloch</b>. With three players: King, Citizen, Arschloch; with four there is no Citizen.</p>
<p><b>Exchange</b> (from the second round): the Arschloch gives the King his two best cards and gets two cards of the King's choice back. Vice-Arschloch and Vice-King swap one card. The Arschloch leads first.</p>
<p><b>Points</b> per round: King 3, Vice-King 2, Citizen 1, Vice-Arschloch 0, Arschloch −1. After the chosen number of rounds the player with the most points wins.</p>
<p><b>In the app:</b> tap a rank – the app selects as many cards as needed; tapping a selected card removes it. Then "Play".</p>`,

  rules_tschausepp: `
<p>The Swiss version of Mau-Mau (like Crazy Eights) for 2 to 8 players, with two decks from 5 players. Everybody gets 5 cards, one card is turned up, the rest is the stock.</p>
<p>In turn you play a card that matches the top card in <b>suit or rank</b>. If you cannot (or do not want to), draw a card – if it fits you may play it at once, otherwise it is the next player's turn.</p>
<ul><li><b>7:</b> the next player draws 2 – unless they also play a 7, then the following player draws 4, and so on.</li>
<li><b>8:</b> the next player is skipped.</li>
<li><b>Under (Jack):</b> fits on any card (except another Under); you wish a suit.</li>
<li><b>Ace:</b> must be covered – you play again (or draw). You cannot go out with an Ace.</li>
<li><b>10</b> (optional): reverses the direction.</li></ul>
<p>When you play your second-to-last card you must say <b>"Tschau"</b>, with the last one <b>"Sepp"</b> – in the app tap the button before playing. Forgetting costs 4 penalty cards.</p>
<p><b>Scoring:</b> the player who goes out wins the round. The others count their cards: 6–10 face value, Under 20, Ober and King 10, Ace 11. When somebody reaches the limit, the player with the fewest points wins.</p>`,
};
