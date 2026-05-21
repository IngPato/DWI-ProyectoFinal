/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.security;

import java.security.SecureRandom;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class PasswordGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();

    private static final String MAYUSCULAS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String MINUSCULAS = "abcdefghijklmnopqrstuvwxyz";
    private static final String NUMEROS = "0123456789";
    private static final String ESPECIALES = "@#$%&*!";
    private static final String TODO = MAYUSCULAS + MINUSCULAS + NUMEROS + ESPECIALES;

    public static String generarPassword(int longitud) {
        if (longitud < 8) {
            throw new IllegalArgumentException("La contraseña debe tener mínimo 8 caracteres");
        }

        String password
                = "" + getRandomChar(MAYUSCULAS)
                + getRandomChar(MINUSCULAS)
                + getRandomChar(NUMEROS)
                + getRandomChar(ESPECIALES);

        for (int i = 4; i < longitud; i++) {
            password += getRandomChar(TODO);
        }

        List<Character> caracteres = password.chars()
                .mapToObj(c -> (char) c)
                .collect(Collectors.toList());

        Collections.shuffle(caracteres, RANDOM);

        return caracteres.stream()
                .map(String::valueOf)
                .collect(Collectors.joining());
    }

    private static char getRandomChar(String caracteres) {
        return caracteres.charAt(RANDOM.nextInt(caracteres.length()));
    }
}
