'use client';
import { useState, useEffect } from 'react';
import { useData } from '@/app/context/DataContext';
import ASearchableSelect from '@/components/ASearchableSelect';
import AInput from '@/components/AInput';
import Button from '@/components/Button';
import api from '@/app/utils/Api';

export default function TambahData({ 
  dataDetail, 
  onClose = null, 
  onSuccess = null,
  postPinBarEks = null,
  editingPinBarEks = null,
  isEditMode = false
}) {
  const { getPibarFilter, pibarFilter, PibarFilter } = useData();
  const [formData, setFormData] = useState({
    peks_id: dataDetail?.id || '',
    nabar: '',
    qty: '',
    tujuan: '',
    kondisi: '',
  });
  const [selectedPibar, setSelectedPibar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    getPibarFilter();
  }, []);

  useEffect(() => {
    if (dataDetail?.id) {
      setFormData((prev) => ({
        ...prev,
        peks_id: dataDetail.id,
      }));
    }
  }, [dataDetail]);

  // Initialize form data when editing
  useEffect(() => {
    if (isEditMode && editingPinBarEks) {
      const toString = (value) => (value == null ? '' : String(value));
      
      setFormData({
        peks_id: dataDetail?.id || '',
        nabar: toString(editingPinBarEks.nabar),
        qty: toString(editingPinBarEks.qty),
        tujuan: toString(editingPinBarEks.tujuan),
        kondisi: toString(editingPinBarEks.kondisi),
      });
    } else {
      // Reset form when not in edit mode
      setFormData({
        peks_id: dataDetail?.id || '',
        nabar: '',
        qty: '',
        tujuan: '',
        kondisi: '',
      });
      setSelectedPibar(null);
    }
  }, [isEditMode, editingPinBarEks, dataDetail]);

  // Set selected pibar when in edit mode
  useEffect(() => {
    if (isEditMode && editingPinBarEks?.nabar && pibarFilter && pibarFilter.length > 0 && !selectedPibar) {
      // Cari barang berdasarkan nabar
      const selectedItem = pibarFilter.find(item => item.nabar === editingPinBarEks.nabar);
      if (selectedItem) {
        setSelectedPibar(selectedItem);
      }
    } else if (!isEditMode) {
      setSelectedPibar(null);
    }
  }, [pibarFilter, isEditMode, editingPinBarEks, selectedPibar]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Pastikan value selalu string untuk text input
    const stringValue = String(value || '');
    setFormData((prev) => ({
      ...prev,
      [name]: stringValue,
    }));
    // Clear error when user starts typing
    if (showErrors && errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handlePibarSelect = (selectedItem) => {
    setSelectedPibar(selectedItem);
    // Pastikan nabar selalu string
    const nabarValue = selectedItem?.nabar ? String(selectedItem.nabar) : '';
    setFormData((prev) => ({
      ...prev,
      nabar: nabarValue,
    }));
    // Clear error when user selects
    if (showErrors && errors.nabar) {
      setErrors((prev) => ({
        ...prev,
        nabar: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validasi nabar - pastikan string dan tidak kosong
    const nabarValue = String(formData.nabar || '').trim();
    if (!nabarValue) {
      newErrors.nabar = 'Nama barang harus diisi';
    }
    
    // Validasi qty - pastikan number dan lebih dari 0
    const qtyValue = formData.qty ? String(formData.qty).trim() : '';
    if (!qtyValue || isNaN(parseInt(qtyValue)) || parseInt(qtyValue) <= 0) {
      newErrors.qty = 'Jumlah harus diisi dan lebih dari 0';
    }
    
    // Validasi tujuan - pastikan string dan tidak kosong
    const tujuanValue = String(formData.tujuan || '').trim();
    if (!tujuanValue) {
      newErrors.tujuan = 'Tujuan harus diisi';
    }

    // Validasi kondisi - pastikan string dan tidak kosong
    const kondisiValue = String(formData.kondisi || '').trim();
    if (!kondisiValue) {
      newErrors.kondisi = 'Kondisi barang harus diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowErrors(true);
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});
    setShowErrors(false);

    try {
      const submitData = {
        peks_id: formData.peks_id,
        nabar: formData.nabar,
        qty: parseInt(formData.qty),
        tujuan: formData.tujuan,
        kondisi: formData.kondisi,
      };

      if (postPinBarEks) {
        await postPinBarEks(submitData);
        // Reset form setelah berhasil
        setFormData({
          peks_id: dataDetail?.id || '',
          nabar: '',
          qty: '',
          tujuan: '',
          kondisi: '',
        });
        setSelectedPibar(null);
        setShowErrors(false);
        setErrors({});
        if (onSuccess) onSuccess(submitData);
        if (onClose) onClose();
      } else {
        // Jika postPinBarEks tidak diberikan, langsung call API
        const response = await api.post(`/sp/data-pineks/${formData.peks_id}`, submitData);
        if (response.data.message === 'success') {
          // Reset form
          setFormData({
            peks_id: dataDetail?.id || '',
            nabar: '',
            qty: '',
            tujuan: '',
            kondisi: '',
          });
          setSelectedPibar(null);
          setShowErrors(false);
          setErrors({});
          if (onSuccess) onSuccess(submitData);
          if (onClose) onClose();
        }
      }
    } catch (error) {
      if (
        error.response?.data?.status === 'error' &&
        error.response?.data?.field
      ) {
        const fieldError = error.response.data.field;
        const errorMessage = error.response.data.message;
        setErrors((prev) => ({
          ...prev,
          [fieldError]: errorMessage,
        }));
        setShowErrors(true);
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Terjadi kesalahan saat menyimpan data';
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <ASearchableSelect
              id="nabar"
              name="nabar"
              label="NAMA BARANG"
              placeholder="Cari nama barang..."
              value={selectedPibar?.nabar || formData.nabar || ''}
              onChange={handleInputChange}
              onSelect={handlePibarSelect}
              error={showErrors ? errors.nabar : ''}
              required
              options={pibarFilter || []}
              searchFunction={PibarFilter}
              displayKey="nabar"
              valueKey="nabar"
              searchKey="nabar"
              minSearchLength={2}
              noResultsText="Barang tidak ditemukan"
            />

            <AInput
              id="qty"
              name="qty"
              label="JUMLAH (QTY)"
              placeholder="Masukkan jumlah"
              type="number"
              min="1"
              value={formData.qty}
              onChange={handleInputChange}
              error={showErrors ? errors.qty : ''}
              required
            />
          </div>

          <div className="space-y-4">
            <AInput
              id="tujuan"
              name="tujuan"
              label="TUJUAN"
              placeholder="Masukkan tujuan"
              type="text"
              value={formData.tujuan}
              onChange={handleInputChange}
              error={showErrors ? errors.tujuan : ''}
              required
            />
            <AInput
              id="kondisi"
              name="kondisi"
              label="KONDISI BARANG"
              placeholder="Pilih kondisi barang"
              value={formData.kondisi}
              onChange={handleInputChange}
              error={showErrors ? errors.kondisi : ''}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFormData({
                peks_id: dataDetail?.id || '',
                nabar: '',
                qty: '',
                tujuan: '',
              });
              setSelectedPibar(null);
              setShowErrors(false);
              setErrors({});
              if (onClose) onClose();
            }}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
          >
            {isEditMode ? 'Update' : 'Simpan'}
          </Button>
        </div>
      </form>
    </div>
  );
}