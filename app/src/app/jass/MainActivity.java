package app.jass;

import android.graphics.Color;

import java.util.UUID;

import app.cards.android.CardsActivity;
import app.cards.core.GameInfo;
import app.jass.core.Room;

/** Jass on the cards framework: everything but the game's identity lives in {@link CardsActivity}. */
public class MainActivity extends CardsActivity {
    /** Unique per game, so a Jass guest never connects to another game's host. */
    private static final UUID BT_SERVICE = UUID.fromString("3e9a7c14-62b5-4d08-b1f3-8c45d0e2a976");

    @Override protected GameInfo info() { return Room.INFO; }

    @Override protected Room createRoom() { return new Room(); }

    @Override protected UUID bluetoothService() { return BT_SERVICE; }

    @Override protected int pageColor() { return Color.rgb(122, 20, 28); }

    @Override protected int frameColor() { return Color.rgb(74, 10, 16); }

    @Override protected String exitQuestion() { return "Jass beenden? / Exit?"; }
}
