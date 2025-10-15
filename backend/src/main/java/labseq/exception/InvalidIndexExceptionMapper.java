package labseq.exception;

import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

import java.util.HashMap;
import java.util.Map;

@Provider
public class InvalidIndexExceptionMapper implements ExceptionMapper<InvalidIndexException> {

    @Override
    public Response toResponse(InvalidIndexException exception) {
        Map<String, Object> error = new HashMap<>();
        error.put("error", "Invalid Index");
        error.put("message", exception.getMessage());
        error.put("status", 400);

        return Response
                .status(Response.Status.BAD_REQUEST)
                .entity(error)
                .build();
    }
}