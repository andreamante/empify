package com.place.app.web;

import com.place.app.dto.TrackResponse;
import com.place.app.service.ByteRange;
import com.place.app.service.IdentityService;
import com.place.app.service.TrackService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;
import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.util.Arrays;
import java.util.List;

@Path("/api/tracks")
@RolesAllowed("user")
@SecurityRequirement(name = "BearerAuth")
public class TrackResource {
    @Inject
    TrackService trackService;

    @Inject
    IdentityService identityService;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "List the authenticated user's tracks")
    public List<TrackResponse> list() {
        return trackService.list(identityService.currentUserId());
    }

    @POST
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Upload an audio track")
    public Response upload(
            @RestForm("file") FileUpload file,
            @RestForm("title") String title,
            @RestForm("artist") String artist,
            @RestForm("album") String album) {
        TrackResponse response = trackService.upload(identityService.currentUserId(), file, title, artist, album);
        return Response.status(Response.Status.CREATED).entity(response).build();
    }

    @DELETE
    @Path("/{id}")
    @Operation(summary = "Delete one of the authenticated user's tracks")
    public Response delete(@PathParam("id") String id) {
        trackService.delete(identityService.currentUserId(), parseId(id));
        return Response.noContent().build();
    }

    @PATCH
    @Path("/{id}/favorite")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Toggle a track's favorite state")
    public TrackResponse toggleFavorite(@PathParam("id") String id) {
        return trackService.toggleFavorite(identityService.currentUserId(), parseId(id));
    }

    @GET
    @Path("/{id}/stream")
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    @Operation(summary = "Stream audio and support byte range requests")
    public Response stream(@PathParam("id") String id, @Context HttpHeaders headers) {
        TrackService.AudioData audio = trackService.stream(identityService.currentUserId(), parseId(id));
        byte[] data = audio.data();
        String rangeHeader = headers.getHeaderString("Range");
        if (rangeHeader == null) {
            return Response.ok(data, audio.mimeType())
                    .header("Accept-Ranges", "bytes")
                    .header("Content-Length", data.length)
                    .build();
        }

        ByteRange range;
        try {
            range = ByteRange.parse(rangeHeader, data.length);
        } catch (IllegalArgumentException exception) {
            return Response.status(Response.Status.REQUESTED_RANGE_NOT_SATISFIABLE)
                    .header("Content-Range", "bytes */" + data.length)
                    .header("Accept-Ranges", "bytes")
                    .build();
        }

        byte[] partial = Arrays.copyOfRange(data, Math.toIntExact(range.start()), Math.toIntExact(range.end() + 1));
        return Response.status(Response.Status.PARTIAL_CONTENT)
                .type(audio.mimeType())
                .entity(partial)
                .header("Accept-Ranges", "bytes")
                .header("Content-Range", "bytes " + range.start() + "-" + range.end() + "/" + data.length)
                .header("Content-Length", partial.length)
                .build();
    }

    @GET
    @Path("/{id}/cover")
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    @Operation(summary = "Get a track cover")
    public Response cover(@PathParam("id") String id) {
        TrackService.AudioData cover = trackService.cover(identityService.currentUserId(), parseId(id));
        return Response.ok(cover.data(), cover.mimeType())
                .header("Content-Length", cover.data().length)
                .build();
    }

    private static long parseId(String id) {
        try {
            long parsed = Long.parseLong(id);
            if (parsed <= 0) {
                throw new NumberFormatException("ID must be positive");
            }
            return parsed;
        } catch (NumberFormatException exception) {
            throw new jakarta.ws.rs.BadRequestException("Track ID must be a positive integer", exception);
        }
    }
}
