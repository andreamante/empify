package com.place.app.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

@ApplicationScoped
public class IdentityService {
    @Inject
    JsonWebToken jwt;

    public long currentUserId() {
        try {
            return Long.parseLong(jwt.getSubject());
        } catch (NumberFormatException | NullPointerException exception) {
            throw new WebApplicationException("Invalid access token", Response.Status.UNAUTHORIZED);
        }
    }
}
