"use client";

import { useCallback, useEffect, useState } from "react";
import { usersService } from "@/src/services/users.service";
import type { UserSummary } from "@/src/types/Admin";
import { Pagination } from "@/src/components/Pagination";
import { Modal } from "@/src/components/Modal";
import { RoleBadge } from "@/src/components/Badge";
import { Spinner } from "@/src/components/Spinner";

export default function UsersPage() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [role, setRole] = useState("");
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState<"create" | "edit" | null>(null);
  const [editingUser, setEditingUser] = useState<UserSummary | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usersService.findAll({ page, limit: 10, role: role || undefined, query: query || undefined });
      setUsers(res.data);
      setTotal(res.meta.total);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, role, query]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = () => {
    setQuery(searchInput);
    setPage(1);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar al usuario "${name}"? Esta accion eliminara sus prescripciones asociadas.`)) return;
    try {
      await usersService.remove(id);
      load();
    } catch {
      alert("Error al eliminar el usuario");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Usuarios</h1>
          <p className="mt-1 text-sm text-[#A7B8BD]">{total} usuarios registrados</p>
        </div>
        <button
          onClick={() => setShowModal("create")}
          className="rounded-md bg-[#00D9FF] px-4 py-2 text-sm font-semibold text-[#061418] hover:bg-cyan-300 transition"
        >
          + Nuevo usuario
        </button>
      </div>

      <div className="flex gap-3">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
          placeholder="Buscar por nombre o email..."
          className="h-10 flex-1 rounded-md border border-[#1A3A43] bg-black/30 px-3 text-sm text-white outline-none placeholder:text-[#A7B8BD]/70 focus:border-[#00D9FF]"
        />
        <select
          value={role}
          onChange={(e) => { setRole(e.target.value); setPage(1); }}
          className="h-10 rounded-md border border-[#1A3A43] bg-black/30 px-3 text-sm text-white outline-none focus:border-[#00D9FF]"
        >
          <option value="">Todos los roles</option>
          <option value="admin">Admin</option>
          <option value="doctor">Doctor</option>
          <option value="patient">Paciente</option>
        </select>
        <button
          onClick={handleSearch}
          className="h-10 rounded-md bg-[#00D9FF] px-4 text-sm font-semibold text-[#061418] hover:bg-cyan-300 transition"
        >
          Buscar
        </button>
      </div>

      {loading ? (
        <Spinner size={6} />
      ) : users.length === 0 ? (
        <p className="text-sm text-[#A7B8BD] py-10 text-center">Sin resultados</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#1A3A43]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1A3A43] bg-[#11252C]/40">
                <th className="px-4 py-3 text-left font-medium text-[#A7B8BD]">Nombre</th>
                <th className="px-4 py-3 text-left font-medium text-[#A7B8BD]">Email</th>
                <th className="px-4 py-3 text-left font-medium text-[#A7B8BD]">Rol</th>
                <th className="px-4 py-3 text-left font-medium text-[#A7B8BD]">Creado</th>
                <th className="px-4 py-3 text-right font-medium text-[#A7B8BD]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-[#1A3A43] hover:bg-[#11252C]/20">
                  <td className="px-4 py-3 text-white font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-[#A7B8BD]">{u.email}</td>
                  <td className="px-4 py-3">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-4 py-3 text-[#A7B8BD]">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => { setEditingUser(u); setShowModal("edit"); }}
                      className="rounded px-2 py-1 text-sm text-[#00D9FF] hover:bg-[#00D9FF]/10 transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(u.id, u.name)}
                      className="ml-2 rounded px-2 py-1 text-sm text-red-400 hover:bg-red-500/10 transition"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} total={total} limit={10} onChange={setPage} />
        </div>
      )}

      {showModal && (
        <UserModal
          mode={showModal}
          user={editingUser}
          onClose={() => { setShowModal(null); setEditingUser(null); }}
          onSaved={() => { setShowModal(null); setEditingUser(null); load(); }}
        />
      )}
    </div>
  );
}

function UserModal({ mode, user, onClose, onSaved }: { mode: "create" | "edit"; user: UserSummary | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(user?.role ?? "patient");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (mode === "create") {
        if (!password || password.length < 6) { setError("La contrasena debe tener al menos 6 caracteres"); setSaving(false); return; }
        await usersService.create({ name, email, password, role });
      } else {
        await usersService.update(user!.id, { name, email, ...(password ? { password } : {}), role });
      }
      onSaved();
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "data" in err
        ? String((err as { data: { message: string } }).data?.message ?? "Error")
        : "Error al guardar";
      setError(msg);
    } finally { setSaving(false); }
  };

  return (
    <Modal
      title={mode === "create" ? "Nuevo usuario" : "Editar usuario"}
      onClose={onClose}
    >
      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-medium text-[#A7B8BD]">Nombre</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 h-10 w-full rounded-md border border-[#1A3A43] bg-black/30 px-3 text-sm text-white outline-none focus:border-[#00D9FF]" />
        </div>
        <div>
          <label className="text-sm font-medium text-[#A7B8BD]">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" className="mt-1 h-10 w-full rounded-md border border-[#1A3A43] bg-black/30 px-3 text-sm text-white outline-none focus:border-[#00D9FF]" />
        </div>
        <div>
          <label className="text-sm font-medium text-[#A7B8BD]">{mode === "create" ? "Contrasena" : "Contrasena (dejar vacio para mantener)"}</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={mode === "create" ? 6 : undefined} required={mode === "create"} className="mt-1 h-10 w-full rounded-md border border-[#1A3A43] bg-black/30 px-3 text-sm text-white outline-none focus:border-[#00D9FF]" />
        </div>
        <div>
          <label className="text-sm font-medium text-[#A7B8BD]">Rol</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-[#1A3A43] bg-black/30 px-3 text-sm text-white outline-none focus:border-[#00D9FF]">
            <option value="patient">Paciente</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-md border border-[#1A3A43] px-4 py-2 text-sm text-[#A7B8BD] hover:text-white transition">Cancelar</button>
          <button type="submit" disabled={saving} className="rounded-md bg-[#00D9FF] px-4 py-2 text-sm font-semibold text-[#061418] hover:bg-cyan-300 disabled:opacity-50 transition">
            {saving ? "Guardando..." : mode === "create" ? "Crear" : "Guardar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
