package app.jass.core;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

/**
 * Bieter (Steiger) after the JassWiki rules, for 3, 4 or 5 players.
 * The highest bidder becomes König and plays (with 5 players together with the holder of a wished
 * card) against the Bauern. The König side must reach its bid, the Bauern 1000 points.
 * Game 1: table cards for the König (3/4 players), he discards and chooses trump, Obenabe,
 * Undenufe or Hindersi. From game 2 the bottom card of the deal is trump; the König may refuse to play.
 */
public final class Bieter extends TrickGame {
    static final int CARDS = 0, WEIS = 1, STOECK = 2, MATSCH = 3, DISCARD = 4;

    int king = -1, partner = -1, calledCard = -1;
    boolean partnerRevealed;
    int bid;
    int highBid, highBidder = -1, passesNoBid;
    boolean[] out;
    final List<Integer> tableUp = new ArrayList<>(), tableDown = new ArrayList<>(), discards = new ArrayList<>();
    long[] live = new long[2];
    int[][] parts;
    boolean ended, declined, hindersiLost;
    Mode botPlan;
    int hypoKing = -1;
    final int minBid;

    Bieter(Config cfg, Random rng) {
        super(cfg, rng);
        totals = new long[2];
        weisOn = stoeckOn = true;
        minBid = n == 3 ? 600 : n == 4 ? 350 : 500;
        dealer = rng.nextInt(n);
        startGame();
    }

    @Override public int teams() { return 2; }

    @Override
    public int team(int seat) {
        if (king < 0) return -1;
        return seat == king || seat == partner ? 0 : 1;
    }

    @Override
    public int side(int seat) {
        int k = king >= 0 ? king : hypoKing;
        if (k < 0) return seat;
        return seat == k || seat == partner ? 0 : 1;
    }

    private List<Integer> freshDeck() {
        List<Integer> deck = Cards.deck(1, rng);
        if (n == 5) deck.remove(Integer.valueOf(Cards.id(0, Cards.R7)));
        return deck;
    }

    private void startGame() {
        round++;
        newDeal();
        parts = new int[2][5];
        declined = hindersiLost = false;
        tableUp.clear(); tableDown.clear(); discards.clear();
        List<Integer> deck = freshDeck();
        if (round == 1) {
            dealer = (dealer + 1) % n;
            int per = n == 3 ? 10 : n == 4 ? 8 : 7;
            dealOut(deck, per);
            int t = deck.size() - per * n;
            for (int i = 0; i < t; i++) (i < t / 2 ? tableUp : tableDown).add(deck.get(per * n + i));
            out = new boolean[n];
            highBid = 0;
            highBidder = -1;
            passesNoBid = 0;
            step = "bid";
            actor = (dealer + 1) % n;
        } else {
            dealer = round == 2 ? king : (dealer + 1) % n;
            int per = deck.size() / n;
            dealOut(deck, per);
            shownCard = deck.get(per * n - 1);
            deal.mode = Mode.trump(Cards.suit(shownCard));
            step = "decline";
            actor = king;
            event("bodentrumpf", "card", shownCard);
        }
    }

    // ------------------------------------------------------------------ auction

    private int nextBidder(int from) {
        for (int k = 1; k <= n; k++) {
            int s = (from + k) % n;
            if (!out[s] && s != highBidder) return s;
        }
        return -1;
    }

    private void doBid(int seat, int v) {
        highBid = v;
        highBidder = seat;
        event("auction", "seat", seat, "value", v);
        advanceAuction(seat);
    }

    private void doPass(int seat) {
        event("auction", "seat", seat, "value", 0);
        if (highBidder >= 0) out[seat] = true;
        else if (++passesNoBid >= n) {
            event("redeal");
            round = 0;
            startGame();
            return;
        }
        advanceAuction(seat);
    }

    private void advanceAuction(int seat) {
        int nx = nextBidder(seat);
        if (nx < 0 || (highBidder >= 0 && allOthersOut())) { auctionWon(); return; }
        actor = nx;
    }

    private boolean allOthersOut() {
        for (int s = 0; s < n; s++) if (s != highBidder && !out[s]) return false;
        return true;
    }

    private void auctionWon() {
        king = highBidder;
        bid = highBid;
        event("king", "seat", king, "value", bid);
        if (n == 5) {
            step = "trump";
        } else {
            deal.hands[king].addAll(tableUp);
            deal.hands[king].addAll(tableDown);
            step = "discard";
        }
        actor = king;
    }

    // ------------------------------------------------------------------ actions

    List<String> modeOptions() {
        List<String> o = new ArrayList<>(Arrays.asList("trump0", "trump1", "trump2", "trump3", "obe", "une"));
        if (n != 5) o.add("hindersi");
        return o;
    }

