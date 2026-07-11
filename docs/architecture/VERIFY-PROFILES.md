# Verify profiles — Iron Law (ea-kit)

Agent **không** được claim “done / fixed / compiled OK” nếu thiếu evidence theo profile.

Tham chiếu harness: `DESIGN-agent-harness.md` · rules: `.agents/rules/GEMINI.md`

---

## Cách chọn profile

| Tình huống | Profile |
| ---------- | ------- |
| Sửa `.mq5` / `.mqh` | `mt5-code` |
| Sửa cBot C# | `cbot-code` |
| Chỉ đọc journal / Strategy Tester / đề xuất | `analyze-only` |
| README, ADR, PRD polish (user xin docs) | `docs-only` |
| Sửa chính repo ea-kit | `kit-meta` |

Ghi trong header harness hoặc HANDOFF: `verify_profile=…`

---

## `mt5-code`

### Checklist

- [ ] Logic khớp plan/HANDOFF (nếu có)
- [ ] `ArraySetAsSeries` đúng cho buffer/series dùng như timeseries
- [ ] **RWCommon (flexible):**
  - `required` → trade/risk/trailing qua module RWCommon; không `OrderSend` raw trừ gap đã note
  - `optional` / `forbidden` → native OK; vẫn có SL/volume chuẩn, retcode
- [ ] Mọi lệnh/sửa lệnh: kiểm tra retcode (10016, 4756, 10013, …)
- [ ] Pip/point không trộn thiếu chuẩn hoá; tôn trọng StopsLevel/FreezeLevel
- [ ] Không spam `OrderModify` / vòng lặp OnTick nguy hiểm

### Evidence compile

1. **Có tooling:** chạy compile (MetaEditor / script project) → dán output.  
2. **Không có tooling:** `VERIFY=MANUAL` và tick checklist trên — **cấm** viết “compile thành công”.

---

## `cbot-code`

### Checklist

- [ ] Tuân `cbot-clean-code` (namespace, Parameter, lifecycle)
- [ ] `Symbol.PipSize` / volume / SL TP đúng convention cTrader
- [ ] Thời gian backtest: `Server.Time` (không Stopwatch cho logic bar)
- [ ] Migration từ MT5 (nếu có): đã đối chiếu skill migration

### Evidence build

1. `dotnet build` / pipeline project nếu có → dán output.  
2. Không có → `VERIFY=MANUAL` + checklist — không claim build OK.

---

## `analyze-only`

- [ ] Nêu file report/log đã đọc
- [ ] Liệt kê findings (mã lỗi, DD, PF, spam modify…)
- [ ] Nếu cần fix code → tạo **HANDOFF** sang dev (không tự nhảy persona im lặng)

Không bắt compile.

---

## `docs-only`

- [ ] Path dưới `docs/{version}/…` hoặc README EA đúng `documentation-standards`
- [ ] Không invent strategy rules chưa được user/strategist chốt

---

## `kit-meta`

- [ ] `npm test` (verify-kit) pass trong session
- [ ] Không ship monorepo ghosts / skill gãy

---

## Công thức claim

| Được nói | Điều kiện |
| -------- | --------- |
| “Đã sửa logic X” | Diff/files + checklist profile |
| “Compile/build OK” | Có log lệnh thật |
| “VERIFY=MANUAL — checklist đã tick” | Không tooling; user biết giới hạn |
| “Nên work” không evidence | **Cấm** |
