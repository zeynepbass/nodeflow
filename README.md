# NodeFlow

Kod yazmadan, sürükle-bırak ile görsel otomasyon akışları kurmayı sağlayan bir platformun Next.js arayüzü.

> Bu sürüm yalnızca ön yüzdür. Sunucu ve veritabanı yoktur; hesaplar, workflow'lar ve çalıştırma kayıtları tarayıcıda saklanır, çalıştırmalar örnek veriyle simüle edilir.

![Node Editör](docs/ekran-goruntuleri/node-editor.png)

## Özellikler

- **Node Editör:** sürükle-bırak, port'tan port'a bağlantı, geçersiz bağlantı reddi, çoklu seçim, mini harita, geri al/yinele ve otomatik kaydetme
- **Altı node kategorisi:** Başlangıç, Tetikleyici, İşlem, Koşul, Veri ve Bitiş; her biri sabit renk ve ikonla ayrışır
- **Node ayar paneli:** dinamik parametre formları, Evet/Hayır dallı koşul kurucusu, cron ifadesinin okunur çevirisi, anlık doğrulama ve tek node testi
- **Canlı çalıştırma:** node'lar sırayla renklenir, veri akışı bağlantı üzerinde izlenir, hatalı node doğrudan test sekmesine götürür
- **Çalıştırma geçmişi:** filtrelenebilir liste, node durum şeridi ve zaman damgalı log paneli
- **Workflow yönetimi:** arama, filtre, sıralama, grid/liste görünümü, toplu işlemler, kopyalama ve JSON dışa aktarma
- **Dashboard:** özet istatistikler, son çalıştırmalar ve aktivite akışı
- **Komut paleti:** `⌘K` ile sayfa, workflow ve aksiyon arama
- **Açık, koyu ve sistem teması**
- **Responsive deneyim:** tablette tek panelli odak modu, mobilde canvas yerine dikey **Akış Listesi Modu**
- **Erişilebilirlik:** klavye kullanımı, odak halkaları, `prefers-reduced-motion` desteği ve WCAG 2 AA renk kontrastı

## Ekran Görüntüleri

| Dashboard | Workflow'lar |
| --- | --- |
| ![Dashboard](docs/ekran-goruntuleri/dashboard.png) | ![Workflow'lar](docs/ekran-goruntuleri/workflowlar.png) |

| Giriş | Çalıştırmalar (koyu tema) |
| --- | --- |
| ![Giriş](docs/ekran-goruntuleri/giris.png) | ![Çalıştırmalar](docs/ekran-goruntuleri/calistirmalar-koyu.png) |

<img src="docs/ekran-goruntuleri/mobil-akis-listesi.png" alt="Mobil Akış Listesi Modu" width="280">

## Teknolojiler

| Alan | Araç |
| --- | --- |
| Çatı | Next.js 16 (App Router), React 19 |
| Dil | TypeScript |
| Stil | Tailwind CSS 4, CSS değişkenli tasarım token'ları |
| Canvas | React Flow (`@xyflow/react`) |
| Durum yönetimi | Zustand |
| İkonlar | Lucide |
| Yazı tipleri | Inter, Geist Mono |

## Başlangıç

Node.js 20.9 veya üzeri gerekir.

```bash
npm install
npm run dev
```

Uygulama `http://localhost:3000` adresinde açılır.

**Örnek hesap**

| E-posta | Şifre |
| --- | --- |
| `demo@nodeflow.dev` | `NodeFlow123` |

Örnek hesap hazır workflow ve çalıştırma kayıtlarıyla gelir. Yeni kayıt olan kullanıcı ise boş çalışma alanıyla başlar.

## Komutlar

| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Geliştirme sunucusunu başlatır |
| `npm run build` | Üretim derlemesi alır |
| `npm run start` | Üretim derlemesini çalıştırır |
| `npm run lint` | ESLint denetimini çalıştırır |
| `npm run typecheck` | TypeScript tip denetimini çalıştırır |

## Sayfalar

| Yol | Ekran |
| --- | --- |
| `/giris`, `/kayit`, `/sifre-sifirlama` | Kimlik doğrulama |
| `/panel` | Dashboard |
| `/is-akislari` | Workflow yönetimi |
| `/duzenleyici/[id]` | Node Editör |
| `/calistirmalar`, `/calistirmalar/[id]` | Çalıştırma geçmişi ve detayı |
| `/ayarlar` | Profil, tema, bildirim ve hesap ayarları |

## Klavye Kısayolları

| Kısayol | İşlem |
| --- | --- |
| `⌘/Ctrl + K` | Komut paletini açar |
| `Space + sürükle` | Canvas'ı kaydırır |
| `⌘/Ctrl + kaydırma` | Yakınlaştırır veya uzaklaştırır |
| `Delete` | Seçili node veya bağlantıyı siler |
| `⌘/Ctrl + D` | Seçili node'ları kopyalar |
| `⌘/Ctrl + Z` | Geri alır |
| `⌘/Ctrl + Shift + Z` | Yineler |
| `⌘/Ctrl + S` | Hemen kaydeder |

## Proje Yapısı

```
app/
├── (kimlik)/          giriş, kayıt ve şifre sıfırlama
├── (uygulama)/        dashboard, workflow'lar, çalıştırmalar, ayarlar
├── duzenleyici/[id]/  tam ekran node editör
└── globals.css        tasarım token'ları ve temalar
components/
├── atoms/             en küçük arayüz birimleri
├── molecules/         atomların birleşimi
├── organisms/         ekran bölümleri
└── editor/            canvas, node kartı, ayar paneli, mobil liste
lib/
├── nodes/             katalog, doğrulama, cron ve çalıştırma motoru
├── stores/            Zustand durumları
└── seed.ts            örnek çalışma alanı ve şablonlar
docs/

└── ekran-goruntuleri/
```

Bileşenler atomic design hiyerarşisini izler.

## Renk Kararları

- Rozetlerdeki başarı, uyarı ve bilgi metinleri WCAG AA kontrastı için bir ton koyulaştırıldı.
- Koyu temada birincil buton zemini, beyaz metin yeterince okunsun diye `primary-400` yerine `primary-500` kullanır.


- Kart menüsüne workflow durumunu değiştirmek için "Aktifleştir / Durdur" eklendi.

## Sınırlar

- Webhook, zamanlayıcı, e-posta ve HTTP işlemleri gerçekten çalışmaz; çalıştırmalar örnek girdiyle simüle edilir.
- Kimlik doğrulama tanıtım amaçlıdır ve tarayıcıda çalışır, gerçek bir güvenlik katmanı değildir.
- Google ile giriş, fotoğraf yükleme ve şifre sıfırlama e-postası örnek olarak yer alır.
- Veriler tarayıcıya özeldir; site verisi temizlenirse silinir.
