package labseq.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

import java.math.BigInteger;

@Schema(description = "Response containing the LabSeq calculation result")
public class LabSeqResponse {

    @Schema(description = "The index n requested", example = "5000")
    @JsonProperty("n")
    private int n;

    @Schema(description = "The calculated LabSeq value as string (preserves precision for large numbers)", 
            example = "123456789012345678901234567890")
    @JsonProperty("value")
    private String value; 

    @Schema(description = "Calculation time in milliseconds", example = "45")
    @JsonProperty("calculationTime")
    private long calculationTime;

    @Schema(description = "Whether the value was retrieved from cache", example = "true")
    @JsonProperty("fromCache")
    private boolean fromCache;

    @Schema(description = "Number of digits in the result", example = "1523")
    @JsonProperty("digits")
    private int digits; 


    public LabSeqResponse() {}


    public LabSeqResponse(int n, BigInteger value, long calculationTime, boolean fromCache) {
        this.n = n;
        this.value = value.toString(); 
        this.calculationTime = calculationTime;
        this.fromCache = fromCache;
        this.digits = value.toString().length(); 
    }

    // Getters e Setters
    public int getN() {
        return n;
    }

    public void setN(int n) {
        this.n = n;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
        this.digits = value != null ? value.length() : 0;
    }

    public long getCalculationTime() {
        return calculationTime;
    }

    public void setCalculationTime(long calculationTime) {
        this.calculationTime = calculationTime;
    }

    public boolean isFromCache() {
        return fromCache;
    }

    public void setFromCache(boolean fromCache) {
        this.fromCache = fromCache;
    }

    public int getDigits() {
        return digits;
    }

    public void setDigits(int digits) {
        this.digits = digits;
    }

    @Override
    public String toString() {
        return String.format("LabSeqResponse{n=%d, value='%s...', digits=%d, calculationTime=%dms, fromCache=%s}",
                n, 
                value.length() > 50 ? value.substring(0, 50) : value,
                digits,
                calculationTime, 
                fromCache);
    }
}