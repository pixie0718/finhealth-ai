import React, { useState } from "react";
import { recordOutcome } from "../api/client";

const OUTCOMES = [
  { value:"active",   label:"Active Loan",     icon:"🔵", color:"#3b82f6", desc:"Loan disbursed, repayments ongoing"       },
  { value:"repaid",   label:"Fully Repaid",     icon:"✅", color:"#22c55e", desc:"Loan closed successfully"                 },
  { value:"npa",      label:"NPA / Default",    icon:"🔴", color:"#ef4444", desc:"Account classified as non-performing"     },
  { value:"rejected", label:"Application Rejected", icon:"⛔", color:"#f97316", desc:"Loan not disbursed after review"    },
];

const PRODUCTS = ["MSME Loan","Working Capital","Business Loan","Personal Loan","Auto Loan","Home Loan",
                  "MUDRA Shishu","MUDRA Kishore","MUDRA Tarun","CGTMSE Backed","Stand-Up India"];

export default function OutcomeModal({ data, onClose, onSaved }) {
  const [selected, setSelected] = useState(null);
  const [product, setProduct] = useState(PRODUCTS[0]);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const inp = {
    width:"100%", background:"#0f172a", border:"1px solid #334155",
    borderRadius:10, padding:"10px 14px", color:"#f1f5f9",
    fontSize:13, outline:"none", boxSizing:"border-box",
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await recordOutcome(data.msme_id, {
        outcome: selected,
        loan_product: product,
        loan_amount: amount ? parseFloat(amount) : null,
        banker_notes: notes,
      });
      onSaved && onSaved(selected);
      onClose();
    } catch (e) {
      alert("Failed to record outcome");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:200,
      background:"#000000bb", display:"flex",
      alignItems:"center", justifyContent:"center", padding:20,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background:"#1e293b", border:"1px solid #334155",
        borderRadius:24, padding:28, width:"100%", maxWidth:480,
      }}>
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:11, color:"#475569", letterSpacing:1.5, marginBottom:4 }}>
            LOAN OUTCOME TRACKING
          </div>
          <div style={{ fontSize:18, fontWeight:700, color:"#f1f5f9" }}>
            Record Outcome
          </div>
          <div style={{ fontSize:12, color:"#64748b", marginTop:4 }}>
            {data.business_name} · {data.pillar_scores?.overall} score · {data.loan_eligibility?.risk_band} risk
          </div>
        </div>

        {/* Outcome selector */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:18 }}>
          {OUTCOMES.map(o => (
            <button key={o.value} onClick={() => setSelected(o.value)} style={{
              padding:"12px", borderRadius:12, cursor:"pointer", textAlign:"left",
              background: selected === o.value ? `${o.color}18` : "#0f172a",
              border: selected === o.value ? `1.5px solid ${o.color}` : "1px solid #334155",
            }}>
              <div style={{ fontSize:18, marginBottom:4 }}>{o.icon}</div>
              <div style={{ fontSize:12, fontWeight:700,
                color: selected === o.value ? o.color : "#f1f5f9" }}>{o.label}</div>
              <div style={{ fontSize:10, color:"#475569", marginTop:2 }}>{o.desc}</div>
            </button>
          ))}
        </div>

        {/* Product + Amount */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
          <div>
            <div style={{ fontSize:11, color:"#64748b", marginBottom:6 }}>LOAN PRODUCT</div>
            <select value={product} onChange={e => setProduct(e.target.value)} style={inp}>
              {PRODUCTS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize:11, color:"#64748b", marginBottom:6 }}>LOAN AMOUNT (₹)</div>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="e.g. 500000" style={inp} />
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:11, color:"#64748b", marginBottom:6 }}>BANKER NOTES (optional)</div>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            rows={2} placeholder="Any observations about this case…"
            style={{ ...inp, resize:"vertical", fontFamily:"inherit" }} />
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <button onClick={onClose} style={{
            padding:"13px", background:"transparent", border:"1px solid #334155",
            borderRadius:12, color:"#64748b", fontSize:14, cursor:"pointer",
          }}>Cancel</button>
          <button onClick={handleSave} disabled={!selected || saving} style={{
            padding:"13px",
            background: selected && !saving ? "linear-gradient(135deg, #3b82f6, #6366f1)" : "#334155",
            border:"none", borderRadius:12,
            color: selected && !saving ? "#fff" : "#475569",
            fontSize:14, fontWeight:700, cursor: selected ? "pointer" : "not-allowed",
          }}>{saving ? "Saving…" : "Save Outcome"}</button>
        </div>
      </div>
    </div>
  );
}
