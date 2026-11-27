package com.place.app.web;

import com.place.app.dto.AuthResponse;
import com.place.app.dto.LoginRequest;
import com.place.app.dto.RefreshRequest;
import com.place.app.dto.RegisterRequest;
import com.place.app.dto.UserResponse;
import com.place.app.service.AuthService;
import com.place.app.service.IdentityService;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;

@Path("/api/auth")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class AuthResource {
    @Inject
    AuthService authService;

    @Inject
    IdentityService identityService;

    @POST
    @Path("/register")
    @PermitAll
    @Operation(summary = "Register a user and create a session")
    public Response register(@Valid RegisterRequest request, @Context HttpHeaders headers) {
        AuthResponse response = authService.register(
                request.username(), request.email(), request.password(), headers.getHeaderString("User-Agent"));
        return Response.status(Response.Status.CREATED).entity(response).build();
    }

    @POST
    @Path("/login")
    @PermitAll
    @Operation(summary = "Authenticate a user")
    public AuthResponse login(@Valid LoginRequest request, @Context HttpHeaders headers) {
        return authService.login(
                request.email(), request.password(), headers.getHeaderString("User-Agent"));
    }

    @POST
    @Path("/refresh")
    @PermitAll
    @Operation(summary = "Rotate a refresh token")
    public AuthResponse refresh(@Valid RefreshRequest request) {
        return authService.refresh(request.refreshToken());
    }

    @POST
    @Path("/logout")
    @RolesAllowed("user")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Revoke a refresh token")
    public Response logout() {
        authService.logout(identityService.currentUserId());
        return Response.noContent().build();
    }

    @GET
    @Path("/me")
    @RolesAllowed("user")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Get the authenticated user")
    public UserResponse me() {
        return authService.getUser(identityService.currentUserId());
    }
}
