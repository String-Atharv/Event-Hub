package com.atharv.Event_Ticket_Platform.util;

import java.util.Random;

public class generatePublicQrCode {
    private static final String ALPHA_NUMERIC_STRING = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuv";

    public static String generate(int length) {
        StringBuilder builder = new StringBuilder(length);
        Random random = new Random();
        for (int i = 0; i < length; i++) {
            int characterIndex = random.nextInt(ALPHA_NUMERIC_STRING.length());
            builder.append(ALPHA_NUMERIC_STRING.charAt(characterIndex));
        }
        return builder.toString();
    }
}

