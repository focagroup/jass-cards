# Jass (Android)

Eight Swiss card games for 2–8 players on a red carpet, with bots, built like the Scopa app: the phone runs a small
game server on the local network, the UI is a web page (in the app's WebView and in any browser).
The app never contacts the internet.

| Game         | Players | Notes |
|--------------|---------|-------|
| Schieber     | 4 (2 teams) | push the trump to the partner; optional Slalom, Tutti, Misère; multipliers; Bedanken |
| Klassisch    | 3–4     | 4 players in two teams or everybody alone; Rosen-7 holder chooses first |
| Bieter       | 3–5     | auction, König vs. Bauern, table cards / discard / Hindersi, Bodentrumpf, partner card with 5 |
| Differenzler | 3–4     | Bodentrumpf, announce your points (open or hidden), penalty = difference |
| Molotow      | 3–6     | first player who cannot follow sets trump; Tischweis; fewest points win |
| Oh Shit!     | 4       | 9 deals from 9 to 1 card, predict tricks, dealer restriction |
| Tschau Sepp  | 2–8     | Swiss Mau-Mau, two decks from 5 players, Tschau/Sepp calls |
| Arschlöchle  | 3–6     | shed singles/pairs/triples; König … Arschloch; card exchange; optional Joker (Rosen-6) and free passing; rank points over 5/10/15 rounds |

Rules follow the German Wikipedia article "Jass" and, where it is short, jasswiki.ch.
The rules of the selected game are shown in the lobby and in the ☰ menu.

Languages: Deutsch, Zürischnurre, Bärndütsch, Bairisch, English (`app/assets/web/i18n.js`,
rules in `app/assets/web/rules.js`).

## Playing together

- **One phone (pass-and-play):** set several seats to *This device*; the hand is covered until the
  next player taps it.
- **Browser players:** set a seat to *Mitspieler (entfernt)* / *Remote player*; others open the shown `http://<phone-ip>:<port>`
  on the same Wi-Fi or the host phone's hotspot.
- **Bluetooth (app players, no Wi-Fi needed):** pair the two phones once in Android's
  Bluetooth settings. On the host, set a seat to a remote player and tap *Bluetooth erlauben*
  (stays on across restarts until turned off). On the other phone open Jass, tap
  *Per Bluetooth beitreten* and pick the host phone. Up to ~7 phones can join one host.
  The guest app shows its own copy of the game UI; only the game moves go over Bluetooth.
  Both phones need the same app version.
- **Bots:** easy / normal / hard (hard plays out sampled deals before every card).
  The host can hand a seat to a bot from the ☰ menu.

## Card skins

Chosen per device in the lobby or the ☰ menu.

- `skins/alternative/` – hand-drawn Swiss-German deck (Schellen, Rosen, Schilten, Eicheln; 6–9, Banner, Under, Ober, König, As)
- `skins/french/` – French-suited deck (Schaufel, Herz, Kreuz, Ecke; 6–10, Bube, Dame, König, As)

Every skin uses the same file names: `<schellen|rosen|schilten|eicheln>_<06..14>.svg`
(11 = Under/Bube, 12 = Ober/Dame, 13 = König, 14 = As), `suit_<suit>.svg` and `back.svg`.
French suits map to the Swiss ones as Schaufel = Schellen, Herz = Rosen, Kreuz = Schilten, Ecke = Eicheln.
A third skin only needs a new folder with these files and an entry in `SKINS` in `app.js`
(plus `skin_<name>` strings in `i18n.js`).

```bash
node tools/gen_cards.js skins     # regenerate alternative + french
python3 tools/make_icon.py        # icon.png + launcher icons (needs rsvg-convert)
```

## Build (offline, no Gradle)

The shared engine is the git submodule `framework/`
([cards-framework](https://github.com/focagroup/cards-framework)). Clone with
`git clone --recursive https://github.com/focagroup/jass-cards`, or run `git submodule update --init`
in an existing clone.

Requires JDK 17+ and the Android SDK (`platforms/android-35`, `build-tools/35.0.0`) in `~/Android/Sdk`.

```bash
./build.sh          # -> build/jass.apk (min Android 7.0 / API 24)
./build.sh test     # rule checks + bot-vs-bot games for every game and player count
./build.sh desktop  # run the server on this PC (http://localhost:8080)
./build.sh relaytest # Bluetooth relay checks, with TCP standing in for Bluetooth
```

The APK is signed with `~/claude/.keys/cards/jass.jks`, with its password in `jass.pass` next to it
(see Signing in the framework README). Keys and passwords are never in git. Keep them backed up:
Android only installs updates signed with the same key.

## Layout

- `framework/` – git submodule [cards-framework](https://github.com/focagroup/cards-framework):
  lobby/room base, HTTP server, Bluetooth relay, the Android activity and the shared `build.sh`
- `app/core/` – pure Java: `Deal` (trick rules), `Weis`, `Mode`, one class per game
  (`TeamJass` = Schieber + Klassisch, `Bieter`, `Differenzler`, `Molotow`, `OhShit`, `TschauSepp`),
  `Bot`, and `Room` (the framework room driving a `Match`)
- `app/src/` – Android `MainActivity`: Jass's identity, colours and Bluetooth UUID on top of the
  framework's `CardsActivity`
- `game.conf` – build settings read by `framework/build.sh`
- `app/assets/web/` – the UI
- `desktop/` – desktop runner and `SimTest`
