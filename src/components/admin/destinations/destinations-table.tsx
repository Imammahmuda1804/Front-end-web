"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Edit, Trash2, BarChart2, MapPin } from "lucide-react";
import { adminDestinationService } from "@/services/admin/destination.service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DestinationFormModal } from "./destination-form-modal";

export function DestinationsTable() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<any>(null);

  // Debounce search effect (simplified)
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset page on search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-destinations", debouncedSearch, page, limit],
    queryFn: () => adminDestinationService.getDestinations({
      search: debouncedSearch,
      page,
      limit,
    }),
  });

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus destinasi ini?")) {
      try {
        await adminDestinationService.deleteDestination(id);
        toast.success("Destinasi berhasil dihapus");
        refetch();
      } catch (error) {
        toast.error("Gagal menghapus destinasi");
        console.error(error);
      }
    }
  };

  const openAddModal = () => {
    setEditingDestination(null);
    setIsModalOpen(true);
  };

  const openEditModal = (destination: any) => {
    setEditingDestination(destination);
    setIsModalOpen(true);
  };

  const destinations = data?.data || [];
  const meta = data?.meta || { total_pages: 1, page: 1 };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari destinasi atau kota..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={openAddModal}>+ Tambah Destinasi</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Destinasi</TableHead>
              <TableHead>Lokasi</TableHead>
              <TableHead>Rating (Google / User)</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">Loading data...</TableCell>
              </TableRow>
            ) : destinations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">Tidak ada data ditemukan.</TableCell>
              </TableRow>
            ) : (
              destinations.map((dest: any) => (
                <TableRow key={dest.id}>
                  <TableCell className="font-medium">
                    {dest.name}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-1 h-3 w-3" />
                      {dest.city}, {dest.province}
                    </div>
                  </TableCell>
                  <TableCell>
                    {dest.googleRating || "-"} / {dest.userRating || "-"}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      title="Analitik"
                      onClick={() => router.push(`/admin/destinations/${dest.id}/analytics`)}
                    >
                      <BarChart2 className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      title="Edit"
                      onClick={() => openEditModal(dest)}
                    >
                      <Edit className="h-4 w-4 text-orange-500" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      title="Hapus"
                      onClick={() => handleDelete(dest.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Menampilkan Halaman {meta.page} dari {meta.total_pages}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
          >
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(meta.total_pages, p + 1))}
            disabled={page === meta.total_pages || isLoading || meta.total_pages === 0}
          >
            Selanjutnya
          </Button>
        </div>
      </div>

      <DestinationFormModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        onSuccess={() => refetch()}
        initialData={editingDestination}
      />
    </div>
  );
}
