'use client'
import { useState, useEffect } from 'react'
import AInput from '@/components/AInput'
import AFile from '@/components/AFile'
import ARadio from '@/components/ARadio'
import ASelect from '@/components/ASelect'
import { User, NotebookText, Building, Gauge } from 'lucide-react'
import Button from '@/components/Button'
import { validateGedungForm } from '@/app/utils/validator'

export default function TambahGedung({
    onClose = null,
    onSuccess = null,
    postGedung,           // Fix: nama yang benar
    editingGedung = null, // Fix: nama yang benar
    isEditMode = false
}) {
    const [formData, setFormData] = useState({
        gedung: '',
        ket: '',
        luas: '',
        foto: '',
    })
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [showErrors, setShowErrors] = useState(false) // Kontrol kapan error ditampilkan

    useEffect(() => {
        if (isEditMode && editingGedung) {
            setFormData({
                gedung: editingGedung.gedung || '',
                ket: editingGedung.ket || '',
                luas: editingGedung.luas || '',
                foto: editingGedung.foto || '',  // URL foto dari server
            })
        }
    }, [isEditMode, editingGedung])

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
    const validateForm = () => {
        const newErrors = validateGedungForm(formData)
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }
    const handleSubmit = async (e) => {
        e.preventDefault()

        // Set showErrors ke true untuk menampilkan error
        setShowErrors(true)

        if (!validateForm()) {
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
                submitData.append('gedung', formData.gedung)
                submitData.append('ket', formData.ket)
                submitData.append('luas', formData.luas)
                submitData.append('foto', formData.foto)  // File object
            } else {
                // Regular JSON data (no file atau foto sudah URL)
                submitData = {
                    gedung: formData.gedung,
                    ket: formData.ket,
                    luas: formData.luas,
                    foto: formData.foto || null,  // URL string atau null
                }
            }

            // Fix: gunakan postGedung bukan postUser
            if (postGedung) {
                await postGedung(submitData)
            } else {
                throw new Error('postGedung function not provided')
            }

            // Reset form
            setFormData({
                gedung: '',
                ket: '',
                luas: '',
                foto: '',
            })

            // Reset error state
            setShowErrors(false)
            setErrors({})

            if (onSuccess) onSuccess(submitData)
            if (onClose) onClose()

        } catch (error) {
            console.error('Error saving gedung:', error)
            // Show error via alert instead of form error
            const errorMessage = error.response?.data?.message || error.message || 'Terjadi kesalahan saat menyimpan data'
            alert(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <AInput
                    id="gedung"
                    icon={Building}
                    name="gedung"
                    label="Nama Gedung"
                    placeholder="Masukkan Nama Gedung"
                    value={formData.gedung}
                    onChange={handleInputChange}
                    error={showErrors ? errors.gedung : ''}
                    required
                />
                <AInput
                    id="luas"
                    icon={Gauge}
                    name="luas"
                    label="Luas"
                    placeholder="Masukkan Luas"
                    value={formData.luas}
                    onChange={handleInputChange}
                    required
                />
                <AInput
                    id="ket"
                    icon={NotebookText}
                    name="ket"
                    label="Keterangan"
                    placeholder="Masukkan Keterangan"
                    value={formData.ket}
                    onChange={handleInputChange}
                    error={showErrors ? errors.ket : ''}
                    required
                />
                <AFile
                    id="foto"
                    icon={User}
                    label="Foto"
                    name="foto"
                    value={formData.foto}
                    onChange={handleFileChange}
                    onRemove={handleFileRemove}
                    error={showErrors ? errors.foto : ''}
                    required
                />
                <div className="flex justify-end gap-2 mt-6">
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                </div>
            </form>
        </div>
    )
}