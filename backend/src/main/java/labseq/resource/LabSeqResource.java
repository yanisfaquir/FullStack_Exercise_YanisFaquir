package labseq.resource;

import labseq.model.LabSeqResponse;
import labseq.service.LabSeqService;
import labseq.exception.InvalidIndexException;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.logging.Logger;

import java.math.BigInteger;


@Path("/labseq")
@Tag(name = "LabSeq", description = "LabSeq sequence calculation endpoints")
public class LabSeqResource {

    private static final Logger LOG = Logger.getLogger(LabSeqResource.class);

    @Inject
    LabSeqService labSeqService;


    @GET
    @Path("/{n}")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(
        summary = "Get LabSeq value",
        description = "Calculates and returns the value of the LabSeq sequence at the given index. " +
                     "Uses caching to improve performance for repeated calculations. " +
                     "Formula: l(n) = l(n-4) + l(n-3) for n > 3"
    )
    @APIResponses(value = {
        @APIResponse(
            responseCode = "200",
            description = "Successfully calculated the LabSeq value",
            content = @Content(
                mediaType = MediaType.APPLICATION_JSON,
                schema = @Schema(implementation = LabSeqResponse.class)
            )
        ),
        @APIResponse(
            responseCode = "400",
            description = "Invalid index provided (must be non-negative integer)"
        ),
        @APIResponse(
            responseCode = "500",
            description = "Internal server error"
        )
    })
    public Response getLabSeq(
        @Parameter(
            description = "The index (n) in the LabSeq sequence. Must be a non-negative integer.",
            required = true,
            example = "10"
        )
        @PathParam("n") int n
    ) {
        LOG.infof("Received request for LabSeq with n=%d", n);

        try {
            long startTime = System.currentTimeMillis();
            
            // Delega o cálculo para o Service
            BigInteger value = labSeqService.calculate(n);
            
            long endTime = System.currentTimeMillis();
            long calculationTime = endTime - startTime;

            // Determina se usou iterativo (para informação)
            boolean usedIterative = labSeqService.shouldUseIterative(n);

            // Cria response
            LabSeqResponse response = new LabSeqResponse(
                n,
                value,
                calculationTime,
                calculationTime < 5 && !usedIterative // Heurística: cache hit
            );

            LOG.infof("LabSeq(%d) calculated in %dms (method: %s)", 
                n, calculationTime, usedIterative ? "iterative" : "recursive+cache");

            return Response.ok(response).build();

        } catch (InvalidIndexException e) {
            LOG.warnf("Invalid request: %s", e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                .entity("{\"error\":\"" + e.getMessage() + "\"}")
                .build();
        } catch (Exception e) {
            LOG.errorf(e, "Error calculating LabSeq for n=%d", n);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("{\"error\":\"Internal server error\"}")
                .build();
        }
    }


    @GET
    @Path("/health")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(
        summary = "Health check",
        description = "Simple health check endpoint to verify the service is running"
    )
    @APIResponse(
        responseCode = "200",
        description = "Service is healthy"
    )
    public Response health() {
        return Response.ok()
            .entity("{\"status\":\"UP\",\"service\":\"LabSeq API\"}")
            .build();
    }
}