package com.place.app.dto;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PasswordValidationTest {
    private static ValidatorFactory validatorFactory;
    private static Validator validator;

    @BeforeAll
    static void setUp() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validator = validatorFactory.getValidator();
    }

    @AfterAll
    static void tearDown() {
        validatorFactory.close();
    }

    @Test
    void registrationAcceptsSixCharactersAndRejectsFive() {
        assertTrue(validator.validate(new RegisterRequest("Andrea", "andrea@example.com", "abc123")).isEmpty());
        assertFalse(validator.validate(new RegisterRequest("Andrea", "andrea@example.com", "abc12")).isEmpty());
    }

    @Test
    void loginRequiresAtLeastSixCharacters() {
        assertTrue(validator.validate(new LoginRequest("andrea@example.com", "abc123")).isEmpty());
        assertFalse(validator.validate(new LoginRequest("andrea@example.com", "abc12")).isEmpty());
    }
}
