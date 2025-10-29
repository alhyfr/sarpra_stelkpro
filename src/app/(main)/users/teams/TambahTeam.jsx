'use client'

import { useState, useEffect } from 'react'
import AInput from '@/components/AInput'
import AFile from '@/components/AFile'
import ARadio from '@/components/ARadio'
import ASelect from '@/components/ASelect'
import { User, Briefcase } from 'lucide-react'
import Button from '@/components/Button'
import { validateTeamForm } from './validator'

export default function TambahTeam({
  onClose = null, 
  onSuccess = null, 
  postTeam,           // Fix: nama yang benar
  editingTeam = null, // Fix: nama yang benar
  isEditMode = false
}) {
      const [formData, setFormData] = useState({
        nip: '',
        nik: '',
        nama: '',
        nikname: '',
        status: '',
        jabatan: '',
        foto: '',
      })
      const [loading, setLoading] = useState(false)
      const [errors, setErrors] = useState({})
      const [showErrors, setShowErrors] = useState(false) // Kontrol kapan error ditampilkan
      
      // Load data saat edit mode
      useEffect(() => {
        if (isEditMode && editingTeam) {
          setFormData({
            nip: editingTeam.nip || '',
            nik: editingTeam.nik || '',
            nama: editingTeam.nama || '',
            nikname: editingTeam.nikname || '',
            status: editingTeam.status || '',
            jabatan: editingTeam.jabatan || '',
            foto: editingTeam.foto || '',  // URL foto dari server
          })
        }
      }, [isEditMode, editingTeam])
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
      }

      // Handle file upload
      const handleFileChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
          ...prev,
          [name]: value
        }))
        
        // Clear error for file field
        if (showErrors && errors[name]) {
          setErrors(prev => ({
            ...prev,
            [name]: ''
          }))
        }
      }

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
        const newErrors = validateTeamForm(formData)
        
        console.log('🔍 Validation errors:', newErrors)
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
      }
      const handleSubmit = async (e) => {
        e.preventDefault()
        
        console.log('📝 Form submit triggered')
        console.log('🔍 Form data:', formData)
        
        // Set showErrors ke true untuk menampilkan error
        setShowErrors(true)
        
        if (!validateForm()) {
          console.log('❌ Validation failed:', errors)
          return
        }
    
        setLoading(true)
        setErrors({})
        setShowErrors(false) // Reset setelah validasi sukses
        
        try {
          // Jika ada foto (File object), gunakan FormData untuk multipart upload
          let submitData
          
          if (formData.foto instanceof File) {
            // Create FormData untuk file upload
            submitData = new FormData()
            submitData.append('nip', formData.nip)
            submitData.append('nik', formData.nik || '')
            submitData.append('nama', formData.nama)
            submitData.append('nikname', formData.nikname)
            submitData.append('status', formData.status)
            submitData.append('jabatan', formData.jabatan)
            submitData.append('foto', formData.foto)  // File object
            
            console.log('📤 Submitting with file upload (FormData)')
          } else {
            // Regular JSON data (no file atau foto sudah URL)
            submitData = {
              nip: formData.nip,
              nik: formData.nik,
              nama: formData.nama,
              nikname: formData.nikname,
              status: formData.status,
              jabatan: formData.jabatan,
              foto: formData.foto || null,  // URL string atau null
            }
            
            console.log('📤 Submitting data (JSON):', submitData)
          }
    
          console.log('🔧 postTeam function exists:', !!postTeam)
          
          // Fix: gunakan postTeam bukan postUser
          if (postTeam) {
            await postTeam(submitData)
            console.log('✅ Data saved successfully')
          } else {
            console.error('❌ postTeam function not provided')
            throw new Error('postTeam function not provided')
          }
          
          // Reset form
          setFormData({
            nip: '',
            nik: '',
            nama: '',
            nikname: '',
            status: '',
            jabatan: '',
            foto: '',
          })
          
          // Reset error state
          setShowErrors(false)
          setErrors({})
          
          if (onSuccess) onSuccess(submitData)
          if (onClose) onClose()
          
        } catch (error) {
          console.error('Error saving team:', error)
          // Show error via alert instead of form error
          const errorMessage = error.response?.data?.message || error.message || 'Terjadi kesalahan saat menyimpan data'
          alert(errorMessage)
        } finally {
          setLoading(false)
        }
      }
    return(
       <>
       <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* NIP - REQUIRED */}
        <AInput
          id="nip"
          icon={User}
          name="nip"
          label="NIP"
          placeholder="Masukkan NIP"
          value={formData.nip}
          onChange={handleInputChange}
          error={showErrors ? errors.nip : ''}
          required
        />
        
        {/* NIK - OPTIONAL */}
        <AInput
          id="nik"
          name="nik"
          label="NIK"
          placeholder="Masukkan NIK (opsional)"
          value={formData.nik}
          onChange={handleInputChange}
          error={showErrors ? errors.nik : ''}
        />
        
        {/* NAMA - REQUIRED */}
        <AInput
          id="nama"
          name="nama"
          label="NAMA LENGKAP"
          icon={User}
          placeholder="Masukkan nama lengkap"
          value={formData.nama}
          onChange={handleInputChange}
          error={showErrors ? errors.nama : ''}
          required
        />
        
        {/* NICKNAME - REQUIRED */}
        <AInput
          id="nikname"
          name="nikname"
          label="NICKNAME"
          placeholder="Masukkan nickname"
          value={formData.nikname}
          onChange={handleInputChange}
          error={showErrors ? errors.nikname : ''}
          required
        />
        
        {/* STATUS - REQUIRED (RADIO BUTTON) */}
        <ARadio
          id="status"
          name="status"
          label="STATUS KEPEGAWAIAN"
          value={formData.status}
          onChange={handleInputChange}
          error={showErrors ? errors.status : ''}
          required
          options={[
            { 
              value: 'PEGTAP', 
              label: 'PEGAWAI TETAP',
              description: 'Pegawai dengan status tetap'
            },
            { 
              value: 'FULL TIME', 
              label: 'FULL TIME',
              description: 'Pegawai full time non-tetap'
            }
          ]}
        />
        
        {/* JABATAN - REQUIRED (SELECT DROPDOWN) */}
        <ASelect
          id="jabatan"
          name="jabatan"
          label="JABATAN"
          placeholder="Pilih jabatan"
          icon={Briefcase}
          value={formData.jabatan}
          onChange={handleInputChange}
          error={showErrors ? errors.jabatan : ''}
          required
          options={[
            { value: 'WAKASEK IT, LAB & SARPRA', label: 'Wakil Kepala Sekolah' },
            { value: 'KAUR SARPRA', label: 'Kepala Urusan Sarana & Prasarana' },
            { value: 'KAUR LABORATORIUM', label: 'Kepala Urusan Laboratorium' },
            { value: 'KAUR IT', label: 'Kepala Urusan Teknologi Informasi' },
            { value: 'STAF SARPRA', label: 'Staf Sarana & Prasarana' },
            { value: 'STAF LABORATORIUM', label: 'Staf Laboratorium' },
            { value: 'STAF IT', label: 'Staf Teknologi Informasi' }
          ]}
        />

        {/* FOTO - OPTIONAL */}
        <AFile
          id="foto"
          name="foto"
          label="FOTO PEGAWAI"
          value={formData.foto}
          onChange={handleFileChange}
          onRemove={handleFileRemove}
          accept="image/*"
          maxSize={2}
          error={showErrors ? errors.foto : ''}
          helperText="Format: JPG, PNG, JPEG. Maksimal 2MB"
        />

        {/* Required Fields Info */}
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
          <p className="text-xs">
            <span className="text-red-600 font-bold">*</span> = Wajib diisi
          </p>
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
        >
          {isEditMode ? 'Update Data' : 'Simpan Data'}
        </Button>
       </form>
       </>
    )
}