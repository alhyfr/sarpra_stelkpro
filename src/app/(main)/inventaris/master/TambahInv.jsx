"use client";

import { useState, useEffect } from "react";
import AInput from "@/components/AInput";
import ADatePicker from "@/components/ADatePicker";
import ASelect from "@/components/ASelect";
import AFile from "@/components/AFile";
import ARadio from "@/components/ARadio";

import Button from "@/components/Button";
import { validateAsetForm } from "./validatorAset";
import { 
  User,
  IdCard,
  NotepadText,
  Calendar,
  Tag,
  Package,
  PaintBucket,
  Boxes,
  CircleDollarSign,
  Building2,
  House,
  Barcode,
  Hash 
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
export default function TambahInv({
  onClose = null,
  onSuccess = null,
  postInv = null,
  editingInv = null,
  isEditMode = false,
  satuan = [],
  dana = [],
  gedung = [],
  ruangan = [],
  kategoriAset = [],
  getRuanganByGedung = null,
}) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
    kode: "",
    desc: "",
    spec: "",
    gedung_id: "",
    ruang: "",
    noseri: "",
    merk: "",
    type: "",
    color: "",
    jml: "1",
    satuan: "",
    harga: "",
    tgl: "",
    sumber_dana_id: "",
    bukti: "",
    gambar: "",
    status: "",
    pic: user?.name || "",
    kode_ypt: "",
    kode_sim: "",
    ket: "",
    kategori: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const [availableRuangan, setAvailableRuangan] = useState([]);
  
  useEffect(() => {
    if (isEditMode && editingInv) {
      setFormData({
        kode: editingInv.kode || "",
        desc: editingInv.desc || "",
        spec: editingInv.spec || "",
        gedung_id: editingInv.gedung_id || "",
        ruang: editingInv.ruang || "",
        noseri: editingInv.noseri || "",
        merk: editingInv.merk || "",
        type: editingInv.type || "",
        color: editingInv.color || "",
        jml: editingInv.jml || "1",
        satuan: editingInv.satuan || "",
        harga: editingInv.harga || "",
        tgl: editingInv.tgl || "",
        sumber_dana_id: editingInv.sumber_dana_id || "",
        bukti: editingInv.bukti || "",
        gambar: editingInv.gambar || "",
        status: editingInv.status || "",
        pic: editingInv.pic || "",
        kode_ypt: editingInv.kode_ypt || "",
        kode_sim: editingInv.kode_sim || "",
        ket: editingInv.ket || "",
        kategori: editingInv.kategori || "",
      });
    }
  }, [isEditMode, editingInv]);

  // Update available ruangan when ruangan context changes
  useEffect(() => {
    if (ruangan && ruangan.length > 0) {
      setAvailableRuangan(ruangan);
    }
  }, [ruangan]);

  // Load ruangan when editing and gedung_id is available
  useEffect(() => {
    if (isEditMode && editingInv?.gedung_id && getRuanganByGedung) {
      getRuanganByGedung(editingInv.gedung_id);
    }
  }, [isEditMode, editingInv?.gedung_id, getRuanganByGedung]);
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing (jika showErrors aktif)
    if (showErrors && errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }

    // Handle gedung change - fetch ruangan
    if (name === 'gedung_id' && value && getRuanganByGedung) {
      // Reset ruang selection when gedung changes
      setFormData(prev => ({
        ...prev,
        ruang: ''
      }));
      
      // Fetch ruangan for selected gedung
      getRuanganByGedung(value);
    }
  }
  // Handle file upload
  const handleFileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for file field
    if (showErrors && errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };
