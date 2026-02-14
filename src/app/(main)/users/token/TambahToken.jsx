'use client'

import { useState, useEffect } from 'react'
import AInput from '@/components/AInput'
import ARadio from '@/components/ARadio'
import { Key, Shield } from 'lucide-react'
import Button from '@/components/Button'
import { validateTokenForm } from '@/app/utils/validator'

export default function TambahToken({
    onClose = null,
    onSuccess = null,
    postToken,
    editingToken = null,
    isEditMode = false
}) {
    const [formData, setFormData] = useState({
        app_name: '',
        permissions: '',
        is_active: 1
    })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [showErrors, setShowErrors] = useState(false)

    // Load data saat edit mode
    useEffect(() => {
        if (isEditMode && editingToken) {
            setFormData({
                app_name: editingToken.app_name || '',
                permissions: editingToken.permissions || '',
                is_active: editingToken.is_active ?? 1
            })
        }
    }, [isEditMode, editingToken])

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

    const validateForm = () => {
        const result = validateTokenForm(formData)
        setErrors(result)
        return Object.keys(result).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setShowErrors(true)

        if (!validateForm()) {
            return
        }

        setLoading(true)
        setErrors({})
        setShowErrors(false)

        try {
            const submitData = {
                app_name: formData.app_name,
                permissions: formData.permissions,
                is_active: formData.is_active
            }

            if (postToken) {
                await postToken(submitData)
            } else {
                throw new Error('postToken function not provided')
            }

            // Reset form
            setFormData({
                app_name: '',
                permissions: '',
                is_active: 1
            })

            // Reset error state
            setShowErrors(false)
            setErrors({})

            if (onSuccess) onSuccess(submitData)
            if (onClose) onClose()

        } catch (error) {
            console.error('Error saving token:', error)
            // Show error via alert instead of form error
            const errorMessage = error.response?.data?.message || error.message || 'Terjadi kesalahan saat menyimpan data'
            alert(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* APP NAME - REQUIRED */}
                <AInput
                    id="app_name"
                    icon={Key}
                    name="app_name"
                    label="NAMA APLIKASI"
                    placeholder="Masukkan nama aplikasi"
                    value={formData.app_name}
                    onChange={handleInputChange}
                    error={showErrors ? errors.app_name : ''}
                    required
                />

                {/* PERMISSIONS - REQUIRED */}
                <AInput
                    id="permissions"
                    icon={Shield}
                    name="permissions"
                    label="PERMISSIONS"
                    placeholder="Masukkan permissions"
                    value={formData.permissions}
                    onChange={handleInputChange}
                    error={showErrors ? errors.permissions : ''}
                    required
                />

                {/* IS ACTIVE - REQUIRED (RADIO BUTTON) */}
                <ARadio
                    id="is_active"
                    name="is_active"
                    label="STATUS AKTIF"
                    value={formData.is_active}
                    onChange={handleInputChange}
                    error={showErrors ? errors.is_active : ''}
                    required
                    options={[
                        {
                            value: 1,
                            label: 'AKTIF',
                            description: 'Token dapat digunakan'
                        },
                        {
                            value: 0,
                            label: 'TIDAK AKTIF',
                            description: 'Token tidak dapat digunakan'
                        }
                    ]}
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
                    {isEditMode ? 'Update Token' : 'Simpan Token'}
                </Button>
            </form>
        </>
    )
}