package com.place.app.web;

import com.place.app.dto.ApiError;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class WebApplicationExceptionMapper implements ExceptionMapper<WebApplicationException> {
    @Override
    public Response toResponse(WebApplicationException exception) {
        int status = exception.getResponse().getStatus();
        String message = exception.getMessage();
        if (message == null || message.isBlank()) {
            message = Response.Status.fromStatusCode(status) == null
                    ? "Request failed"
                    : Response.Status.fromStatusCode(status).getReasonPhrase();
        }
        return Response.status(status)
                .type(MediaType.APPLICATION_JSON)
                .entity(new ApiError(message))
                .build();
    }
}
