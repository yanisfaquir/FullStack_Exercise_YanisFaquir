import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LabseqService, LabSeqResponse } from './labseq.service';
import { environment } from '../../environments/environment';

describe('LabseqService', () => {
  let service: LabseqService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LabseqService]
    });

    service = TestBed.inject(LabseqService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ========== TESTES DE getLabSeq() ==========

  describe('getLabSeq', () => {
    it('should return LabSeq value for n=0', () => {
      const mockResponse: LabSeqResponse = {
        n: 0,
        value: '0',
        calculationTime: 1,
        fromCache: false,
        digits: 1
      };

      service.getLabSeq(0).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.n).toBe(0);
        expect(response.value).toBe('0');
        expect(response.digits).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/labseq/0`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return LabSeq value for n=10', () => {
      const mockResponse: LabSeqResponse = {
        n: 10,
        value: '3',
        calculationTime: 5,
        fromCache: true,
        digits: 1
      };

      service.getLabSeq(10).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.n).toBe(10);
        expect(response.value).toBe('3');
        expect(response.fromCache).toBe(true);
      });

      const req = httpMock.expectOne(`${apiUrl}/labseq/10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return LabSeq value for large n=5000', () => {
      const mockResponse: LabSeqResponse = {
        n: 5000,
        value: '728344683965422116279949406582559248431247223698999054666281183226847798816047809298967033488588179426147860649286820431108026517819818446880729302848023786278114388758555016628682004919258283166581114326824009783969896306295003601138757',
        calculationTime: 45,
        fromCache: false,
        digits: 1523
      };

      service.getLabSeq(5000).subscribe((response) => {
        expect(response.n).toBe(5000);
        expect(response.value.length).toBeGreaterThan(100);
        expect(response.digits).toBe(1523);
      });

      const req = httpMock.expectOne(`${apiUrl}/labseq/5000`);
      req.flush(mockResponse);
    });

    it('should handle HTTP error gracefully (with retry)', (done) => {
      const errorMessage = 'Internal Server Error';

      service.getLabSeq(10).subscribe({
        next: () => fail('should have failed with 500 error'),
        error: (error) => {
          expect(error).toBeTruthy();
          expect(error.message).toContain('Error');
          done();
        }
      });

      // Primeira tentativa - falha
      const req1 = httpMock.expectOne(`${apiUrl}/labseq/10`);
      req1.flush(errorMessage, { status: 500, statusText: 'Internal Server Error' });

      // Retry automático - também falha
      const req2 = httpMock.expectOne(`${apiUrl}/labseq/10`);
      req2.flush(errorMessage, { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle network error (with retry)', (done) => {
      service.getLabSeq(10).subscribe({
        next: () => fail('should have failed with network error'),
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });

      // Primeira tentativa - erro de rede
      const req1 = httpMock.expectOne(`${apiUrl}/labseq/10`);
      req1.error(new ProgressEvent('Network error'));

      // Retry automático - também falha
      const req2 = httpMock.expectOne(`${apiUrl}/labseq/10`);
      req2.error(new ProgressEvent('Network error'));
    });

    it('should retry once and succeed on second attempt', (done) => {
      const mockResponse: LabSeqResponse = {
        n: 10,
        value: '3',
        calculationTime: 5,
        fromCache: true,
        digits: 1
      };

      service.getLabSeq(10).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          done();
        },
        error: () => fail('should have succeeded after retry')
      });

      // Primeira tentativa - falha
      const req1 = httpMock.expectOne(`${apiUrl}/labseq/10`);
      req1.flush('Error', { status: 500, statusText: 'Internal Server Error' });

      // Segunda tentativa (retry) - sucesso
      const req2 = httpMock.expectOne(`${apiUrl}/labseq/10`);
      req2.flush(mockResponse);
    });

    it('should handle 400 Bad Request error (with retry)', (done) => {
      service.getLabSeq(-1).subscribe({
        next: () => fail('should have failed with 400 error'),
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });

      // Primeira tentativa - 400 Bad Request
      const req1 = httpMock.expectOne(`${apiUrl}/labseq/-1`);
      req1.flush({ error: 'Invalid input' }, { status: 400, statusText: 'Bad Request' });

      // Retry automático - também falha
      const req2 = httpMock.expectOne(`${apiUrl}/labseq/-1`);
      req2.flush({ error: 'Invalid input' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  // ========== TESTES DE checkHealth() ==========

  describe('checkHealth', () => {
    it('should return health status as UP', () => {
      const mockHealth = {
        status: 'UP',
        service: 'LabSeq API'
      };

      service.checkHealth().subscribe((response) => {
        expect(response.status).toBe('UP');
        expect(response.service).toBe('LabSeq API');
      });

      const req = httpMock.expectOne(`${apiUrl}/labseq/health`);
      expect(req.request.method).toBe('GET');
      req.flush(mockHealth);
    });

    it('should handle health check failure', (done) => {
      service.checkHealth().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/labseq/health`);
      req.flush('Service Unavailable', { status: 503, statusText: 'Service Unavailable' });
    });
  });

  // ========== TESTES DE EDGE CASES ==========

  describe('Edge Cases', () => {
    it('should handle n=0 correctly', () => {
      const mockResponse: LabSeqResponse = {
        n: 0,
        value: '0',
        calculationTime: 1,
        fromCache: false,
        digits: 1
      };

      service.getLabSeq(0).subscribe((response) => {
        expect(response.value).toBe('0');
      });

      const req = httpMock.expectOne(`${apiUrl}/labseq/0`);
      req.flush(mockResponse);
    });

    it('should handle very large n=100000', () => {
      const mockResponse: LabSeqResponse = {
        n: 100000,
        value: '1'.repeat(30000),
        calculationTime: 5000,
        fromCache: false,
        digits: 30000
      };

      service.getLabSeq(100000).subscribe((response) => {
        expect(response.n).toBe(100000);
        expect(response.digits).toBe(30000);
      });

      const req = httpMock.expectOne(`${apiUrl}/labseq/100000`);
      req.flush(mockResponse);
    });

    it('should handle response with fromCache=true', () => {
      const mockResponse: LabSeqResponse = {
        n: 50,
        value: '12',
        calculationTime: 1,
        fromCache: true,
        digits: 2
      };

      service.getLabSeq(50).subscribe((response) => {
        expect(response.fromCache).toBe(true);
        expect(response.calculationTime).toBeLessThan(10);
      });

      const req = httpMock.expectOne(`${apiUrl}/labseq/50`);
      req.flush(mockResponse);
    });
  });
});