// Handle file remove
const handleFileRemove = () => {
    setFormData(prev => ({
      ...prev,
      foto: null
    }))
  }
      // ============================================
      // VALIDASI FORM
      // ============================================
      const validateForm = () => {
        // Gunakan validator dari file terpisah
        const newErrors = validateAsetForm(formData)
        
        // console.log('🔍 Validation errors:', newErrors)
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
      }
      const handleSubmit = async (e) => {
        e.preventDefault()
        
        
        // Set showErrors ke true untuk menampilkan error
        setShowErrors(true)
        
        if (!validateForm()) {
          // console.log('Validation failed:', errors)
          return
        }
    
        setLoading(true)
        setErrors({})
        setShowErrors(false) // Reset setelah validasi sukses
        
        try {
          // Jika ada foto baru (File object), gunakan FormData untuk multipart upload
          let submitData
          
          if (formData.gambar instanceof File || formData.bukti instanceof File) {
            // Create FormData untuk file upload
            submitData = new FormData()
            submitData.append('kode', formData.kode)
            submitData.append('desc', formData.desc)
            submitData.append('spec', formData.spec)
            submitData.append('gedung_id', formData.gedung_id)
            submitData.append('ruang', formData.ruang)
            submitData.append('noseri', formData.noseri)
            submitData.append('merk', formData.merk)
            submitData.append('type', formData.type)
            submitData.append('color', formData.color)
            submitData.append('status', formData.status)
            submitData.append('pic', formData.pic)
            submitData.append('kode_ypt', formData.kode_ypt)
            submitData.append('kode_sim', formData.kode_sim)
            submitData.append('ket', formData.ket)
            submitData.append('kategori', formData.kategori)
            submitData.append('tgl', formData.tgl)
            submitData.append('sumber_dana_id', formData.sumber_dana_id)
            submitData.append('harga', formData.harga)
            submitData.append('satuan', formData.satuan)
            submitData.append('jml', formData.jml)
            
             // File objects (only append if they are File instances)
            if (formData.bukti instanceof File) {
              submitData.append('bukti', formData.bukti)
            } else if (formData.bukti) {
              // Existing file URL - send as string
              submitData.append('bukti', formData.bukti)
            }
            
            if (formData.gambar instanceof File) {
              submitData.append('gambar', formData.gambar)
            } else if (formData.gambar) {
              // Existing file URL - send as string
              submitData.append('gambar', formData.gambar)
            }
      
          } else {
            // Regular JSON data (no new files uploaded)
            submitData = {
                kode: formData.kode,
                desc: formData.desc,
                spec: formData.spec,
                gedung_id: formData.gedung_id,
                ruang: formData.ruang,
                noseri: formData.noseri,
                merk: formData.merk,
                type: formData.type,
                color: formData.color,
                jml: formData.jml,
                satuan: formData.satuan,
                harga: formData.harga,
                tgl: formData.tgl,
                sumber_dana_id: formData.sumber_dana_id,
                bukti: formData.bukti || null, // Include existing file URL or null
                gambar: formData.gambar || null, // Include existing file URL or null
                status: formData.status,
                pic: formData.pic,
                kode_ypt: formData.kode_ypt,
                kode_sim: formData.kode_sim,
                ket: formData.ket,
                kategori: formData.kategori,
            }
            
            
          }
    
          // console.log('🔧 postInv function exists:', !!postInv)
          
          // Fix: gunakan postTeam bukan postUser
          if (postInv) {
            await postInv(submitData)
          } else {
            throw new Error('postInv function not provided')
          }
          
          // Reset form
          setFormData({
            kode: "",
            desc: "",
            spec: "",
            gedung_id: "",
            ruang: "",
            noseri: "",
            merk: "",
            type: "",
            color: "",
            jml: "1",
            satuan: "",
            harga: "",
            tgl: "",
            sumber_dana_id: "",
            bukti: "",
            gambar: "",
            status: "",
            pic: "",
            kode_ypt: "",
            kode_sim: "",
            ket: "",
            kategori: "",
          })
          
          // Reset available ruangan
          setAvailableRuangan([])
          
          // Reset error state
          setShowErrors(false)
          setErrors({})
          
          if (onSuccess) onSuccess(submitData)
          if (onClose) onClose()
          
        } catch (error) {
          console.error('Error saving aset:', error)
          
          // Handle field-specific errors (like duplicate kode)
          if (error.field) {
            setErrors(prev => ({
              ...prev,
              [error.field]: error.message
            }))
            setShowErrors(true)
          } else {
            // Show general error via alert
            const errorMessage = error.response?.data?.message || error.message || 'Terjadi kesalahan saat menyimpan data'
            alert(errorMessage)
          }
        } finally {
          setLoading(false)
        }
      }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} noValidate>
        {/* Section 1: Informasi Dasar */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Informasi Dasar
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ADatePicker
              id="tgl"
              icon={Calendar}
              name="tgl"
              label="Tanggal"
              placeholder="Pilih Tanggal"
              value={formData.tgl}
              onChange={handleInputChange}
              error={showErrors ? errors.tgl : ''}
              required
            />
            <AInput
              id="kode"
              icon={IdCard}
              name="kode"
              label="Kode Aset"
              placeholder="Masukkan Kode Aset"
              value={formData.kode}
              onChange={handleInputChange}
              error={showErrors ? errors.kode : ''}
              required
            />
            <AInput
              id="desc"
              icon={NotepadText}
              name="desc"
              label="Deskripsi"
              placeholder="Masukkan Deskripsi"
              value={formData.desc}
              onChange={handleInputChange}
              error={showErrors ? errors.desc : ''}
              required
            />
          </div>
        </div>

        {/* Section 2: Kode Identifikasi */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Kode Identifikasi
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AInput
              id="kode_ypt"
              icon={NotepadText}
              name="kode_ypt"
              label="Kode YPT"
              placeholder="Masukkan Kode YPT"
              value={formData.kode_ypt}
              onChange={handleInputChange}
            />
            <AInput
              id="kode_sim"
              icon={NotepadText}
              name="kode_sim"
              label="Kode SIMKUG"
              placeholder="Masukkan Kode SIMKUG"
              value={formData.kode_sim}
              onChange={handleInputChange}
            />
            <AInput
              id="noseri"
              icon={Barcode}
              name="noseri"
              label="No Seri"
              placeholder="Masukkan No Seri"
              value={formData.noseri}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Section 3: Spesifikasi Produk */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Spesifikasi Produk
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AInput
              id="spec"
              icon={NotepadText}
              name="spec"
              label="Spesifikasi"
              placeholder="Masukkan Spesifikasi"
              value={formData.spec}
              onChange={handleInputChange}
              error={showErrors ? errors.spec : ''}
            />
            <AInput
              id="merk"
              icon={Tag}
              name="merk"
              label="Merk"
              placeholder="Masukkan Merk"
              value={formData.merk}
              onChange={handleInputChange}
            />
            <AInput
              id="type"
              icon={Package}
              name="type"
              label="Type"
              placeholder="Masukkan Type"
              value={formData.type}
              onChange={handleInputChange}
            />
            <AInput
              id="color"
              icon={PaintBucket}
              name="color"
              label="Warna"
              placeholder="Masukkan Warna"
              value={formData.color}
              onChange={handleInputChange}
            />
            <AInput
              id="jml"
              icon={Hash}
              name="jml"
              label="Jumlah"
              placeholder="Masukkan Jumlah"
              value={formData.jml}
              onChange={handleInputChange}
              readOnly
              className="bg-gray-100 dark:bg-gray-700"
            />
            <ASelect
              id="satuan"
              icon={Boxes}
              name="satuan"
              label="Satuan"
              placeholder="Pilih Satuan"
              value={formData.satuan}
              onChange={handleInputChange}
              error={showErrors ? errors.satuan : ''}
              required
              options={satuan.map(item => ({
                value: item.satuan,
                label: item.satuan,
              }))}
            />
          </div>
        </div>

        {/* Section 4: Informasi Keuangan */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Informasi Keuangan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AInput
              id="harga"
              icon={CircleDollarSign}
              name="harga"
              label="Harga"
              placeholder="Masukkan Harga"
              value={formData.harga}
              onChange={handleInputChange}
              error={showErrors ? errors.harga : ''}
              required
            />
            <ASelect
              id="sumber_dana_id"
              icon={Boxes}
              name="sumber_dana_id"
              label="Sumber Dana"
              placeholder="Pilih Sumber Dana"
              value={formData.sumber_dana_id}
              onChange={handleInputChange}
              error={showErrors ? errors.sumber_dana_id : ''}
              required
              options={dana.map(item => ({
                value: item.id,
                label: item.sumber,
              }))}
            />
          </div>
        </div>

        {/* Section 5: Lokasi */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Lokasi
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ASelect
              id="gedung_id"
              icon={Building2}
              name="gedung_id"
              label="Lokasi Gedung"
              placeholder="Pilih Gedung"
              value={formData.gedung_id}
              onChange={handleInputChange}
              error={showErrors ? errors.gedung_id : ''}
              required
              options={gedung.map(item => ({
                value: item.id,
                label: item.gedung,
              }))}
            />
            <ASelect
              id="ruang"
              icon={House}
              name="ruang"
              label="Ruangan"
              placeholder="Pilih Ruangan"
              value={formData.ruang}
              onChange={handleInputChange}
              error={showErrors ? errors.ruang : ''}
              required
              disabled={!formData.gedung_id}
              options={availableRuangan.map(item => ({
                value: item.ruangan,
                label: item.ruangan,
              }))}
            />
          </div>
        </div>

        {/* Section 6: Dokumen & File */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Dokumen & File
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AFile
              id="bukti"
              name="bukti"
              label="Bukti Pembelian"
              value={formData.bukti}
              onChange={handleFileChange}
              accept="application/pdf"
              maxSize={10}
              helperText="Upload file PDF bukti pembelian"
            />
            <AFile
              id="gambar"
              name="gambar"
              label="Gambar Aset"
              value={formData.gambar}
              onChange={handleFileChange}
              accept="image/*"
              maxSize={5}
              helperText="Upload gambar aset (PNG, JPG, JPEG)"
            />
          </div>
        </div>

        {/* Section 7: Informasi Tambahan */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Informasi Tambahan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AInput
              id="pic"
              icon={User}
              name="pic"
              label="PIC (Penanggung Jawab)"
              placeholder="Nama PIC"
              value={formData.pic}
              onChange={handleInputChange}
              readOnly
              className="bg-gray-100 dark:bg-gray-700"
            />
            <ASelect
              id="kategori"
              icon={Tag}
              name="kategori"
              label="Kategori"
              placeholder="Pilih Kategori"
              value={formData.kategori}
              onChange={handleInputChange}
              options={kategoriAset.map(item => ({
                value: item.kategori,
                label: item.kategori,
              }))}
              error={showErrors ? errors.kategori : ''}
              required
            />
            <div className="md:col-span-2">
              <AInput
                id="ket"
                icon={NotepadText}
                name="ket"
                label="Keterangan"
                placeholder="Masukkan Keterangan Tambahan"
                value={formData.ket}
                onChange={handleInputChange}
              />
            </div>
            <ARadio
              id="status"
              name="status"
              label="Status"
              value={formData.status}
              onChange={handleInputChange}
              error={showErrors ? errors.status : ''}
              required
              options={[
                { value: 'on', label: 'ON' },
                { value: 'off', label: 'OFF' },
              ]}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button type="submit" loading={loading} className="px-8">
            {isEditMode ? 'Update Aset' : 'Simpan Aset'}
          </Button>
        </div>
      </form>
    </div>
  );
}
