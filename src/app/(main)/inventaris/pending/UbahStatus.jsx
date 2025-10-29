'use client'

import { useState } from "react";
import ARadio from "@/components/ARadio";
import Button from "@/components/Button";

export default function UbahStatus({ item, onUpdate, onClose }) {
  const [selectedStatus, setSelectedStatus] = useState('off');
  const [loading, setLoading] = useState(false);

  // Opsi status yang tersedia
  const statusOptions = [
    { value: 'off', label: 'Pending', description: 'Aset masih dalam proses verifikasi atau belum aktif' },
    { value: 'on', label: 'Aktif', description: 'Aset sudah diverifikasi dan dapat digunakan' },
  ];

  const handleSubmit = async () => {
    if (!selectedStatus) {
      alert('Pilih status terlebih dahulu');
      return;
    }

    setLoading(true);
    try {
      await onUpdate(selectedStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!item) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Tidak ada data aset yang dipilih</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Aset */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Informasi Aset</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="font-medium text-gray-600">Kode:</span>
            <p className="text-gray-900">{item.kode || '-'}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Kode SIM:</span>
            <p className="text-gray-900">{item.kode_sim || '-'}</p>
          </div>
          <div className="col-span-2">
            <span className="font-medium text-gray-600">Deskripsi:</span>
            <p className="text-gray-900">{item.desc || '-'}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Gedung:</span>
            <p className="text-gray-900">{typeof item.gedung === 'object' ? item.gedung?.gedung : item.gedung || '-'}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Ruangan:</span>
            <p className="text-gray-900">{item.ruang || '-'}</p>
          </div>
        </div>
      </div>

      {/* Form Ubah Status */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Pilih Status Baru</h3>
        
        <ARadio
          name="status"
          label="Status Aset"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          options={statusOptions}
          required={true}
        />

        {/* Deskripsi Status Terpilih */}
        {selectedStatus && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Deskripsi:</span> {
                statusOptions.find(opt => opt.value === selectedStatus)?.description
              }
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          Batal
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || !selectedStatus}
          className="min-w-[120px]"
        >
          {loading ? 'Menyimpan...' : 'Simpan Status'}
        </Button>
      </div>
    </div>
  );
}