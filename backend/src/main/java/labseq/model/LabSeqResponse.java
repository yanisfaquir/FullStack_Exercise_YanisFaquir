package labseq.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

import java.math.BigInteger;

@Schema(description = "Response object containing the LabSeq sequence value")
public class LabSeqResponse {

    @JsonProperty("index")
    @Schema(description = "The index (n) in the sequence", example = "10")
    private int index;

    @JsonProperty("value")
    @Schema(description = "The calculated value at the given index", example = "2")
    private BigInteger value;

    @JsonProperty("calculationTimeMs")
    @Schema(description = "Time taken to calculate the value in milliseconds", example = "5")
    private long calculationTimeMs;

    @JsonProperty("fromCache")
    @Schema(description = "Whether the value was retrieved from cache", example = "false")
    private boolean fromCache;

    public LabSeqResponse() {
    }

    public LabSeqResponse(int index, BigInteger value, long calculationTimeMs, boolean fromCache) {
        this.index = index;
        this.value = value;
        this.calculationTimeMs = calculationTimeMs;
        this.fromCache = fromCache;
    }

    // Getters and Setters
    public int getIndex() {
        return index;
    }

    public void setIndex(int index) {
        this.index = index;
    }

    public BigInteger getValue() {
        return value;
    }

    public void setValue(BigInteger value) {
        this.value = value;
    }

    public long getCalculationTimeMs() {
        return calculationTimeMs;
    }

    public void setCalculationTimeMs(long calculationTimeMs) {
        this.calculationTimeMs = calculationTimeMs;
    }

    public boolean isFromCache() {
        return fromCache;
    }

    public void setFromCache(boolean fromCache) {
        this.fromCache = fromCache;
    }

    @Override
    public String toString() {
        return "LabSeqResponse{" +
                "index=" + index +
                ", value=" + value +
                ", calculationTimeMs=" + calculationTimeMs +
                ", fromCache=" + fromCache +
                '}';
    }
}