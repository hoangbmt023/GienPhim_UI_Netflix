# OPhim API Documentation

> **Base URL:** `https://ophim1.com`  
> **CDN Images:** `https://img.ophim.live/uploads/movies/{filename}`  
> **Format:** JSON · **Method:** GET only · **CORS:** Supported (no auth required)

---

## Endpoints

### 1. Home Page
```
GET /v1/api/home
```
Returns featured/trending movies for the homepage.

**Response:**
```json
{
  "status": "success",
  "data": {
    "items": [ { "_id", "name", "slug", "thumb_url", "poster_url", ... } ]
  }
}
```

---

### 2. Movie List (with filters)
```
GET /v1/api/danh-sach/{slug}
```

**Path Parameters:**

| Param | Required | Type   | Values |
|-------|----------|--------|--------|
| slug  | ✅ Yes   | string | See table below |

**Valid slug values:**
| Slug | Description |
|------|------------|
| `phim-moi` | Phim mới cập nhật |
| `phim-bo` | Phim bộ (series) |
| `phim-le` | Phim lẻ (single) |
| `tv-shows` | TV Shows |
| `hoat-hinh` | Phim hoạt hình |
| `phim-vietsub` | Phim Vietsub |
| `phim-thuyet-minh` | Phim thuyết minh |
| `phim-long-tien` | Phim lồng tiếng |
| `phim-bo-dang-chieu` | Phim bộ đang chiếu |
| `phim-bo-hoan-thanh` | Phim bộ hoàn thành |
| `phim-sap-chieu` | Phim sắp chiếu |
| `subteam` | Subteam |
| `phim-chieu-rap` | Phim chiếu rạp |

**Query Parameters (all optional):**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Trang hiện tại |
| `limit` | number | 24 | Số phim mỗi trang |
| `sort_field` | string | `modified.time` | Trường sắp xếp (`_id`, `modified.time`, `year`) |
| `sort_type` | string | `desc` | Hướng sắp xếp (`asc`, `desc`) |
| `category` | string | – | Slug thể loại (vd: `hanh-dong`) |
| `country` | string | – | Slug quốc gia (vd: `han-quoc`) |
| `year` | number | – | Năm phát hành (vd: `2024`) |
| `type` | string | – | Loại phim (`series`, `single`) |

**Example:**
```
GET /v1/api/danh-sach/phim-bo?page=1&limit=20&sort_field=year&sort_type=desc&country=han-quoc&year=2024
```

---

### 3. Search
```
GET /v1/api/tim-kiem?keyword={keyword}&page={page}&limit={limit}
```

| Param | Required | Description |
|-------|----------|-------------|
| `keyword` | ✅ Yes | Từ khóa tìm kiếm |
| `page` | No | Trang |
| `limit` | No | Số kết quả |

---

### 4. Genre List
```
GET /v1/api/the-loai
```
Returns array of all genres.

**Response:**
```json
{
  "status": "success",
  "data": {
    "items": [
      { "_id": "...", "name": "Hành Động", "slug": "hanh-dong" }
    ]
  }
}
```

**Known genres:**
| Slug | Name |
|------|------|
| `hanh-dong` | Hành Động |
| `tinh-cam` | Tình Cảm |
| `hai-huoc` | Hài Hước |
| `co-trang` | Cổ Trang |
| `tam-ly` | Tâm Lý |
| `hinh-su` | Hình Sự |
| `chien-tranh` | Chiến Tranh |
| `the-thao` | Thể Thao |
| `vo-thuat` | Võ Thuật |
| `vien-tuong` | Viễn Tưởng |
| `phieu-luu` | Phiêu Lưu |
| `khoa-hoc` | Khoa Học |
| `kinh-di` | Kinh Dị |
| `am-nhac` | Âm Nhạc |
| `than-thoai` | Thần Thoại |
| `tai-lieu` | Tài Liệu |
| `gia-dinh` | Gia Đình |
| `chinh-kich` | Chính kịch |
| `bi-an` | Bí ẩn |
| `hoc-duong` | Học Đường |
| `kinh-dien` | Kinh Điển |
| `phim-18` | Phim 18+ |
| `short-drama` | Short Drama |

---

### 5. Movies by Genre (with filters)
```
GET /v1/api/the-loai/{slug}?page={page}&limit={limit}&...
```
Same filter params as Danh Sách endpoint.

---

### 6. Country List
```
GET /v1/api/quoc-gia
```
Returns array of all countries.

**Known countries:**
| Slug | Name |
|------|------|
| `han-quoc` | Hàn Quốc |
| `trung-quoc` | Trung Quốc |
| `nhat-ban` | Nhật Bản |
| `au-my` | Âu Mỹ |
| `viet-nam` | Việt Nam |
| `thai-lan` | Thái Lan |
| `dai-loan` | Đài Loan |
| `hong-kong` | Hồng Kông |
| `an-do` | Ấn Độ |
| `anh` | Anh |
| `phap` | Pháp |
| `canada` | Canada |
| `duc` | Đức |
| `tay-ban-nha` | Tây Ban Nha |
| `tho-nhi-ky` | Thổ Nhĩ Kỳ |
| `indonesia` | Indonesia |
| `nga` | Nga |
| `uc` | Úc |
| `malaysia` | Malaysia |
| `philippines` | Philippines |

---

### 7. Movies by Country (with filters)
```
GET /v1/api/quoc-gia/{slug}?page={page}&limit={limit}&...
```
Same filter params as Danh Sách.

---