    @Override
    protected String actOther(int seat, String action, Map<String, String> p) {
        if (seat != actor) return "not_your_turn";
        switch (action) {
            case "auction": {
                if (!"bid".equals(step)) return "bad_step";
                int v = parse(p, "value", -1);
                if (v == 0) { doPass(seat); return null; }
                int min = highBidder < 0 ? minBid : highBid + 10;
                if (v < min || v % 10 != 0 || v > 5000) return "bad_value";
                doBid(seat, v);
                return null;
            }
            case "discard": {
                if (!"discard".equals(step)) return "bad_step";
                List<Integer> cs = Cards.parseList(p.get("cards"));
                int need = tableUp.size() + tableDown.size();
                if (cs.size() != need || !deal.hands[seat].containsAll(cs) || new java.util.HashSet<>(cs).size() != need) return "bad_discard";
                discard(cs);
                return null;
            }
            case "trump": {
                if (!"trump".equals(step)) return "bad_step";
                Mode m = Mode.parse(p.get("mode"));
                if (m == null || m.misere || !modeOptions().contains(m.key())) return "bad_mode";
                chooseMode(m);
                return null;
            }
            case "callCard": {
                if (!"callCard".equals(step)) return "bad_step";
                int c = parse(p, "card", -1);
                if (c < 0 || c >= 36 || deal.hands[king].contains(c) || c == Cards.id(0, Cards.R7)) return "bad_card";
                callCard(c);
                return null;
            }
            case "decline": {
                if (!"decline".equals(step)) return "bad_step";
                if ("1".equals(p.get("pass"))) refuse(); else beginPlay(deal.mode, (dealer + 1) % n, deal.hands[0].size());
                return null;
            }
            default:
                return "unknown";
        }
    }

    private void discard(List<Integer> cs) {
        deal.hands[king].removeAll(cs);
        discards.addAll(cs);
        tableUp.clear();
        tableDown.clear();
        event("discard", "seat", king, "count", cs.size());
        step = "trump";
        actor = king;
    }

    private void chooseMode(Mode m) {
        event("mode", "seat", king, "mode", m.key());
        deal.mode = m;
        if (n == 5 && partner < 0) { step = "callCard"; actor = king; return; }
        beginPlay(m, king, deal.hands[king].size());
    }

    private void callCard(int c) {
        calledCard = c;
        for (int s = 0; s < n; s++) if (deal.hands[s].contains(c)) partner = s;
        event("callCard", "seat", king, "card", c);
        beginPlay(deal.mode, king, deal.hands[king].size());
    }

    private void refuse() {
        declined = true;
        event("refuse", "seat", king);
        // the Bauern write 257 plus their own Stöck
        int t = deal.mode.suit;
        int o = Cards.id(t, Cards.OBER), k = Cards.id(t, Cards.KOENIG);
        credit(1, 257, CARDS);
        for (int s = 0; s < n; s++) if (side(s) == 1 && deal.hands[s].contains(o) && deal.hands[s].contains(k)) credit(1, 20, STOECK);
        if (!ended) finishDeal();
    }

    @Override
    protected String playCard(int seat, int card, String weisSel) {
        String e = super.playCard(seat, card, weisSel);
        if (e == null && card == calledCard && !partnerRevealed) {
            partnerRevealed = true;
            event("partner", "seat", seat);
        }
        return e;
    }

    // ------------------------------------------------------------------ scoring

    private void credit(int sd, int pts, int kind) {
        if (pts == 0 || ended) return;
        parts[sd][kind] += pts;
        live[sd] += pts;
        if (sd == 0 && live[0] >= bid) end(0);
        else if (sd == 1 && live[1] >= 1000) end(1);
    }

    @Override protected void onStoeck(int seat) { credit(side(seat), 20, STOECK); }
    @Override protected void onWeis(int tm, int pts) { credit(tm, pts, WEIS); }

    @Override
    protected void onTrick() {
        int sd = side(deal.lastWinner);
        if (deal.mode.type == Mode.HINDERSI) {
            if (sd == 0) {
                hindersiLost = true;
                event("hindersiLost", "seat", deal.lastWinner);
                credit(1, 257, MATSCH);
                if (!ended) finishDeal();
            }
            return;
        }
        credit(sd, deal.lastTrickPoints, CARDS);
    }

    @Override
    protected void onDealDone() {
        if (ended || !PLAY.equals(step)) return;
        if (deal.mode.type == Mode.HINDERSI) {
            credit(0, 257, MATSCH);
        } else {
            for (int sd = 0; sd < 2; sd++) {
                int tr = 0;
                for (int s = 0; s < n; s++) if (side(s) == sd) tr += deal.tricks[s];
                if (tr == deal.totalTricks) { credit(sd, 100, MATSCH); event("matsch", "team", sd); }
            }
            int dp = 0;
            for (int c : discards) dp += deal.mode.points(c);
            credit(0, dp, DISCARD);
        }
        if (!ended) finishDeal();
    }

