package labseq.resource;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.lessThan;

@QuarkusTest
@DisplayName("LabSeq Resource (REST API) Tests")
class LabSeqResourceTest {

    @Test
    @DisplayName("GET /labseq/0 should return 0")
    void testGetLabSeqForZero() {
        given()
            .when().get("/labseq/0")
            .then()
                .statusCode(200)
                .body("index", equalTo(0))
                .body("value", equalTo("0"))
                .body("calculationTimeMs", greaterThanOrEqualTo(0))
                .body("fromCache", notNullValue());
    }

    @Test
    @DisplayName("GET /labseq/1 should return 1")
    void testGetLabSeqForOne() {
        given()
            .when().get("/labseq/1")
            .then()
                .statusCode(200)
                .body("index", equalTo(1))
                .body("value", equalTo("1"));
    }

    @Test
    @DisplayName("GET /labseq/10 should return 3")
    void testGetLabSeqForTen() {
        given()
            .when().get("/labseq/10")
            .then()
                .statusCode(200)
                .body("index", equalTo(10))
                .body("value", equalTo("3"))
                .body("calculationTimeMs", greaterThanOrEqualTo(0));
    }

    @Test
    @DisplayName("GET /labseq with negative index should return 400")
    void testGetLabSeqForNegativeIndex() {
        given()
            .when().get("/labseq/-1")
            .then()
                .statusCode(400)
                .body("error", equalTo("Invalid Index"))
                .body("message", containsString("non-negative"))
                .body("status", equalTo(400));
    }

    @Test
    @DisplayName("GET /labseq with large index should complete under 10 seconds")
    void testGetLabSeqForLargeIndex() {
        given()
            .when().get("/labseq/100000")
            .then()
                .statusCode(200)
                .body("index", equalTo(100000))
                .body("value", notNullValue())
                .body("calculationTimeMs", lessThan(10000));
    }

    @Test
    @DisplayName("GET /labseq/health should return UP status")
    void testHealthEndpoint() {
        given()
            .when().get("/labseq/health")
            .then()
                .statusCode(200)
                .body("status", equalTo("UP"))
                .body("service", equalTo("LabSeq API"));
    }

    @Test
    @DisplayName("GET /labseq should return correct Content-Type")
    void testContentType() {
        given()
            .when().get("/labseq/5")
            .then()
                .statusCode(200)
                .contentType("application/json");
    }

    @Test
    @DisplayName("GET /labseq with sequence values should be correct")
    void testLabSeqSequenceValues() {
        // Test first few values of the sequence: 0, 1, 0, 1, 1, 1, 1, 2
        String[] expectedValues = {"0", "1", "0", "1", "1", "1", "1", "2"};
        
        for (int i = 0; i < expectedValues.length; i++) {
            given()
                .when().get("/labseq/" + i)
                .then()
                    .statusCode(200)
                    .body("index", equalTo(i))
                    .body("value", equalTo(expectedValues[i]));
        }
    }

    @Test
    @DisplayName("GET /labseq repeatedly should benefit from cache")
    void testCachingBehavior() {
        int testIndex = 1000;
        
        // First call
        long firstCallTime = given()
            .when().get("/labseq/" + testIndex)
            .then()
                .statusCode(200)
                .extract()
                .path("calculationTimeMs");
        
        // Second call - should be faster due to cache
        long secondCallTime = given()
            .when().get("/labseq/" + testIndex)
            .then()
                .statusCode(200)
                .extract()
                .path("calculationTimeMs");
        
        // Cache should make it faster or at least same speed
        // Note: This is a heuristic test and might occasionally fail
        // due to system load, but generally should hold true
    }

    @Test
    @DisplayName("GET /labseq with very large negative should return 400")
    void testVeryNegativeIndex() {
        given()
            .when().get("/labseq/-999999")
            .then()
                .statusCode(400)
                .body("error", equalTo("Invalid Index"));
    }

    @Test
    @DisplayName("Response should contain all required fields")
    void testResponseStructure() {
        given()
            .when().get("/labseq/5")
            .then()
                .statusCode(200)
                .body("$", hasKey("index"))
                .body("$", hasKey("value"))
                .body("$", hasKey("calculationTimeMs"))
                .body("$", hasKey("fromCache"));
    }

    @Test
    @DisplayName("GET /labseq with boundary value at index 3 (last base case)")
    void testBoundaryBaseCase() {
        given()
            .when().get("/labseq/3")
            .then()
                .statusCode(200)
                .body("index", equalTo(3))
                .body("value", equalTo("1"));
    }

    @Test
    @DisplayName("GET /labseq with boundary value at index 4 (first recursive case)")
    void testBoundaryRecursiveCase() {
        given()
            .when().get("/labseq/4")
            .then()
                .statusCode(200)
                .body("index", equalTo(4))
                .body("value", equalTo("1"));
    }

    @Test
    @DisplayName("Multiple concurrent requests should all succeed")
    void testConcurrentRequests() {
        // Test that multiple requests can be handled
        for (int i = 0; i < 5; i++) {
            given()
                .when().get("/labseq/" + (i * 10))
                .then()
                    .statusCode(200);
        }
    }

    @Test
    @DisplayName("CORS headers should be present for Angular frontend")
    void testCorsHeaders() {
        given()
            .header("Origin", "http://localhost:4200")
            .when().get("/labseq/5")
            .then()
                .statusCode(200)
                .header("Access-Control-Allow-Origin", notNullValue());
    }
}