import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { financeApi, downloadBlob } from "@/api/finance";
import { studentsApi } from "@/api/students";
import { branchesApi } from "@/api/branches";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, X, FileDown } from "lucide-react";

export default function FinancePage() {
  const { t } = useTranslation("common");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("invoices");
  const [invForm, setInvForm] = useState({
    show: false, student_id: "", branch_id: "",
    description: "", quantity: 1, unit_price: 0,
    discount_amount: 0, promo_code: "",
  });
  const [payForm, setPayForm] = useState({ show: false, invoice_id: "", amount: 0, method: "CASH", reference: "" });
  const [promoForm, setPromoForm] = useState({ show: false, code: "", type: "percentage", value: 0, expiry_date: "" });
  const [refundForm, setRefundForm] = useState({ show: false, payment_id: "", amount: 0, reason_code: "", reason_note: "" });

  const invQ = useQuery({ queryKey: ["invoices"], queryFn: () => financeApi.listInvoices({ limit: 50 }), enabled: tab === "invoices" });
  const payQ = useQuery({ queryKey: ["payments"], queryFn: () => financeApi.listPayments(), enabled: tab === "payments" });
  const promoQ = useQuery({ queryKey: ["promos"], queryFn: () => financeApi.listPromos(), enabled: tab === "promos" });
  const refundQ = useQuery({ queryKey: ["refunds"], queryFn: () => financeApi.listRefunds(), enabled: tab === "refunds" });
  const ledgerQ = useQuery({ queryKey: ["ledger"], queryFn: () => financeApi.ledger(), enabled: tab === "ledger" });
  const recvQ = useQuery({ queryKey: ["receivables"], queryFn: () => financeApi.receivables(), enabled: tab === "ledger" });
  const { data: students } = useQuery({ queryKey: ["students"], queryFn: () => studentsApi.findAll() });
  const { data: branches } = useQuery({ queryKey: ["branches"], queryFn: () => branchesApi.findAll() });

  const invM = useMutation({
    mutationFn: () => financeApi.createInvoice({
      student_id: invForm.student_id, branch_id: invForm.branch_id,
      items: [{ description: invForm.description, quantity: Number(invForm.quantity), unit_price: Number(invForm.unit_price) }],
      discount_amount: Number(invForm.discount_amount) || undefined,
      promo_code: invForm.promo_code || undefined,
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["invoices"] }); setInvForm({ ...invForm, show: false }); toast({ title: t("common.success") }); },
    onError: (e: any) => toast({ variant: "destructive", title: t("common.error"), description: e.message }),
  });
  const payM = useMutation({
    mutationFn: () => financeApi.recordPayment({
      invoice_id: payForm.invoice_id, amount: Number(payForm.amount),
      method: payForm.method as "CASH" | "BANK_TRANSFER" | "EASYKASH", reference: payForm.reference || undefined,
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["payments"] }); queryClient.invalidateQueries({ queryKey: ["invoices"] }); setPayForm({ ...payForm, show: false }); toast({ title: t("common.success") }); },
    onError: (e: any) => toast({ variant: "destructive", title: t("common.error"), description: e.message }),
  });
  const promoM = useMutation({
    mutationFn: () => financeApi.createPromo({
      code: promoForm.code, type: promoForm.type as "percentage" | "fixed",
      value: Number(promoForm.value), expiry_date: promoForm.expiry_date,
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["promos"] }); setPromoForm({ ...promoForm, show: false }); toast({ title: t("common.success") }); },
    onError: (e: any) => toast({ variant: "destructive", title: t("common.error"), description: e.message }),
  });
  const refundM = useMutation({
    mutationFn: () => financeApi.createRefund({
      payment_id: refundForm.payment_id, amount: Number(refundForm.amount),
      reason_code: refundForm.reason_code, reason_note: refundForm.reason_note || undefined,
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["refunds"] }); setRefundForm({ ...refundForm, show: false }); toast({ title: t("common.success") }); },
    onError: (e: any) => toast({ variant: "destructive", title: t("common.error"), description: e.message }),
  });