    private void finishDeal() {
        totals = live.clone();
        result = buildResult();
        step = ROUND_END;
        actor = -1;
    }

    private void end(int winSide) {
        ended = true;
        totals = live.clone();
        result = buildResult();
        boolean schneider = winSide == 0 ? live[1] < 500 : live[0] < bid / 2.0;
        result.put("schneider", schneider);
        partnerRevealed = true;
        finishGame(Collections.singletonList(winSide));
    }

    private Map<String, Object> buildResult() {
        Map<String, Object> r = newResult();
        r.put("mode", deal.mode == null ? null : deal.mode.key());
        int[][] col = new int[5][2];
        int[] sum = new int[2];
        for (int sd = 0; sd < 2; sd++) for (int k = 0; k < 5; k++) { col[k][sd] = parts[sd][k]; sum[sd] += parts[sd][k]; }
        row(r, "r_cards", list(col[CARDS]), null);
        row(r, "r_weis", list(col[WEIS]), null);
        row(r, "r_stoeck", list(col[STOECK]), null);
        row(r, "r_matsch", list(col[MATSCH]), null);
        if (round == 1 && !discards.isEmpty()) row(r, "r_discard", list(col[DISCARD]), null);
        row(r, "r_round", list(sum), "pt");
        row(r, "r_total", list(live), "tot");
        row(r, "r_goal", list(new long[]{bid, 1000}), null);
        if (declined) r.put("declined", true);
        if (hindersiLost) r.put("hindersiLost", true);
        return r;
    }

    @Override
    public void nextRound() { if (ROUND_END.equals(step)) startGame(); }

    // ------------------------------------------------------------------ bots

    private int effBid() { return king >= 0 ? bid : Math.max(minBid, highBid + 10); }

    @Override
    public double evalDeal(Deal d, int seat) {
        double k = 0, b = 0;
        int tk = 0;
        for (int s = 0; s < n; s++) {
            if (side(s) == 0) { k += d.points[s]; tk += d.tricks[s]; } else b += d.points[s];
        }
        if (d.mode.type == Mode.HINDERSI) { k = tk == 0 ? 257 : 0; b = tk == 0 ? 0 : 257; }
        else if (tk == d.totalTricks) k += 100;
        else if (tk == 0) b += 100;
        double v = k / effBid() - b / 1000.0;
        return (side(seat) == 0 ? v : -v) * 1000;
    }

    @Override
    public int desire(Deal d, int seat) { return d.mode.type == Mode.HINDERSI ? -1 : 1; }

    /** Cards worth keeping in a mode (for discarding): trumps, masters; points that are lost anyway go away. */
    private double keepValue(List<Integer> hand, int c, Mode m) {
        int s = Cards.suit(c), r = Cards.rank(c);
        if (m.type == Mode.HINDERSI) return -m.strength(c, 0);
        if (m.trumpSuit() == s) return 200 + Cards.TRUMP_STRENGTH[r];
        int higher = 0;
        for (int x = 0; x < 9; x++) {
            int id = Cards.id(s, x);
            if (m.strength(id, 0) > m.strength(c, 0) && !hand.contains(id)) higher++;
        }
        if (higher == 0) return 100 + m.points(c);
        return 50 - higher * 10 - m.points(c) * 2;
    }

    private List<Integer> pickDiscards(List<Integer> hand, Mode m, int count) {
        List<Integer> h = new ArrayList<>(hand);
        final Mode mm = m;
        final List<Integer> fh = hand;
        Collections.sort(h, new Comparator<Integer>() {
            @Override public int compare(Integer a, Integer b) { return Double.compare(keepValue(fh, a, mm), keepValue(fh, b, mm)); }
        });
        return new ArrayList<>(h.subList(0, count));
    }

    private double modeValue(int seat, Mode m, List<Integer> dis, int samples) {
        Deal base = deal.copy();
        base.hands[seat].removeAll(dis);
        int dp = 0;
        for (int c : dis) dp += m.points(c);
        double v = Bot.estimate(this, base, seat, m, seat, samples, rng);
        return v + (m.type == Mode.HINDERSI ? 0 : dp * 1000.0 / effBid());
    }

