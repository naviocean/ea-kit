---
name: cbot-best-practices
description: Các quy tắc vàng, best practices, risk management và template khởi tạo khi code cBot trên cTrader (Visual/Non-Visual, Async, Memory, Determinism).
---

# cTrader cBot Best Practices & Golden Rules

Dưới đây là bộ quy tắc thực chiến và kiến trúc bắt buộc phải tuân thủ khi lập trình cBot trên cTrader. Việc tuân thủ giúp bot chạy ổn định, khớp kết quả 100% giữa Visual / Non-Visual, an toàn cho tài khoản Live và dễ dàng mở rộng.

## 0. Nguyên tắc Tối Thượng (Determinism & Survival)
- **Tái lập được (Determinism):** Nếu cùng dữ liệu, tham số và trạng thái tài khoản, bot PHẢI ra quyết định giống nhau. Nếu Backtest Visual và Non-Visual khác nhau, code đang có lỗi Timing/Logic.
- **Không tin vào thứ không tất định:** TUYỆT ĐỐI KHÔNG DÙNG `DateTime.Now`, `DateTime.UtcNow`, hay `Random` không có fixed seed trong logic giao dịch. Hãy dùng `Bars.OpenTimes.Last(1)` hoặc thời gian từ Server (`Server.Time`).
- **Giữ OnTick cực mỏng:** Không nhồi nhét vòng lặp nặng, gọi network, hay tạo object liên tục trong `OnTick()`. Ưu tiên sử dụng `OnBar()` (chạy theo nến đóng) cho các chiến lược Swing/Intraday.

## 1. Tách biệt tuyệt đối Core Logic và Chart UI
Sự khác biệt giữa Visual và Non-Visual xảy ra 99% từ đây.
- **KHÔNG DÙNG đối tượng `Chart` để lấy dữ liệu giao dịch:** Tính toán Cản/Hỗ trợ bằng toán học (`Bars.HighPrices`). Chỉ dùng `Chart` để vẽ debug.
- Trong chế độ Non-Visual hoặc Optimization, `Chart` có thể là `null`. Luôn bọc: `if (IsBacktesting && !IsVisualMode) return;`

## 2. Truy xuất Dữ liệu Nến & Chỉ báo đúng cách
- **Tránh dùng `LastValue` trong điều kiện vào lệnh:** `LastValue` lấy nến đang chạy, dễ sinh ra tín hiệu Repaint.
- **Quy tắc Bar Đóng:** Để lấy nến đã đóng, dùng `myIndicator.Result.Last(1)` hoặc `Bars.ClosePrices.Last(1)`.

## 3. Quản lý Quá trình Khởi tạo & Phục hồi trạng thái (State Recovery)
cTrader tái sử dụng bộ nhớ (.NET AppDomain) giữa các lần chạy Backtest.
- **Không dùng biến `static` để lưu trạng thái Bot:** Nó sẽ rò rỉ dữ liệu qua các lần test. Dùng biến instance bình thường.
- **Khởi tạo sạch trong `OnStart()`:** Xóa List, Dictionary, Reset cờ.
- **Xử lý Restart (VPS reboot / cTrader update):** Bot không được mặc định là "chưa có lệnh nào". Khi chạy lên, phải dùng `Positions.FindAll("MagicLabel", SymbolName)` để móc nối lại với các lệnh cũ đang mở.

## 4. Quản lý Rủi Ro (Risk Management) - BẮT BUỘC
- **Luôn có Stop Loss Server-side:** Không bao giờ để lệnh trần phụ thuộc vào vòng lặp `OnTick()` để thoát lệnh, vì mất mạng = cháy tài khoản.
- **Tính Volume theo % Risk (Không fix Lot cứng):** 
  - Volume = `(Balance * RiskPercent) / (StopLossPips * PipValuePerUnit)`
  - Sử dụng `Symbol.QuantityToVolumeInUnits()` và chuẩn hóa theo `Symbol.VolumeInUnitsStep`.
- **Giới hạn Lỗ (Daily Loss Limit):** Có cơ chế Kill-Switch (tự dừng trade trong ngày) nếu Max Drawdown vượt ngưỡng.

## 5. Xử lý Lệnh (Trade Execution) & Mã lỗi Async
- **Luôn kiểm tra TradeResult:** `if (!result.IsSuccessful) { Print(result.Error); }`
- **Kiểm tra Spread trước khi vào lệnh:** Không vào lệnh khi spread giãn quá mức cho phép.
- **Phân loại lệnh (Magic Label):** Mỗi cBot phải có một `Label` riêng biệt để lọc lệnh.

## 6. Advanced Architecture & Quant Discipline (Đỉnh cao cTrader)
Đây là các quy tắc dành cho hệ thống Live/HFT và bot phức tạp (tổng hợp từ bug reports của cTrader v5+):
- **Race Conditions & Event Overlap:** Không dùng trực tiếp `Positions.Count` hay `PendingOrders.Count` làm điều kiện trong `OnTick()`. Events (`Positions_Opened`, v.v.) có thể fire lệch thứ tự hoặc overlap. Hãy dùng **Cờ trạng thái (Flags)** nội bộ (VD: `_isOrderPending`) để kiểm soát luồng.
- **Thread-Safety:** Khi gọi HTTP request, Python inference (ML Bot), kết quả trả về thường nằm ở Thread phụ. BẮT BUỘC phải bọc hàm cập nhật logic/gọi API bằng `BeginInvokeOnMainThread(() => { ... })`. Nếu không bot sẽ crash ngầm.
- **Server-Side Protection API (v5.9+):** Ưu tiên dùng `RelativeStopLossProtection`, `RelativeTakeProfitProtection`, và Break-Even của cTrader API thay vì tự viết vòng lặp `OnTick()` để kéo SL. Protection do Server nắm giữ sẽ sống sót qua VPS reboot.
- **Backtest Engine vs Optimization Engine:** cTrader sử dụng 2 engine tách biệt cho Non-visual Backtest và Optimization. Đừng vội tin số liệu Optimize nếu chưa chạy lại Non-visual Backtest để Cross-check.
- **Idempotent State & Time gating:** Khi check qua ngày mới, LUÔN dùng toán tử `>=` thay vì `==` (VD: `if (barTime >= nextSessionTime)`). Lọt tick (Miss tick) rất hay xảy ra lúc nửa đêm khi thanh khoản mỏng, dùng `==` sẽ khiến bot bỏ qua cả một ngày giao dịch.

---

## 7. Mẫu Khởi Tạo (Skeleton Template)
Khi tạo cBot mới, HÃY SỬ DỤNG bộ khung chuẩn trong file `SafeCbotTemplate.cs` đi kèm với kỹ năng này. Bộ khung đã xử lý trọn vẹn:
- Tham số hóa Risk, Logic phân loại lệnh bằng MagicLabel.
- Flag-based Event Handling để tránh Race Condition.
- Tính Lot theo % Risk và kiểm tra Spread an toàn.
- Demo mẫu cách đẩy luồng Thread-safe (`BeginInvokeOnMainThread`).
