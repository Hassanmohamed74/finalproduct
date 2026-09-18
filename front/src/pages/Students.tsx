import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { studentsApi } from "@/api/students";
import { branchesApi } from "@/api/branches";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import type { Student, Branch, Group, Certificate, Payment, LevelHistory, Attendance } from "@/types";
import {
  Search, Filter, Eye, Pencil, ChevronLeft, Mail, Phone, MapPin,
  Calendar, GraduationCap, CreditCard, Award, Clock, CheckCircle2,
  AlertTriangle, UserCheck, BookOpen
} from "lucide-react";

const updateStudentSchema = z.object({
  first_name: z.string().min(1, "Required"),
  last_name: z.string().min(1, "Required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  national_id: z.string().optional(),
  date_of_birth: z.string().optional(),
  branch_id: z.string().optional(),
  status: z.string().optional(),
  current_level: z.string().optional(),
});

type UpdateStudentForm = z.infer<typeof updateStudentSchema>;

export default function StudentsPage() {
  const { t } = useTranslation("common");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { confirm, dialog } = useConfirm();

  const [view, setView] = useState<"list" | "detail">("list");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [branchId, setBranchId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedBranchId, setAppliedBranchId] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("");
  const [showEditForm, setShowEditForm] = useState(false);

  const {
    data: students,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["students", appliedSearch, appliedBranchId, appliedStatus],
    queryFn: () => studentsApi.findAll({
      search: appliedSearch || undefined,
      branchId: appliedBranchId || undefined,
      status: appliedStatus || undefined,
    }),
  });

  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: branchesApi.findAll,
  });

  const { data: selectedStudent } = useQuery({
    queryKey: ["student", selectedStudentId],
    queryFn: () => studentsApi.findOne(selectedStudentId!),
    enabled: !!selectedStudentId && view === "detail",
  });

  const { data: studentGroups } = useQuery({
    queryKey: ["student-groups", selectedStudentId],
    queryFn: () => studentsApi.getGroups(selectedStudentId!),
    enabled: !!selectedStudentId && view === "detail",
  });

  const { data: studentCertificates } = useQuery({
    queryKey: ["student-certificates", selectedStudentId],
    queryFn: () => studentsApi.getCertificates(selectedStudentId!),
    enabled: !!selectedStudentId && view === "detail",
  });

  const { data: studentPayments } = useQuery({
    queryKey: ["student-payments", selectedStudentId],
    queryFn: () => studentsApi.getPayments(selectedStudentId!),
    enabled: !!selectedStudentId && view === "detail",
  });

  const { data: studentAttendance } = useQuery({
    queryKey: ["student-attendance", selectedStudentId],
    queryFn: () => studentsApi.getAttendance(selectedStudentId!),
    enabled: !!selectedStudentId && view === "detail",
  });

  const { data: levelHistory } = useQuery({
    queryKey: ["student-level-history", selectedStudentId],
    queryFn: () => studentsApi.getLevelHistory(selectedStudentId!),
    enabled: !!selectedStudentId && view === "detail",
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateStudentForm }) => studentsApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["student", selectedStudentId] });
      toast({ title: "Student updated successfully" });
      setShowEditForm(false);
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<UpdateStudentForm>({
    resolver: zodResolver(updateStudentSchema),
  });

  const handleSearch = () => {
    setAppliedSearch(search);
    setAppliedBranchId(branchId);
    setAppliedStatus(statusFilter);
  };

  const handleClear = () => {
    setSearch("");
    setBranchId("");
    setStatusFilter("");
    setAppliedSearch("");
    setAppliedBranchId("");
    setAppliedStatus("");
  };

  const startEdit = (student: Student) => {
    setShowEditForm(true);
    setValue("first_name", student.first_name);
    setValue("last_name", student.last_name);
    setValue("email", student.email || "");
    setValue("phone", student.phone || "");
    setValue("address", student.address || "");
    setValue("emergency_contact_name", student.emergency_contact_name || "");
    setValue("emergency_contact_phone", student.emergency_contact_phone || "");
    setValue("national_id", student.national_id || "");
    setValue("date_of_birth", student.date_of_birth || "");
    setValue("branch_id", student.branch_id || "");
    setValue("status", student.status || "active");
    setValue("current_level", student.current_level || "");
  };

  const onUpdateSubmit = (data: UpdateStudentForm) => {
    if (selectedStudent) {
      updateMutation.mutate({ id: selectedStudent.id, dto: data });
    }
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (row: Student) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.photo_url} />
            <AvatarFallback className="text-xs">{row.first_name[0]}{row.last_name[0]}</AvatarFallback>
          </Avatar>
          <span>{row.first_name} {row.last_name}</span>
        </div>
      ),
    },
    { key: "email", header: "Email", sortable: true },
    { key: "phone", header: "Phone", sortable: true },
    {
      key: "current_level",
      header: "Level",
      render: (row: Student) => (
        <Badge variant="secondary">{row.current_level || "—"}</Badge>
      ),
    },
    {
      key: "branch",
      header: "Branch",
      render: (row: Student) => (
        <span className="text-xs text-muted-foreground">{row.branch?.name || "—"}</span>
      ),
    },
    {
      key: "status",
      header: t("common.status"),
      render: (row: Student) => (
        <Badge className={row.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
          {row.status || "active"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: t("common.actions"),
      render: (row: Student) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setSelectedStudentId(row.id); setView("detail"); }}>
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Detail View
  if (view === "detail" && selectedStudent) {
    return (
      <div className="space-y-6">
        {dialog}
        <Button variant="outline" onClick={() => { setView("list"); setSelectedStudentId(null); setShowEditForm(false); }} className="gap-2">
          <ChevronLeft className="h-4 w-4" /> Back to Students
        </Button>

        {/* Profile Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          <Avatar className="h-20 w-20">
            <AvatarImage src={selectedStudent.photo_url} />
            <AvatarFallback className="text-2xl">{selectedStudent.first_name[0]}{selectedStudent.last_name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{selectedStudent.first_name} {selectedStudent.last_name}</h1>
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
              {selectedStudent.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {selectedStudent.email}</span>}
              {selectedStudent.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {selectedStudent.phone}</span>}
              {selectedStudent.address && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {selectedStudent.address}</span>}
            </div>
            <div className="flex gap-2 mt-3">
              <Badge className={selectedStudent.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                {selectedStudent.status || "active"}
              </Badge>
              {selectedStudent.current_level && (
                <Badge variant="secondary">{selectedStudent.current_level}</Badge>
              )}
            </div>
          </div>
          <Button onClick={() => startEdit(selectedStudent)}><Pencil className="h-4 w-4 mr-2" /> Edit Profile</Button>
        </div>

        {/* Edit Form */}
        {showEditForm && (
          <Card>
            <CardHeader><CardTitle>Edit Student Profile</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onUpdateSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>First Name *</Label>
                    <Input {...register("first_name")} />
                    {errors.first_name && <p className="text-sm text-destructive">{errors.first_name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name *</Label>
                    <Input {...register("last_name")} />
                    {errors.last_name && <p className="text-sm text-destructive">{errors.last_name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" {...register("email")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input {...register("phone")} />
                  </div>
                  <div className="space-y-2">
                    <Label>National ID</Label>
                    <Input {...register("national_id")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input type="date" {...register("date_of_birth")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Branch</Label>
                    <select {...register("branch_id")} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                      <option value="">Select branch</option>
                      {branches?.map((b: Branch) => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <select {...register("status")} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                      <option value="graduated">Graduated</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Current Level</Label>
                    <Input {...register("current_level")} placeholder="e.g. A1, B2" />
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <Label>Address</Label>
                    <Input {...register("address")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Emergency Contact Name</Label>
                    <Input {...register("emergency_contact_name")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Emergency Contact Phone</Label>
                    <Input {...register("emergency_contact_phone")} />
                  </div>
                </div>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowEditForm(false)} className="ml-2">Cancel</Button>
              </form>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="groups">Groups ({studentGroups?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="payments">Payments ({studentPayments?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="certificates">Certificates ({studentCertificates?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="levels">Level History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-green-50 p-2"><UserCheck className="h-4 w-4 text-green-600" /></div>
                    <div>
                      <p className="text-xs text-muted-foreground">Attendance Rate</p>
                      <p className="text-lg font-bold">{selectedStudent.attendance_summary?.attendance_rate ?? 0}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-50 p-2"><BookOpen className="h-4 w-4 text-blue-600" /></div>
                    <div>
                      <p className="text-xs text-muted-foreground">Enrolled Groups</p>
                      <p className="text-lg font-bold">{studentGroups?.length ?? 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-purple-50 p-2"><Award className="h-4 w-4 text-purple-600" /></div>
                    <div>
                      <p className="text-xs text-muted-foreground">Certificates</p>
                      <p className="text-lg font-bold">{studentCertificates?.length ?? 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-orange-50 p-2"><CreditCard className="h-4 w-4 text-orange-600" /></div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Payments</p>
                      <p className="text-lg font-bold">{studentPayments?.length ?? 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact & Emergency */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-base">Contact Information</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Email:</span><span>{selectedStudent.email || "—"}</span>
                    <span className="text-muted-foreground">Phone:</span><span>{selectedStudent.phone || "—"}</span>
                    <span className="text-muted-foreground">National ID:</span><span>{selectedStudent.national_id || "—"}</span>
                    <span className="text-muted-foreground">Date of Birth:</span><span>{selectedStudent.date_of_birth ? new Date(selectedStudent.date_of_birth).toLocaleDateString() : "—"}</span>
                    <span className="text-muted-foreground">Address:</span><span>{selectedStudent.address || "—"}</span>
                    <span className="text-muted-foreground">Branch:</span><span>{selectedStudent.branch?.name || "—"}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Emergency Contact</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Name:</span><span>{selectedStudent.emergency_contact_name || "—"}</span>
                    <span className="text-muted-foreground">Phone:</span><span>{selectedStudent.emergency_contact_phone || "—"}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="groups" className="space-y-4">
            {studentGroups && studentGroups.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {studentGroups.map((group: Group) => (
                  <Card key={group.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{group.name}</p>
                          <p className="text-sm text-muted-foreground">{group.course?.name || "—"}</p>
                          <p className="text-xs text-muted-foreground">{group.branch?.name || "—"}</p>
                        </div>
                        <Badge>{group.status || "active"}</Badge>
                      </div>
                      {group.start_date && (
                        <p className="text-xs text-muted-foreground mt-2">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {new Date(group.start_date).toLocaleDateString()} — {group.end_date ? new Date(group.end_date).toLocaleDateString() : "Ongoing"}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">Not enrolled in any groups.</div>
            )}
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            {selectedStudent.attendance_summary && (
              <div className="grid gap-4 md:grid-cols-4">
                <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Total Sessions</p><p className="text-2xl font-bold">{selectedStudent.attendance_summary.total_sessions}</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground text-green-600">Present</p><p className="text-2xl font-bold text-green-600">{selectedStudent.attendance_summary.present}</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground text-red-600">Absent</p><p className="text-2xl font-bold text-red-600">{selectedStudent.attendance_summary.absent}</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground text-yellow-600">Late</p><p className="text-2xl font-bold text-yellow-600">{selectedStudent.attendance_summary.late}</p></CardContent></Card>
              </div>
            )}
            {studentAttendance && studentAttendance.length > 0 ? (
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted"><tr><th className="px-4 py-2 text-left">Session</th><th className="px-4 py-2 text-left">Date</th><th className="px-4 py-2 text-left">Status</th><th className="px-4 py-2 text-left">Method</th></tr></thead>
                  <tbody>
                    {studentAttendance.map((a: Attendance) => (
                      <tr key={a.id} className="border-t">
                        <td className="px-4 py-2">{a.session_id}</td>
                        <td className="px-4 py-2">{a.check_in_time ? new Date(a.check_in_time).toLocaleString() : "—"}</td>
                        <td className="px-4 py-2"><Badge className={a.status === "present" ? "bg-green-100 text-green-800" : a.status === "absent" ? "bg-red-100 text-red-800" : a.status === "late" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}>{a.status}</Badge></td>
                        <td className="px-4 py-2 text-xs text-muted-foreground">{a.check_in_method || "manual"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No attendance records found.</div>
            )}
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            {studentPayments && studentPayments.length > 0 ? (
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted"><tr><th className="px-4 py-2 text-left">Invoice</th><th className="px-4 py-2 text-left">Amount</th><th className="px-4 py-2 text-left">Method</th><th className="px-4 py-2 text-left">Status</th><th className="px-4 py-2 text-left">Date</th></tr></thead>
                  <tbody>
                    {studentPayments.map((p: Payment) => (
                      <tr key={p.id} className="border-t">
                        <td className="px-4 py-2">{p.invoice_id}</td>
                        <td className="px-4 py-2 font-medium">{p.amount} {p.currency}</td>
                        <td className="px-4 py-2 text-xs capitalize">{p.method}</td>
                        <td className="px-4 py-2"><Badge className={p.status === "completed" ? "bg-green-100 text-green-800" : p.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>{p.status}</Badge></td>
                        <td className="px-4 py-2 text-xs">{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No payment records found.</div>
            )}
          </TabsContent>

          <TabsContent value="certificates" className="space-y-4">
            {studentCertificates && studentCertificates.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {studentCertificates.map((cert: Certificate) => (
                  <Card key={cert.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Award className="h-8 w-8 text-primary" />
                        <div>
                          <p className="font-medium">Certificate #{cert.verification_code}</p>
                          <p className="text-xs text-muted-foreground">Issued: {new Date(cert.issued_at).toLocaleDateString()}</p>
                          <Badge className="mt-1">{cert.status}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No certificates earned yet.</div>
            )}
          </TabsContent>

          <TabsContent value="levels" className="space-y-4">
            {levelHistory && levelHistory.length > 0 ? (
              <div className="space-y-3">
                {levelHistory.map((lh: LevelHistory, idx: number) => (
                  <Card key={lh.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                          {levelHistory.length - idx}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Level {lh.level}</p>
                          <p className="text-xs text-muted-foreground">Assigned: {new Date(lh.assigned_date).toLocaleDateString()}</p>
                          {lh.reason && <p className="text-xs text-muted-foreground">Reason: {lh.reason}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No level history available.</div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-6">
      {dialog}
      <h1 className="text-2xl font-bold tracking-tight">{t("nav.students")}</h1>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-end">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">{t("common.search")}</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name, email, or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
          </div>
        </div>
        <div className="w-full space-y-2 md:w-48">
          <label className="text-sm font-medium">Branch</label>
          <select value={branchId} onChange={(e) => setBranchId(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">All branches</option>
            {branches?.map((b: Branch) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className="w-full space-y-2 md:w-40">
          <label className="text-sm font-medium">Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="graduated">Graduated</option>
          </select>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSearch}><Filter className="mr-2 h-4 w-4" />{t("common.filter")}</Button>
          <Button variant="outline" onClick={handleClear}>Clear</Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={students || []}
        isLoading={isLoading}
        isError={isError}
        errorMessage={(error as Error)?.message}
        onRetry={refetch}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => { setSelectedStudentId(row.id); setView("detail"); }}
        pageSize={10}
      />
    </div>
  );
}
