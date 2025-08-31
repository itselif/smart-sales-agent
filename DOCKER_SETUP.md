# Docker Kurulumu ve Çalıştırma

## Ön Gereksinimler

1. Docker Desktop kurulu olmalı
2. Docker daemon çalışıyor olmalı
3. En az 8GB RAM ve 20GB disk alanı

## Kurulum Adımları

### 1. Docker Desktop'ı Başlatın
- Docker Desktop uygulamasını açın
- "Start" butonuna tıklayın
- Docker daemon'un başlamasını bekleyin

### 2. Projeyi Çalıştırın
```bash
# Tüm servisleri başlatın
docker-compose up -d

# Sadece veritabanı ve Redis'i başlatın
docker-compose up -d db redis

# Logları izleyin
docker-compose logs -f

# Belirli bir servisin loglarını izleyin
docker-compose logs -f auth
```

### 3. Servis Portları

| Servis | Port | Açıklama |
|--------|------|----------|
| Database | 5432 | PostgreSQL |
| Redis | 6379 | Redis Cache |
| Auth Service | 3001 | Kimlik doğrulama |
| Reporting Service | 3002 | Raporlama |
| Observability Service | 3003 | İzleme |
| Panel | 3004 | Web arayüzü |
| Notification Service | 3005 | Bildirimler |
| Store Management | 3006 | Mağaza yönetimi |
| Platform Admin | 3007 | Platform yönetimi |
| Inventory Management | 3008 | Stok yönetimi |
| Document Service | 3009 | Doküman yönetimi |
| Sales Management | 3010 | Satış yönetimi |
| BFF Service | 3011 | API Gateway |
| Kafka | 9092 | Message Broker |

### 4. Veritabanı Bağlantısı

PostgreSQL veritabanına bağlanmak için:
- Host: localhost
- Port: 5432
- Username: postgres
- Password: postgres
- Database: salesai

### 5. Hata Giderme

#### Docker daemon bağlantı hatası
```bash
# Docker Desktop'ı yeniden başlatın
# Windows PowerShell'de:
Restart-Service docker

# Veya Docker Desktop uygulamasını kapatıp açın
```

#### Port çakışması
```bash
# Kullanılan portları kontrol edin
netstat -an | findstr :3001

# Docker container'larını durdurun
docker-compose down

# Portları değiştirin ve tekrar başlatın
```

#### Servis başlatma hatası
```bash
# Container loglarını kontrol edin
docker-compose logs auth

# Container'ı yeniden başlatın
docker-compose restart auth
```

### 6. Geliştirme

```bash
# Sadece belirli servisleri çalıştırın
docker-compose up -d auth db redis

# Servisleri durdurun
docker-compose down

# Tüm container'ları ve volume'ları silin
docker-compose down -v
```

## Notlar

- İlk çalıştırmada tüm Docker image'ları indirilecek
- Veritabanı ilk kez başlatıldığında biraz zaman alabilir
- Panel servisi (port 3004) web arayüzüne erişim sağlar
- BFF servisi (port 3011) tüm mikroservislerin API gateway'idir
