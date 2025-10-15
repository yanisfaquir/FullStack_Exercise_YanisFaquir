# LabSeq REST API & Frontend

Solução Full Stack para cálculo da sequência matemática LabSeq: **l(n) = l(n-4) + l(n-3)**




```bash
# Clone o repositório
git clone https://github.com/yanisfaquir/FullStack_Exercise_YanisFaquir
cd FullStack_Exercise_YanisFaquir

# Execute com Docker
docker-compose up -d
```

**Acessos:**
- **Frontend:** http://localhost:4200
- **Backend API:** http://localhost:8080/labseq/{n}
- **Swagger UI:** http://localhost:8080/swagger-ui
- **Health Check:** http://localhost:8080/labseq/health

---

## 📋 Features

**API REST** com Quarkus (Java )  
**Interface Web** com Angular  
**Cache inteligente** (Caffeine) para performance  
**Algoritmo híbrido** (recursivo + iterativo)  
**Suporte a números gigantes** (BigInteger, 20.000+ dígitos)  
**Documentação OpenAPI/Swagger** completa  
**Testes unitários** (92% backend, 87.5% frontend)  
**Docker Compose** para deploy simplificado  

---

## 🧪 Testes

### Backend

cd labseq-backend
mvn test                    


### Frontend
```bash
cd labseq-frontend
ng test --include='**/labseq.service.spec.ts'                       

```


---

## 🛠️ Desenvolvimento Local

### Backend (Quarkus)
```bash
cd labseq-backend
mvn quarkus:dev             # Hot reload ativo
```
Acesso: http://localhost:8080

### Frontend (Angular)
```bash
cd labseq-frontend
npm install
ng serve
```
Acesso: http://localhost:4200

---

## 📖 API Endpoints

### Calcular LabSeq
http
GET /labseq/{n}


### Health Check
http
GET /labseq/health








## 📄 Documentação

- 📚 **Relatório Técnico:** YanisFaquir_RelatorioTecnico.pdf
- 🔗 **Swagger UI:** http://localhost:8080/swagger-ui

---

## 👨‍💻 Autor

**Yanis Marina Faquir**

📧 Email: yanismarinafaquir@gmail.com 

