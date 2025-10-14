package labseq.resource;

import labseq.model.LabSeqResponse;
import labseq.service.LabSeqService;
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
    
    
    private static final int RECURSIVE_THRESHOLD = 1000;

    @Inject
    LabSeqService labSeqService;

    @GET
    @Path("/{n}")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(
        summary = "Get LabSeq value",
        description = "Calculates and returns the value of the LabSeq sequence at the given index. " +
                     "Uses caching to improve performance for repeated calculations. " +
                     "Automatically switches to iterative method for large values (n > 5000)."
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

        long startTime = System.currentTimeMillis();
        
        BigInteger value;
        boolean usedIterative = false;
        
        // Escolhe método baseado no tamanho de n
        if (n > RECURSIVE_THRESHOLD) {
            LOG.infof("Using iterative method for large n=%d", n);
            value = labSeqService.calculateIterative(n);
            usedIterative = true;
        } else {
            // Para valores pequenos, usa recursão com cache
            value = labSeqService.calculate(n);
        }
        
        long endTime = System.currentTimeMillis();
        long calculationTime = endTime - startTime;

        // Create response
        LabSeqResponse response = new LabSeqResponse(
            n,
            value,
            calculationTime,
            calculationTime < 5 && !usedIterative // Heuristic: if calculated in < 5ms and not iterative, likely from cache
        );

        LOG.infof("LabSeq(%d) = %s (calculated in %dms, method: %s)", 
            n, value, calculationTime, usedIterative ? "iterative" : "recursive+cache");

        return Response.ok(response).build();
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