[![Build Status](https://travis-ci.com/t-rekttt/tinchi-api.svg?branch=master)](https://travis-ci.com/t-rekttt/tinchi-api)

# tinchi-api
Client library mình viết với mục đích crawl data từ các trang tín chỉ sử dụng bộ source tín chỉ của CMC, ví dụ http://dkh.tlu.edu.vn (hiện tại mới customize theo trang trường mình nhưng theo mình là có thể sử dụng qua lại cho các trang khác cùng source được)

## Cách cài đặt
### Cài đặt từ source
```
git clone https://github.com/t-rekttt/tinchi-api.git
cd tinchi-api
npm install
```

### Cài đặt từ npm
```
npm install t-rekttt/tinchi-api --save
```

## Hướng dẫn sử dụng
Sau đây là các hàm mình đã viết:
### init
- Request lần đầu để lấy session và trả về cookie jar (cách sử dụng jar đọc tại https://www.npmjs.com/package/request-promise)
### parseInitialFormData
- Request đến trang và bóc tách những dữ liệu mặc định trong form data (vì aspx có 1 số field mặc định nếu bỏ đi sẽ bị lỗi nên mình viết hàm chung này)
### parseSelector
- Bóc tách các selection field và options đi kèm
### login
- Xử lý đăng nhập
### getTkb
- Lấy và parse thời khóa biểu từ trang lịch học
### parseTkb
- Parse từ data của hàm getTkb và bóc tách các dữ liệu ra format đẹp đẽ
### getTkbDkh
- Lấy thời khóa biểu từ trang đăng ký học và parse ra dạng JSON
### parseTkbDkh
- Parse từ data của hàm getTkbDkh và bóc tách các dữ liệu ra format đẹp đẽ
### generateTimeline
- Parse từ data của hàm parseTkb, parseTkbDkh và chuyển thành timeline
### groupTimelineByDay
- Nhóm timeline từ data của hàm generateTimeline theo ngày
