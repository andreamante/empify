package com.place.app.web;

import com.place.app.dto.CreatePlaylistRequest;
import com.place.app.dto.PlaylistResponse;
import com.place.app.dto.AddPlaylistTrackRequest;
import com.place.app.service.IdentityService;
import com.place.app.service.PlaylistService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;

import java.util.List;

@Path("/api/playlists")
@RolesAllowed("user")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@SecurityRequirement(name = "BearerAuth")
public class PlaylistResource {
    @Inject
    PlaylistService playlistService;

    @Inject
    IdentityService identityService;

    @GET
    @Operation(summary = "List the authenticated user's playlists")
    public List<PlaylistResponse> list() {
        return playlistService.list(identityService.currentUserId());
    }

    @POST
    @Operation(summary = "Create a playlist")
    public Response create(@Valid CreatePlaylistRequest request) {
        PlaylistResponse created = playlistService.create(
                identityService.currentUserId(), request.name(), request.description());
        return Response.status(Response.Status.CREATED).entity(created).build();
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get a playlist and its tracks")
    public PlaylistResponse get(@PathParam("id") String id) {
        return playlistService.get(identityService.currentUserId(), parseId(id));
    }

    @DELETE
    @Path("/{id}")
    @Operation(summary = "Delete a playlist")
    public Response delete(@PathParam("id") String id) {
        playlistService.delete(identityService.currentUserId(), parseId(id));
        return Response.noContent().build();
    }

    @POST
    @Path("/{id}/tracks")
    @Operation(summary = "Add one of the user's tracks to a playlist")
    public Response addTrack(@PathParam("id") String id, @Valid AddPlaylistTrackRequest request) {
        playlistService.addTrack(
                identityService.currentUserId(),
                parseId(id),
                parseId(request.trackId()),
                request.position());
        return Response.noContent().build();
    }

    @DELETE
    @Path("/{id}/tracks/{trackId}")
    @Operation(summary = "Remove a track from a playlist")
    public Response removeTrack(@PathParam("id") String id, @PathParam("trackId") String trackId) {
        playlistService.removeTrack(
                identityService.currentUserId(), parseId(id), parseId(trackId));
        return Response.noContent().build();
    }

    private static long parseId(String id) {
        try {
            long parsed = Long.parseLong(id);
            if (parsed <= 0) {
                throw new NumberFormatException("ID must be positive");
            }
            return parsed;
        } catch (NumberFormatException exception) {
            throw new jakarta.ws.rs.BadRequestException("ID must be a positive integer", exception);
        }
    }
}