    private void planMode(int seat, int level, boolean withDiscard) {
        int count = withDiscard ? deal.hands[seat].size() - (n == 3 ? 10 : 8) : 0;
        double best = -1e18;
        Mode bm = null;
        List<Integer> bd = new ArrayList<>();
        for (String k : modeOptions()) {
            Mode m = Mode.parse(k);
            List<Integer> dis = withDiscard ? pickDiscards(deal.hands[seat], m, count) : new ArrayList<Integer>();
            double v = modeValue(seat, m, dis, Bot.samplesFor(level));
            if (level == 0) v += rng.nextGaussian() * 30;
            if (v > best) { best = v; bm = m; bd = dis; }
        }
        botPlan = bm;
        if (withDiscard) discard(bd);
    }

    @Override
    protected void botOther(int seat, int level) {
        switch (step) {
            case "bid": {
                hypoKing = seat;
                double e = 0;
                int samples = Bot.samplesFor(level);
                for (String k : modeOptions()) {
                    if ("hindersi".equals(k)) continue;
                    Mode m = Mode.parse(k);
                    double pts = 0;
                    for (int i = 0; i < samples; i++) {
                        Deal w = Bot.sampleWorld(deal, seat, rng);
                        w.mode = m.copy();
                        w.start(seat, w.hands[seat].size());
                        Bot.rollout(this, w);
                        pts += w.points[seat];
                    }
                    e = Math.max(e, pts / samples);
                }
                hypoKing = -1;
                for (int c : tableUp) e += Cards.PLAIN_PTS[Cards.rank(c)] * 0.5;
                e += tableUp.size() * 2 + tableDown.size() * 3;
                double share = n == 3 ? 52 : n == 4 ? 39 : 63;
                double kavg = (e * 1.6 + share * 8) / 9.6; // game 1 strong, later games average
                double fair = 1000 * kavg / Math.max(20, 157 - kavg);
                if (level == 0) fair *= 0.85 + rng.nextDouble() * 0.3;
                int max = (int) (fair * 1.12 / 10) * 10;
                int need = highBidder < 0 ? minBid : highBid + 10;
                if (max >= need) doBid(seat, need); else doPass(seat);
                break;
            }
            case "discard":
                planMode(seat, level, true);
                break;
            case "trump":
                if (botPlan == null) planMode(seat, level, false);
                Mode m = botPlan;
                botPlan = null;
                chooseMode(m);
                break;
            case "callCard": {
                Mode md = deal.mode;
                int pick = -1;
                double best = -1;
                for (int c = 0; c < 36; c++) {
                    if (deal.hands[king].contains(c) || c == Cards.id(0, Cards.R7)) continue;
                    double v = md.trumpSuit() == Cards.suit(c) ? 100 + Cards.TRUMP_STRENGTH[Cards.rank(c)] : md.strength(c, 0) + md.points(c) / 20.0;
                    if (v > best) { best = v; pick = c; }
                }
                callCard(pick);
                break;
            }
            case "decline":
                beginPlay(deal.mode, (dealer + 1) % n, deal.hands[0].size());
                break;
            default:
                break;
        }
    }

    // ------------------------------------------------------------------ view

    @Override
    protected boolean pointsVisible(int seat, List<Integer> mine) { return mine.contains(seat); }

    @Override
    protected void fill(Map<String, Object> gm, List<Integer> mine) {
        super.fill(gm, mine);
        List<Object> to = new ArrayList<>();
        for (int s = 0; s < n; s++) {
            int t = team(s);
            if (s == partner && !partnerRevealed && !mine.contains(partner)) t = 1;
            to.add(t);
        }
        gm.put("teamOf", to);
        gm.put("king", king);
        gm.put("partner", partnerRevealed || mine.contains(partner) ? partner : -1);
        gm.put("calledCard", calledCard);
        gm.put("bid", bid);
        gm.put("highBid", highBid);
        gm.put("highBidder", highBidder);
        gm.put("minBid", minBid);
        if (out != null) gm.put("out", out);
        gm.put("targets", new long[]{king >= 0 ? bid : 0, 1000});
        gm.put("tableUp", Cards.toArray(tableUp));
        gm.put("tableDown", tableDown.size());
        if (mine.contains(king)) gm.put("discards", Cards.toArray(discards));
        if (mine.contains(actor)) {
            Map<String, Object> pr = new LinkedHashMap<>();
            switch (step) {
                case "bid":
                    pr.put("type", "auction");
                    pr.put("min", highBidder < 0 ? minBid : highBid + 10);
                    break;
                case "discard":
                    pr.put("type", "discard");
                    pr.put("count", deal.hands[actor].size() - (n == 3 ? 10 : 8));
                    break;
                case "trump":
                    pr.put("type", "trump");
                    pr.put("options", modeOptions());
                    pr.put("canPush", false);
                    break;
                case "callCard":
                    pr.put("type", "callCard");
                    break;
                case "decline":
                    pr.put("type", "decline");
                    break;
                default:
                    pr = null;
            }
            if (pr != null) gm.put("prompt", pr);
        }
    }
}
