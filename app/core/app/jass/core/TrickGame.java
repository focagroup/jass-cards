package app.jass.core;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

/** Shared trick-taking machinery: dealing, legal play, Weis and Stöck, the table view, bot play. */
public abstract class TrickGame extends Match {
    protected Deal deal;
    protected boolean weisOn, stoeckOn;
    protected List<Weis.Item>[] declared;
    protected boolean[] declDone;
    protected int stoeckSeat = -1;
    protected boolean stoeckCalled;
    protected int firstLeader;
    protected Map<String, Object> weisShow;
    private int moveSeq;
    protected Map<String, Object> lastMove;
    /** Card shown to everybody (e.g. the Bodentrumpf), or -1. */
    protected int shownCard = -1;

    protected TrickGame(Config cfg, Random rng) { super(cfg, rng); }

    // ------------------------------------------------------------------ hooks

    /** Side for partner logic in bots: team in team games, else the seat. */
    public int side(int seat) { return team(seat); }

    /** Objective of a finished (simulated) deal for a seat; higher is better. */
    public abstract double evalDeal(Deal d, int seat);

    /** +1: wants points/tricks right now, -1: wants to avoid them. */
    public int desire(Deal d, int seat) { return 1; }

    protected void onStoeck(int seat) {}
    protected void onWeis(int team, int pts) {}
    /** Called after each completed trick (deal.lastWinner etc. are set). */
    protected void onTrick() {}
    /** Called once all tricks are played. */
    protected abstract void onDealDone();
    protected abstract String actOther(int seat, String action, Map<String, String> p);
    /** Bot action for steps other than play. */
    protected abstract void botOther(int seat, int level);

    // ------------------------------------------------------------------ dealing

    @SuppressWarnings("unchecked")
    protected void newDeal() {
        deal = new Deal(n);
        declared = new List[n];
        for (int i = 0; i < n; i++) declared[i] = new ArrayList<>();
        declDone = new boolean[n];
        stoeckSeat = -1;
        stoeckCalled = false;
        weisShow = null;
        lastMove = null;
        shownCard = -1;
    }

    /** Deals `per` cards to everyone, starting right of the dealer; the dealer gets the last card. */
    protected void dealOut(List<Integer> deck, int per) {
        for (int j = 0; j < per * n; j++) deal.hands[(dealer + 1 + j) % n].add(deck.get(j));
    }

    protected void beginPlay(Mode mode, int leader, int tricks) {
        deal.mode = mode;
        deal.start(leader, tricks);
        firstLeader = leader;
        step = PLAY;
        actor = leader;
        if (stoeckOn && mode.type == Mode.TRUMP) {
            int o = Cards.id(mode.suit, Cards.OBER), k = Cards.id(mode.suit, Cards.KOENIG);
            for (int s = 0; s < n; s++) if (deal.hands[s].contains(o) && deal.hands[s].contains(k)) stoeckSeat = s;
        }
    }

    // ------------------------------------------------------------------ actions

    @Override
    public String act(int seat, String action, Map<String, String> p) {
        if ("play".equals(action)) return playCard(seat, Room.parseInt(p.get("card"), -1), p.get("weis"));
        return actOther(seat, action, p);
    }

    protected List<Weis.Item> weisOffer(int seat) {
        if (!weisOn || deal == null || deal.trickNo > 0 || declDone[seat]) return null;
        return Weis.find(deal.hands[seat]);
    }

    protected String playCard(int seat, int card, String weisSel) {
        if (!PLAY.equals(step)) return "bad_step";
        if (seat != deal.turn) return "not_your_turn";
        if (!deal.hands[seat].contains(card) || !deal.isLegal(seat, card)) return "illegal_card";
        List<Weis.Item> offer = weisOffer(seat);
        if (offer != null) {
            List<Weis.Item> chosen = new ArrayList<>();
            if ("all".equals(weisSel)) chosen.addAll(offer);
            else for (int i : Cards.parseList(weisSel))
                if (i >= 0 && i < offer.size() && !chosen.contains(offer.get(i))) chosen.add(offer.get(i));
            declared[seat] = chosen;
            declDone[seat] = true;
            if (!chosen.isEmpty()) event("weis", "seat", seat, "pts", Weis.sum(chosen));
        }
        if (stoeckOn && seat == stoeckSeat && !stoeckCalled) {
            int t = deal.mode.suit;
            int o = Cards.id(t, Cards.OBER), k = Cards.id(t, Cards.KOENIG);
            if ((card == o && deal.played[k]) || (card == k && deal.played[o])) {
                stoeckCalled = true;
                event("stoeck", "seat", seat);
                onStoeck(seat);
            }
        }
        int trumpBefore = deal.mode.trumpSuit();
        boolean trickDone = deal.play(card);
        if (deal.molotow && trumpBefore < 0 && deal.mode.suit >= 0) event("molotowTrump", "seat", seat, "suit", deal.mode.suit);
        Map<String, Object> mv = new LinkedHashMap<>();
        mv.put("seq", ++moveSeq);
        mv.put("seat", seat);
        mv.put("card", card);
        mv.put("trickDone", trickDone);
        lastMove = mv;
        delayHint = trickDone ? 1500 : 0;
        if (trickDone) {
            if (deal.trickNo == 1 && weisOn) resolveWeis();
            onTrick();
            if (PLAY.equals(step) && deal.done()) onDealDone();
        }
        if (PLAY.equals(step)) actor = deal.turn;
        return null;
    }

