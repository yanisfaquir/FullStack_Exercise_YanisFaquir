package labseq.service;

import labseq.exception.InvalidIndexException;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.math.BigInteger;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@DisplayName("LabSeq Service Tests")
class LabSeqServiceTest {

    @Inject
    LabSeqService labSeqService;

    @Test
    @DisplayName("Should return 0 for index 0")
    void testLabSeqForZero() {
        BigInteger result = labSeqService.calculate(0);
        assertEquals(BigInteger.ZERO, result);
    }

    @Test
    @DisplayName("Should return 1 for index 1")
    void testLabSeqForOne() {
        BigInteger result = labSeqService.calculate(1);
        assertEquals(BigInteger.ONE, result);
    }

    @Test
    @DisplayName("Should return 0 for index 2")
    void testLabSeqForTwo() {
        BigInteger result = labSeqService.calculate(2);
        assertEquals(BigInteger.ZERO, result);
    }

    @Test
    @DisplayName("Should return 1 for index 3")
    void testLabSeqForThree() {
        BigInteger result = labSeqService.calculate(3);
        assertEquals(BigInteger.ONE, result);
    }

    @Test
    @DisplayName("Should calculate correct value for index 4")
    void testLabSeqForFour() {
        // l(4) = l(0) + l(1) = 0 + 1 = 1
        BigInteger result = labSeqService.calculate(4);
        assertEquals(BigInteger.ONE, result);
    }

    @Test
    @DisplayName("Should calculate correct value for index 5")
    void testLabSeqForFive() {
        // l(5) = l(1) + l(2) = 1 + 0 = 1
        BigInteger result = labSeqService.calculate(5);
        assertEquals(BigInteger.ONE, result);
    }

    @Test
    @DisplayName("Should calculate correct value for index 6")
    void testLabSeqForSix() {
        // l(6) = l(2) + l(3) = 0 + 1 = 1
        BigInteger result = labSeqService.calculate(6);
        assertEquals(BigInteger.ONE, result);
    }

    @Test
    @DisplayName("Should calculate correct value for index 7")
    void testLabSeqForSeven() {
        // l(7) = l(3) + l(4) = 1 + 1 = 2
        BigInteger result = labSeqService.calculate(7);
        assertEquals(BigInteger.valueOf(2), result);
    }

    @Test
    @DisplayName("Should calculate correct value for index 10")
    void testLabSeqForTen() {
        // l(10) = l(6) + l(7) = 1 + 2 = 3
        BigInteger result = labSeqService.calculate(10);
        assertEquals(BigInteger.valueOf(3), result);
    }

    @Test
    @DisplayName("Should calculate correct sequence values")
    void testLabSeqSequence() {
        // First 12 values: 0, 1, 0, 1, 1, 1, 1, 2, 2, 2, 3, 4
        BigInteger[] expected = {
            BigInteger.ZERO,           // l(0) = 0
            BigInteger.ONE,            // l(1) = 1
            BigInteger.ZERO,           // l(2) = 0
            BigInteger.ONE,            // l(3) = 1
            BigInteger.ONE,            // l(4) = 1
            BigInteger.ONE,            // l(5) = 1
            BigInteger.ONE,            // l(6) = 1
            BigInteger.valueOf(2),     // l(7) = 2
            BigInteger.valueOf(2),     // l(8) = 2
            BigInteger.valueOf(2),     // l(9) = 2
            BigInteger.valueOf(3),     // l(10) = 3
            BigInteger.valueOf(4)      // l(11) = 4
        };

        for (int i = 0; i < expected.length; i++) {
            BigInteger result = labSeqService.calculate(i);
            assertEquals(expected[i], result, 
                "Failed for index " + i + ". Expected: " + expected[i] + ", Got: " + result);
        }
    }

    @Test
    @DisplayName("Should handle large index values")
    void testLabSeqForLargeIndex() {
        // Test with a larger value to ensure it doesn't timeout
        assertDoesNotThrow(() -> {
            BigInteger result = labSeqService.calculate(100);
            assertNotNull(result);
            assertTrue(result.compareTo(BigInteger.ZERO) >= 0);
        });
    }

    @Test
    @DisplayName("Should calculate very large index under 10 seconds")
    void testLabSeqPerformanceForLargeIndex() {
        long startTime = System.currentTimeMillis();
        
        BigInteger result = labSeqService.calculate(100000);
        
        long endTime = System.currentTimeMillis();
        long duration = endTime - startTime;

        assertNotNull(result);
        assertTrue(duration < 10000, 
            "Calculation took " + duration + "ms, should be under 10000ms");
    }

    @Test
    @DisplayName("Should throw exception for negative index")
    void testLabSeqForNegativeIndex() {
        InvalidIndexException exception = assertThrows(
            InvalidIndexException.class,
            () -> labSeqService.calculate(-1)
        );
        
        assertTrue(exception.getMessage().contains("non-negative"));
    }

    @Test
    @DisplayName("Should throw exception for very negative index")
    void testLabSeqForVeryNegativeIndex() {
        InvalidIndexException exception = assertThrows(
            InvalidIndexException.class,
            () -> labSeqService.calculate(-100)
        );
        
        assertNotNull(exception.getMessage());
    }

    @Test
    @DisplayName("Should benefit from cache on repeated calls")
    void testLabSeqCacheBenefit() {
        int testIndex = 5000;
        
        // First call - calculates from scratch
        long startTime1 = System.currentTimeMillis();
        BigInteger result1 = labSeqService.calculate(testIndex);
        long duration1 = System.currentTimeMillis() - startTime1;
        
        // Second call - should use cache
        long startTime2 = System.currentTimeMillis();
        BigInteger result2 = labSeqService.calculate(testIndex);
        long duration2 = System.currentTimeMillis() - startTime2;
        
        // Results should be the same
        assertEquals(result1, result2);
        
        // Second call should be faster (usually much faster)
        // Note: This might occasionally fail due to JVM warmup, but generally holds true
        assertTrue(duration2 <= duration1, 
            "Second call (" + duration2 + "ms) should be faster than or equal to first call (" + duration1 + "ms)");
    }

    @Test
    @DisplayName("Should use iterative method correctly")
    void testLabSeqIterativeMethod() {
        // Test that iterative method produces same results as recursive
        for (int i = 0; i <= 20; i++) {
            BigInteger recursive = labSeqService.calculate(i);
            BigInteger iterative = labSeqService.calculateIterative(i);
            
            assertEquals(recursive, iterative, 
                "Results differ at index " + i + ": recursive=" + recursive + ", iterative=" + iterative);
        }
    }

    @Test
    @DisplayName("Should handle edge case at boundary values")
    void testLabSeqBoundaryValues() {
        // Test values right at the boundary between base cases and recursive cases
        assertDoesNotThrow(() -> {
            labSeqService.calculate(3);  // Last base case
            labSeqService.calculate(4);  // First recursive case
        });
    }
}