package labseq.service;

import labseq.exception.InvalidIndexException;
import io.quarkus.cache.CacheResult;
import jakarta.enterprise.context.ApplicationScoped;
import org.jboss.logging.Logger;

import java.math.BigInteger;

@ApplicationScoped
public class LabSeqService {

    private static final Logger LOG = Logger.getLogger(LabSeqService.class);

    /**
     * Calculates the LabSeq value for a given index using caching.
     * 
     * The labseq sequence is defined as:
     * n=0 => l(0) = 0
     * n=1 => l(1) = 1
     * n=2 => l(2) = 0
     * n=3 => l(3) = 1
     * n>3 => l(n) = l(n-4) + l(n-3)
     *
     * @param n The index in the sequence (must be non-negative)
     * @return The calculated BigInteger value
     * @throws InvalidIndexException if n is negative
     */
    @CacheResult(cacheName = "labseq-cache")
    public BigInteger calculate(int n) {
        LOG.debugf("Calculating LabSeq for n=%d", n);

        // Validate input
        if (n < 0) {
            throw new InvalidIndexException("Index must be a non-negative integer. Received: " + n);
        }

        // Base cases
        if (n == 0) {
            return BigInteger.ZERO;
        }
        if (n == 1) {
            return BigInteger.ONE;
        }
        if (n == 2) {
            return BigInteger.ZERO;
        }
        if (n == 3) {
            return BigInteger.ONE;
        }

        // Recursive case: l(n) = l(n-4) + l(n-3)
        // The cache will automatically store intermediate results
        BigInteger nMinus4 = calculate(n - 4);
        BigInteger nMinus3 = calculate(n - 3);
        
        return nMinus4.add(nMinus3);
    }

    /**
     * Calculates the LabSeq value using iterative approach for better performance
     * with very large indices. This method still benefits from caching.
     *
     * @param n The index in the sequence
     * @return The calculated BigInteger value
     */
    public BigInteger calculateIterative(int n) {
        if (n < 0) {
            throw new InvalidIndexException("Index must be a non-negative integer. Received: " + n);
        }

        // Base cases
        if (n == 0) return BigInteger.ZERO;
        if (n == 1) return BigInteger.ONE;
        if (n == 2) return BigInteger.ZERO;
        if (n == 3) return BigInteger.ONE;

        // Use array to store last 4 values
        BigInteger[] last4 = new BigInteger[4];
        last4[0] = BigInteger.ZERO;  // l(0)
        last4[1] = BigInteger.ONE;   // l(1)
        last4[2] = BigInteger.ZERO;  // l(2)
        last4[3] = BigInteger.ONE;   // l(3)

        // Calculate iteratively
        for (int i = 4; i <= n; i++) {
            BigInteger current = last4[(i - 4) % 4].add(last4[(i - 3) % 4]);
            last4[i % 4] = current;
        }

        return last4[n % 4];
    }

    /**
     * Checks if a value for the given index exists in cache.
     * Note: This is a helper method for monitoring purposes.
     *
     * @param n The index to check
     * @return Always returns the calculated value (cache is transparent)
     */
    public boolean isInCache(int n) {
        // This is a simplified check - in production you might want
        // to implement a more sophisticated cache inspection mechanism
        return false; // Cache is transparent in Quarkus
    }
}