    /** Standard Weis rule: only the side with the best Weis writes, but then all of its Weis. */
    protected void resolveWeis() {
        int bestSeat = -1;
        Weis.Item best = null;
        for (int k = 0; k < n; k++) {
            int s = (firstLeader + k) % n;
            Weis.Item b = Weis.best(declared[s], deal.mode);
            if (b != null && (best == null || Weis.compare(b, best, deal.mode) > 0)) { best = b; bestSeat = s; }
        }
        Map<String, Object> show = new LinkedHashMap<>();
        List<Object> per = new ArrayList<>();
        for (int s = 0; s < n; s++) {
            List<Object> items = new ArrayList<>();
            for (Weis.Item it : declared[s]) items.add(it.toMap());
            per.add(items);
        }
        show.put("seats", per);
        show.put("best", bestSeat);
        if (bestSeat >= 0) {
            int tm = team(bestSeat);
            int pts = 0;
            for (int s = 0; s < n; s++) if (team(s) == tm) pts += Weis.sum(declared[s]);
            show.put("pts", pts);
            onWeis(tm, pts);
        }
        weisShow = show;
    }

    // ------------------------------------------------------------------ bots

    @Override
    public void bot(int seat, int level) {
        if (PLAY.equals(step)) {
            int c = Bot.chooseCard(this, deal, seat, level, rng);
            playCard(seat, c, "all");
        } else {
            botOther(seat, level);
        }
    }

    // ------------------------------------------------------------------ view

    protected static List<Object> pairs(int[] cards, int[] seats, int len) {
        List<Object> l = new ArrayList<>();
        for (int i = 0; i < len; i++) l.add(new int[]{seats[i], cards[i]});
        return l;
    }

    protected Map<String, Object> modeMap(Mode m) {
        if (m == null) return null;
        Map<String, Object> o = new LinkedHashMap<>();
        o.put("key", m.key());
        o.put("type", m.type);
        o.put("suit", m.trumpSuit());
        o.put("misere", m.misere);
        return o;
    }

    /** Whether this viewer may see the card points of a seat during play. */
    protected boolean pointsVisible(int seat, List<Integer> mine) {
        for (int m : mine) if (side(m) == side(seat)) return true;
        return false;
    }

    @Override
    protected void fill(Map<String, Object> gm, List<Integer> mine) {
        gm.put("kind", "trick");
        Map<String, Object> hands = new LinkedHashMap<>();
        List<Object> counts = new ArrayList<>();
        for (int i = 0; i < n; i++) counts.add(deal == null ? 0 : deal.hands[i].size());
        gm.put("handCounts", counts);
        if (deal == null) { gm.put("hands", hands); return; }
        for (int s : mine) hands.put(String.valueOf(s), Cards.toArray(deal.hands[s]));
        gm.put("hands", hands);
        gm.put("mode", modeMap(deal.mode));
        gm.put("trick", pairs(deal.trickCards, deal.trickSeats, deal.trickSize));
        gm.put("trickNo", deal.trickNo);
        gm.put("totalTricks", deal.totalTricks);
        gm.put("tricks", list(deal.tricks));
        gm.put("shown", shownCard);
        if (deal.lastWinner >= 0) {
            Map<String, Object> lt = new LinkedHashMap<>();
            lt.put("cards", pairs(deal.lastTrickCards, deal.lastTrickSeats, deal.lastTrickCards.length));
            lt.put("winner", deal.lastWinner);
            lt.put("pts", deal.lastTrickPoints);
            lt.put("no", deal.trickNo);
            gm.put("lastTrick", lt);
        }
        if (lastMove != null) gm.put("lastMove", lastMove);
        Map<String, Object> pts = new LinkedHashMap<>();
        for (int s = 0; s < n; s++) if (pointsVisible(s, mine)) pts.put(String.valueOf(s), deal.points[s]);
        gm.put("points", pts);
        if (weisShow != null) gm.put("weisShow", weisShow);
        if (stoeckCalled) gm.put("stoeck", stoeckSeat);
        if (PLAY.equals(step) && mine.contains(deal.turn)) {
            gm.put("legal", Cards.toArray(deal.legal(deal.turn)));
            List<Weis.Item> offer = weisOffer(deal.turn);
            if (offer != null && !offer.isEmpty()) {
                List<Object> wl = new ArrayList<>();
                for (Weis.Item it : offer) wl.add(it.toMap());
                gm.put("weisOffer", wl);
            }
        }
    }
}