### 8. Year List
```
GET /v1/api/nam
```

---

### 9. Movies by Year (with filters)
```
GET /v1/api/nam/{year}?page={page}&...
```

---

### 10. Movie Detail
```
GET /v1/api/phim/{slug}
```

**Response:**
```json
{
  "status": "success",
  "msg": "",
  "movie": {
    "_id": "...",
    "name": "Tên phim",
    "slug": "ten-phim",
    "origin_name": "Original Name",
    "content": "<p>Nội dung mô tả</p>",
    "type": "series | single | hoathinh | tvshows",
    "status": "ongoing | completed",
    "thumb_url": "filename.jpg",
    "poster_url": "filename.jpg",
    "trailer_url": "youtube_url",
    "time": "45 phút/tập",
    "episode_current": "Tập 12",
    "episode_total": "16 tập",
    "quality": "FHD | HD | SD",
    "lang": "Vietsub | Thuyết minh | Lồng tiếng",
    "year": 2024,
    "view": 12345,
    "actor": ["Tên diễn viên"],
    "director": ["Tên đạo diễn"],
    "category": [{ "id": "...", "name": "Hành Động", "slug": "hanh-dong" }],
    "country": [{ "id": "...", "name": "Hàn Quốc", "slug": "han-quoc" }],
    "imdb": { "id": "tt123", "vote_average": 7.5 },
    "tmdb": { "id": 123, "type": "tv", "season": 1, "vote_average": 7.8 },
    "modified": { "time": "2024-01-01T00:00:00.000Z" }
  },
  "episodes": [
    {
      "server_name": "Server #1",
      "server_data": [
        {
          "name": "Tập 1",
          "slug": "tap-1",
          "filename": "tap-1",
          "link_embed": "https://ophim1.com/phim/ten-phim/tap-1",
          "link_m3u8": "https://..."
        }
      ]
    }
  ]
}
```

---

### 11. Images
```
GET /v1/api/hinh-anh/{slug}
```

---

### 12. Actors
```
GET /v1/api/dien-vien/{slug}
```

---

### 13. Keywords
```
GET /v1/api/tu-khoa/{slug}
```

---

## Image CDN

All `thumb_url` and `poster_url` are filenames. Prepend CDN:

```
https://img.ophim.live/uploads/movies/{filename}
```

**Examples:**
```js
// thumb_url (wide, 16:9 landscape)
imgUrl("image-thumb.jpg")
// → https://img.ophim.live/uploads/movies/image-thumb.jpg

// poster_url (tall, 2:3 portrait — better for blur backdrops)
imgUrl("image-poster.jpg")
// → https://img.ophim.live/uploads/movies/image-poster.jpg
```

> **Tip:** Use `poster_url` for hero/spotlight blurred backgrounds (portrait format looks better on full-width).  
> Use `thumb_url` for thumbnail strips and movie cards (landscape/portrait cards).

---

## Response Structures

### List endpoints (`/danh-sach`, `/the-loai/:slug`, `/quoc-gia/:slug`, `/nam/:year`)
```json
{
  "status": "success",
  "message": "",
  "data": {
    "items": [ Movie ],
    "params": {
      "pagination": {
        "totalItems": 500,
        "totalItemsPerPage": 24,
        "currentPage": 1,
        "totalPages": 21
      }
    }
  }
}
```

### Home `/home`
```json
{
  "status": "success",
  "data": {
    "items": [ Movie ]
  }
}
```

### Metadata endpoints (`/the-loai`, `/quoc-gia`)
```json
{
  "status": "success",
  "message": "",
  "data": {
    "items": [ { "_id", "name", "slug" } ]
  }
}
```

### parseItems helper
```js
// Handles all response formats:
export const parseItems = (r) => {
  const d = r?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  return [];
};
```

---

## Filter Examples

```js
// Phim bộ Hàn Quốc năm 2024
GET /v1/api/danh-sach/phim-bo?country=han-quoc&year=2024&page=1

// Phim lẻ thể loại hành động, sắp xếp mới nhất
GET /v1/api/danh-sach/phim-le?category=hanh-dong&sort_field=modified.time&sort_type=desc

// Tìm kiếm "song hye kyo" trang 2
GET /v1/api/tim-kiem?keyword=song+hye+kyo&page=2

// Phim chiếu rạp mới
GET /v1/api/danh-sach/phim-chieu-rap?page=1&sort_field=year&sort_type=desc
```

---

## Route Mapping (GienPhim)

| UI Route | API Call |
|----------|----------|
| `/home` | `GET /v1/api/home` |
| `/phim-moi` | `GET /v1/api/danh-sach/phim-moi` |
| `/phim-bo` | `GET /v1/api/danh-sach/phim-bo` |
| `/phim-le` | `GET /v1/api/danh-sach/phim-le` |
| `/hoat-hinh` | `GET /v1/api/danh-sach/hoat-hinh` |
| `/quoc-gia/viet-nam` | `GET /v1/api/quoc-gia/viet-nam` |
| `/quoc-gia/:slug` | `GET /v1/api/quoc-gia/{slug}` |
| `/the-loai/:slug` | `GET /v1/api/the-loai/{slug}` |
| `/phim/:slug` | `GET /v1/api/phim/{slug}` |
| `/tim-kiem?keyword=` | `GET /v1/api/tim-kiem?keyword=` |
| `/phim-chieu-rap` | `GET /v1/api/danh-sach/phim-chieu-rap` |
| `/tv-shows` | `GET /v1/api/danh-sach/tv-shows` |
