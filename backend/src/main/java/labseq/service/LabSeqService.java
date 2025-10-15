package labseq.service;

import labseq.exception.InvalidIndexException;
import io.quarkus.cache.CacheResult;
import jakarta.enterprise.context.ApplicationScoped;
import org.jboss.logging.Logger;

import java.math.BigInteger;


@ApplicationScoped
public class LabSeqService {

    private static final Logger LOG = Logger.getLogger(LabSeqService.class);
    
   
    private static final int ITERATIVE_THRESHOLD = 1000;

    public BigInteger calculate(int n) {
        validateIndex(n);
        
        // Escolhe estratégia baseado no tamanho
        if (n > ITERATIVE_THRESHOLD) {
            LOG.debugf("Using iterative method for n=%d", n);
            return calculateIterative(n);
        } else {
            LOG.debugf("Using recursive method with cache for n=%d", n);
            return calculateRecursive(n);
        }
    }

    @CacheResult(cacheName = "labseq-cache")
    public BigInteger calculateRecursive(int n) {
        // Base cases
        if (n == 0) return BigInteger.ZERO;
        if (n == 1) return BigInteger.ONE;
        if (n == 2) return BigInteger.ZERO;
        if (n == 3) return BigInteger.ONE;

        // Recursive case: l(n) = l(n-4) + l(n-3)
        // O cache automaticamente armazena resultados intermediários
        BigInteger nMinus4 = calculateRecursive(n - 4);
        BigInteger nMinus3 = calculateRecursive(n - 3);
        
        return nMinus4.add(nMinus3);
    }

 
    public BigInteger calculateIterative(int n) {
        // Base cases
        if (n == 0) return BigInteger.ZERO;
        if (n == 1) return BigInteger.ONE;
        if (n == 2) return BigInteger.ZERO;
        if (n == 3) return BigInteger.ONE;

        // Array circular para os últimos 4 valores
        // Isso permite O(1) de memória em vez de O(n)
        BigInteger[] last4 = new BigInteger[4];
        last4[0] = BigInteger.ZERO;  // l(0)
        last4[1] = BigInteger.ONE;   // l(1)
        last4[2] = BigInteger.ZERO;  // l(2)
        last4[3] = BigInteger.ONE;   // l(3)

        // Calcula iterativamente de 4 até n
        for (int i = 4; i <= n; i++) {
            // l(i) = l(i-4) + l(i-3)
            BigInteger current = last4[(i - 4) % 4].add(last4[(i - 3) % 4]);
            last4[i % 4] = current;
        }

        return last4[n % 4];
    }

    public boolean shouldUseIterative(int n) {
        return n > ITERATIVE_THRESHOLD;
    }


    private void validateIndex(int n) {
        if (n < 0) {
            LOG.warnf("Invalid index received: n=%d", n);
            throw new InvalidIndexException("Index must be a non-negative integer. Received: " + n);
        }
    }


    public int getIterativeThreshold() {
        return ITERATIVE_THRESHOLD;
    }
}