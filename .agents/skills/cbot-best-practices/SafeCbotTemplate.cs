using cAlgo;
using cAlgo.API;
using System;
using System.Linq;

namespace MyBots
{
    [Robot(TimeZone = TimeZones.UTC, AccessRights = AccessRights.None)]
    public class SafeCbotTemplate : Robot
    {
        [Parameter("Magic Label", DefaultValue = "SAFE_BOT_v1", Group = "Identity")]
        public string MagicLabel { get; set; }

        [Parameter("Risk % per trade", DefaultValue = 0.5, MinValue = 0.01, MaxValue = 5, Group = "Risk Management")]
        public double RiskPercent { get; set; }

        [Parameter("Stop Loss pips", DefaultValue = 20, MinValue = 1, Group = "Risk Management")]
        public double StopLossPips { get; set; }

        [Parameter("Take Profit pips", DefaultValue = 40, MinValue = 1, Group = "Risk Management")]
        public double TakeProfitPips { get; set; }

        [Parameter("Max open positions", DefaultValue = 1, MinValue = 1, MaxValue = 20, Group = "Risk Management")]
        public int MaxOpenPositions { get; set; }

        [Parameter("Max spread pips", DefaultValue = 2.0, MinValue = 0.1, Group = "Filters")]
        public double MaxSpreadPips { get; set; }

        [Parameter("Max daily loss %", DefaultValue = 3.0, MinValue = 0.5, Group = "Risk Management")]
        public double MaxDailyLossPercent { get; set; }

        // Flags: Tránh Race Conditions (Không dùng trực tiếp Positions.Count)
        private bool _tradingDisabled;
        private bool _isOrderPending;
        
        private DateTime _currentDay;
        private double _startEquityOfDay;

        protected override void OnStart()
        {
            ValidateParameters();

            _currentDay = DateTime.MinValue;
            _startEquityOfDay = Account.Equity;
            _tradingDisabled = false;
            _isOrderPending = false;

            Print($"START | {MagicLabel} | {SymbolName} | {TimeFrame} | Balance={Account.Balance}");
        }

        protected override void OnBar()
        {
            if (_tradingDisabled) return;
            if (Bars.Count < 200) return;

            UpdateDailyRiskGuard();

            if (_tradingDisabled) return;
            if (!CanTrade()) return;

            // Kiểm tra flag để tránh overlap events thay vì chỉ đếm Positions
            if (_isOrderPending) return;
            
            var myPositions = GetMyPositions();
            if (myPositions.Count >= MaxOpenPositions) return;

            if (HasBuySignal())
            {
                OpenTrade(TradeType.Buy, "BuySignal");
            }
            else if (HasSellSignal())
            {
                OpenTrade(TradeType.Sell, "SellSignal");
            }
        }

        protected override void OnTick()
        {
            // Không nhồi nhét vòng lặp nặng ở đây.
        }

        protected override void OnStop()
        {
            Print($"STOP | {MagicLabel} | {SymbolName} | Equity={Account.Equity}");
        }

        protected override void OnError(Error error)
        {
            Print($"ERROR | Code={error.Code} | {error.Text}");
            // Nuốt exception âm thầm rất nguy hiểm.
            // Có logic xử lý Disconnect / Timeout ở đây.
        }

        private void ValidateParameters()
        {
            if (string.IsNullOrWhiteSpace(MagicLabel)) MagicLabel = "SAFE_BOT";
            if (RiskPercent <= 0) throw new InvalidOperationException("RiskPercent must be > 0.");
            if (StopLossPips <= 0) throw new InvalidOperationException("StopLossPips must be > 0.");
            if (TakeProfitPips <= 0) throw new InvalidOperationException("TakeProfitPips must be > 0.");
        }

