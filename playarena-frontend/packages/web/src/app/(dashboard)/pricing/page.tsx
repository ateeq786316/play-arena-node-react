"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@playarena/shared/api";
import type { Ground, PricingRule, Coupon, HolidayPricing } from "@playarena/shared/types";

export default function PricingPage() {
  const [grounds, setGrounds] = useState<Ground[]>([]);
  const [selectedGround, setSelectedGround] = useState("");
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"rules" | "coupons">("rules");

  // New rule form
  const [ruleName, setRuleName] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [multiplier, setMultiplier] = useState("1.00");
  const [priority, setPriority] = useState("0");

  // New coupon form
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("10");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api.get<{ grounds: Ground[] }>("/api/grounds/my")
      .then((res) => {
        setGrounds(res.grounds);
        if (res.grounds.length) setSelectedGround(res.grounds[0].id);
      })
      .catch(() => {});
  }, []);

  const fetchPricing = useCallback(() => {
    if (!selectedGround) return;
    Promise.all([
      api.get<{ rules: PricingRule[]; holidays: HolidayPricing[] }>(`/api/pricing/ground/${selectedGround}/rules`),
      api.get<{ coupons: Coupon[] }>(`/api/pricing/ground/${selectedGround}/coupons`),
    ])
      .then(([rulesRes, couponsRes]) => {
        setRules(rulesRes.rules);
        setCoupons(couponsRes.coupons);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedGround]);

  useEffect(() => {
    fetchPricing();
  }, [fetchPricing]);

  const handleCreateRule = async () => {
    if (!ruleName || !multiplier) { alert("Name and multiplier required"); return; }
    setCreating(true);
    try {
      const res = await api.post<{ rule: PricingRule }>("/api/pricing/rules", {
        groundId: selectedGround, name: ruleName,
        dayOfWeek: dayOfWeek ? parseInt(dayOfWeek) : null,
        startTime: startTime || null, endTime: endTime || null,
        multiplier: parseFloat(multiplier), priority: parseInt(priority),
      });
      setRules((prev) => [...prev, res.rule]);
      setRuleName(""); setDayOfWeek(""); setStartTime(""); setEndTime(""); setMultiplier("1.00"); setPriority("0");
    } catch (e) {
      alert("Failed to create rule");
    } finally {
      setCreating(false);
    }
  };

  const handleCreateCoupon = async () => {
    if (!couponCode || !discountPercent) { alert("Code and discount required"); return; }
    setCreating(true);
    try {
      const res = await api.post<{ coupon: Coupon }>("/api/pricing/coupons", {
        groundId: selectedGround, code: couponCode,
        discountPercent: parseInt(discountPercent),
        maxUses: maxUses ? parseInt(maxUses) : null,
        expiresAt: expiresAt || null,
      });
      setCoupons((prev) => [...prev, res.coupon]);
      setCouponCode(""); setDiscountPercent("10"); setMaxUses(""); setExpiresAt("");
    } catch (e) {
      alert("Failed to create coupon");
    } finally {
      setCreating(false);
    }
  };

  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dynamic Pricing</h1>
        <select value={selectedGround} onChange={(e) => { setLoading(true); setSelectedGround(e.target.value); }} className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
          {grounds.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab("rules")} className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${tab === "rules" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>Pricing Rules</button>
        <button onClick={() => setTab("coupons")} className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${tab === "coupons" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>Coupons</button>
      </div>

      {loading ? (
        <div className="h-40 rounded-xl bg-muted animate-pulse" />
      ) : tab === "rules" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <h2 className="font-semibold">Existing Rules</h2>
            {rules.length === 0 ? <p className="text-sm text-muted-foreground">No rules yet.</p> : rules.map((r) => (
              <div key={r.id} className="rounded-lg border border-border bg-background p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{r.name}</span>
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${r.isActive ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>{r.isActive ? "Active" : "Inactive"}</span>
                </div>
                <p className="text-muted-foreground mt-1">{r.dayOfWeek != null ? DAYS[r.dayOfWeek] : "Any day"} {r.startTime}–{r.endTime} ×{r.multiplier}</p>
                <p className="text-xs text-muted-foreground">Priority: {r.priority}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border bg-background p-4 space-y-3">
            <h2 className="font-semibold">New Rule</h2>
            <input type="text" value={ruleName} onChange={(e) => setRuleName(e.target.value)} placeholder="Rule name" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            <select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <option value="">Any day</option>
              {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} placeholder="Start" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} placeholder="End" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" value={multiplier} onChange={(e) => setMultiplier(e.target.value)} step="0.1" min="0.5" max="5" placeholder="Multiplier" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              <input type="number" value={priority} onChange={(e) => setPriority(e.target.value)} min="0" placeholder="Priority" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            </div>
            <button onClick={handleCreateRule} disabled={creating} className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {creating ? "Creating..." : "Create Rule"}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <h2 className="font-semibold">Coupons</h2>
            {coupons.length === 0 ? <p className="text-sm text-muted-foreground">No coupons yet.</p> : coupons.map((c) => (
              <div key={c.id} className="rounded-lg border border-border bg-background p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-medium">{c.code}</span>
                  <span className="text-primary font-semibold">{c.discountPercent}% off</span>
                </div>
                <p className="text-muted-foreground mt-1">Used {c.usedCount}/{c.maxUses || "∞"}</p>
                {c.expiresAt && <p className="text-xs text-muted-foreground">Expires {new Date(c.expiresAt).toLocaleDateString()}</p>}
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border bg-background p-4 space-y-3">
            <h2 className="font-semibold">New Coupon</h2>
            <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="e.g., WEEKEND50" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono" />
            <input type="number" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} min="1" max="100" placeholder="Discount %" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            <input type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} min="1" placeholder="Max uses (leave empty for unlimited)" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            <button onClick={handleCreateCoupon} disabled={creating} className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {creating ? "Creating..." : "Create Coupon"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
