import React, { useEffect, useState } from 'react';
import { attendanceApi } from '@/services/attendanceApi';
import {
  Building2,
  Plus,
  KeyRound,
  Edit2,
  Users,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Search,
  X,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';

export const CollegeManagement: React.FC = () => {
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add College Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    collegeId: '',
    collegeName: '',
    collegeEmail: '',
    collegeAddress: '',
    contactNumber: '',
    collegeSecretCode: '',
  });

  // Edit College Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCollege, setEditCollege] = useState<any>(null);

  // Associated details modal
  const [viewAssociatedModal, setViewAssociatedModal] = useState(false);
  const [selectedCollegeForView, setSelectedCollegeForView] = useState<any>(null);
  const [associatedAdmins, setAssociatedAdmins] = useState<any[]>([]);
  const [associatedStudents, setAssociatedStudents] = useState<any[]>([]);
  const [loadingAssociated, setLoadingAssociated] = useState(false);

  const fetchColleges = async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.getColleges();
      if (res.success) {
        setColleges(res.colleges);
      }
    } catch (err: any) {
      toast.error('Failed to load colleges: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  const handleAddCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.collegeName || !addForm.collegeEmail || !addForm.collegeSecretCode) {
      toast.error('College Name, Email, and Secret Code are required.');
      return;
    }

    try {
      const res = await attendanceApi.addCollege(addForm);
      if (res.success) {
        toast.success('College registered successfully!');
        setShowAddModal(false);
        setAddForm({
          collegeId: '',
          collegeName: '',
          collegeEmail: '',
          collegeAddress: '',
          contactNumber: '',
          collegeSecretCode: '',
        });
        fetchColleges();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to add college.');
    }
  };

  const handleUpdateCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCollege) return;

    try {
      const res = await attendanceApi.updateCollege(editCollege._id, editCollege);
      if (res.success) {
        toast.success('College updated successfully!');
        setShowEditModal(false);
        setEditCollege(null);
        fetchColleges();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update college.');
    }
  };

  const handleToggleStatus = async (college: any) => {
    const newStatus = college.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await attendanceApi.updateCollege(college._id, { status: newStatus });
      if (res.success) {
        toast.success(`College set to ${newStatus}.`);
        fetchColleges();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status.');
    }
  };

  const handleViewAssociated = async (college: any) => {
    setSelectedCollegeForView(college);
    setViewAssociatedModal(true);
    setLoadingAssociated(true);
    try {
      const [adminsRes, studentsRes] = await Promise.all([
        attendanceApi.getAdmins(),
        attendanceApi.getStudents({ collegeName: college.collegeName }),
      ]);
      if (adminsRes.success) {
        setAssociatedAdmins(adminsRes.admins.filter((a: any) => a.collegeId === college.collegeId));
      }
      if (studentsRes.success) {
        setAssociatedStudents(studentsRes.students.filter((s: any) => s.collegeId === college.collegeId));
      }
    } catch (err: any) {
      toast.error('Failed to load associated records.');
    } finally {
      setLoadingAssociated(false);
    }
  };

  const filteredColleges = colleges.filter(
    (col) =>
      col.collegeName.toLowerCase().includes(search.toLowerCase()) ||
      col.collegeId.toLowerCase().includes(search.toLowerCase()) ||
      col.collegeSecretCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-600" />
            College Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Register academic colleges, assign unique secret codes, and maintain tenant accounts.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add New College
        </button>
      </div>

      {/* Search Filter */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by College Name, College ID, or Secret Code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden"
        />
      </div>

      {/* Colleges Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">College ID</th>
                <th className="py-3.5 px-4">College Name</th>
                <th className="py-3.5 px-4">Secret Code</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Admins / Students</th>
                <th className="py-3.5 px-4">Registration Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredColleges.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No colleges match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredColleges.map((col) => (
                  <tr key={col._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{col.collegeId}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{col.collegeName}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-xs">{col.collegeAddress}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 tracking-wider">
                        {col.collegeSecretCode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-slate-700">{col.collegeEmail}</p>
                      <p className="text-[11px] text-slate-400">{col.contactNumber}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold">
                          <Users className="w-3 h-3" />
                          {col.adminCount ?? 0}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold">
                          <GraduationCap className="w-3 h-3" />
                          {col.studentCount ?? 0}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {col.registrationDate ? new Date(col.registrationDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(col)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                          col.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        }`}
                        title="Click to toggle status"
                      >
                        {col.status === 'active' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewAssociated(col)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            setEditCollege(col);
                            setShowEditModal(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                          title="Edit college"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add College Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Add New College
            </h2>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Unique College Secret Code is required for administrator and student registration.
            </p>

            <form onSubmit={handleAddCollege} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">College ID</label>
                  <input
                    type="text"
                    placeholder="e.g. COL-103"
                    value={addForm.collegeId}
                    onChange={(e) => setAddForm({ ...addForm, collegeId: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-700 mb-1 flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                    Secret Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STANFORD2026"
                    value={addForm.collegeSecretCode}
                    onChange={(e) => setAddForm({ ...addForm, collegeSecretCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-amber-50/50 border border-amber-300 rounded-xl text-xs font-mono font-bold tracking-wider text-amber-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">College Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stanford Technical Institute"
                  value={addForm.collegeName}
                  onChange={(e) => setAddForm({ ...addForm, collegeName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">College Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="contact@college.edu"
                    value={addForm.collegeEmail}
                    onChange={(e) => setAddForm({ ...addForm, collegeEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={addForm.contactNumber}
                    onChange={(e) => setAddForm({ ...addForm, contactNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">College Address</label>
                <textarea
                  rows={2}
                  placeholder="Campus address, city, state"
                  value={addForm.collegeAddress}
                  onChange={(e) => setAddForm({ ...addForm, collegeAddress: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/30 transition-all"
                >
                  Save College
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit College Modal */}
      {showEditModal && editCollege && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-indigo-600" />
              Edit College Details
            </h2>

            <form onSubmit={handleUpdateCollege} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">College Name</label>
                <input
                  type="text"
                  required
                  value={editCollege.collegeName}
                  onChange={(e) => setEditCollege({ ...editCollege, collegeName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">College Email</label>
                  <input
                    type="email"
                    required
                    value={editCollege.collegeEmail}
                    onChange={(e) => setEditCollege({ ...editCollege, collegeEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={editCollege.contactNumber}
                    onChange={(e) => setEditCollege({ ...editCollege, contactNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">College Address</label>
                <textarea
                  rows={2}
                  value={editCollege.collegeAddress}
                  onChange={(e) => setEditCollege({ ...editCollege, collegeAddress: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account Status</label>
                <select
                  value={editCollege.status}
                  onChange={(e) => setEditCollege({ ...editCollege, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                >
                  <option value="active">Active (Operational)</option>
                  <option value="inactive">Inactive (Deactivated)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/30"
                >
                  Update College
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Associated Records Modal */}
      {viewAssociatedModal && selectedCollegeForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setViewAssociatedModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              {selectedCollegeForView.collegeName}
            </h2>
            <p className="text-xs text-slate-500 mt-1 mb-4 flex items-center gap-3">
              <span>ID: <code className="font-bold">{selectedCollegeForView.collegeId}</code></span>
              <span>Code: <code className="font-bold text-amber-700">{selectedCollegeForView.collegeSecretCode}</code></span>
            </p>

            {loadingAssociated ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              </div>
            ) : (
              <div className="space-y-6 text-xs">
                {/* Associated Admins */}
                <div>
                  <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    Associated Administrators ({associatedAdmins.length})
                  </h3>
                  {associatedAdmins.length === 0 ? (
                    <p className="text-slate-400 italic">No college administrators registered yet.</p>
                  ) : (
                    <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                      {associatedAdmins.map((adm) => (
                        <div key={adm._id} className="p-3 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-slate-900">{adm.fullName}</p>
                            <p className="text-[11px] text-slate-500">{adm.email} &bull; ID: {adm.adminId}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            adm.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {adm.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Associated Students */}
                <div>
                  <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                    Enrolled Students ({associatedStudents.length})
                  </h3>
                  {associatedStudents.length === 0 ? (
                    <p className="text-slate-400 italic">No students registered under this code yet.</p>
                  ) : (
                    <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-48 overflow-y-auto">
                      {associatedStudents.map((stu) => (
                        <div key={stu._id} className="p-2.5 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-slate-900">{stu.fullName}</p>
                            <p className="text-[11px] text-slate-500">{stu.email} &bull; ID: {stu.studentId}</p>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(stu.registrationDate).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