        private void UpdateDailyRiskGuard()
        {
            // Gate time theo dấu >= thay vì == để tránh lọt tick nửa đêm
            var barTime = Bars.OpenTimes.Last(1);

            if (barTime.Date > _currentDay)
            {
                _currentDay = barTime.Date;
                _startEquityOfDay = Account.Equity;
                _tradingDisabled = false;
                Print($"NEW_DAY | {_currentDay:yyyy-MM-dd} | StartEquity={_startEquityOfDay}");
            }

            if (_startEquityOfDay <= 0) return;

            var dailyDrawdownPercent = (_startEquityOfDay - Account.Equity) / _startEquityOfDay * 100.0;
            if (dailyDrawdownPercent >= MaxDailyLossPercent)
            {
                _tradingDisabled = true;
                Print($"DAILY_LOSS_GUARD | Drawdown={dailyDrawdownPercent:F2}% | TradingDisabled=true");
            }
        }

        private bool CanTrade()
        {
            if (Symbol.PipSize <= 0) return false;
            var spreadPips = (Symbol.Ask - Symbol.Bid) / Symbol.PipSize;
            return spreadPips <= MaxSpreadPips;
        }

        private System.Collections.Generic.List<Position> GetMyPositions()
        {
            return Positions.Where(p => p.SymbolName == SymbolName && p.Label == MagicLabel).ToList();
        }

        private bool HasBuySignal()
        {
            return Bars.ClosePrices.Last(1) > Bars.ClosePrices.Last(2)
                   && Bars.ClosePrices.Last(2) > Bars.ClosePrices.Last(3);
        }

        private bool HasSellSignal()
        {
            return Bars.ClosePrices.Last(1) < Bars.ClosePrices.Last(2)
                   && Bars.ClosePrices.Last(2) < Bars.ClosePrices.Last(3);
        }

        private void OpenTrade(TradeType tradeType, string reason)
        {
            var volume = CalculateVolumeInUnits(StopLossPips);
            if (volume <= 0) return;

            // Bật cờ để block các event/bar khác trong lúc chờ Server
            _isOrderPending = true;

            var result = ExecuteMarketOrder(tradeType, SymbolName, volume, MagicLabel, StopLossPips, TakeProfitPips);

            if (!result.IsSuccessful)
            {
                Print($"OPEN_FAIL | {reason} | Error={result.Error}");
            }
            else
            {
                var price = tradeType == TradeType.Buy ? Symbol.Ask : Symbol.Bid;
                Print($"OPEN_OK | {reason} | {tradeType} | Volume={volume} | Price={price}");
                
                // Demo Server-side Advanced Protection (cTrader v5.9+)
                // Protection này sống sót qua crash/reboot thay vì tự vòng lặp OnTick kéo SL
                // result.Position.ModifyTrailingStop(true); 
            }

            // Giải phóng cờ
            _isOrderPending = false;
        }

        private long CalculateVolumeInUnits(double stopLossPips)
        {
            if (stopLossPips <= 0 || Account.Balance <= 0) return 0;

            var riskMoney = Account.Balance * RiskPercent / 100.0;
            var pipValuePerUnit = Symbol.PipValue;

            if (pipValuePerUnit <= 0) return 0;

            var units = riskMoney / (stopLossPips * pipValuePerUnit);
            var step = Symbol.VolumeInUnitsStep;

            if (step <= 0) return 0;

            units = Math.Floor(units / step) * step;
            units = Math.Max(units, Symbol.MinVolumeInUnits);
            units = Math.Min(units, Symbol.MaxVolumeInUnits);

            return (long)units;
        }

        // --- Demo mẫu cho việc Thread-Safety (Dành cho Machine Learning/HTTP Bot) ---
        // Khi gọi API bên ngoài (chạy nền), lúc nhận kết quả phải bọc bằng BeginInvokeOnMainThread
        private void ThreadSafeExternalCallDemo()
        {
            System.Threading.Tasks.Task.Run(() =>
            {
                // Giả lập xử lý model AI nặng
                System.Threading.Thread.Sleep(1000); 
                
                BeginInvokeOnMainThread(() =>
                {
                    // Lệnh này mới an toàn tương tác với cAlgo API
                    Print("AI Signal received and processed on Main Thread.");
                });
            });
        }
    }
}
