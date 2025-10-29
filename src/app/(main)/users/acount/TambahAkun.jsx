"use client";
import { useState, useEffect } from "react";
import AInput from "@/components/AInput";
import ARadio from "@/components/ARadio";
import ASelect from "@/components/ASelect";
import Button from "@/components/Button";
import { validateAkunForm } from "./validatorAkun";
import { User } from "lucide-react";
export default function TambahAkun({
  onClose = null,
  onSuccess = null,
  postUser = null, // Fix: nama yang benar
  editingAkun = null, // Fix: nama yang benar
  isEditMode = false,
  roles = [],
  positions = [],
}) {
  const [formData, setFormData] = useState({
    uid: "",
    name: "",
    level: "",
    position: "",
    email: "",
    password: "",
    status: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false); // Kontrol kapan error ditampilkan
  // Load data saat edit mode
  useEffect(() => {
    if (isEditMode && editingAkun) {
      setFormData({
        uid: editingAkun.uid || "",
        name: editingAkun.name || "",
        level: editingAkun.level || "",
        position: editingAkun.position || "",
        email: editingAkun.email || "",
        password: "sarpra2025" || "",
        status: editingAkun.status || "", // URL foto dari server
      });
    }
  }, [isEditMode, editingAkun]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing (jika showErrors aktif)
    if (showErrors && errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };
  const validateForm = () => {
    // Gunakan validator dari file terpisah
    const newErrors = validateAkunForm(formData)
    
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
      
      
        // Regular JSON data (no file atau foto sudah URL)
        submitData = {
            uid: formData.uid,
            name: formData.name,
            level: formData.level,
            position: formData.position,
            email: formData.email,
            password: formData.password,
            status: formData.status,
        }
        
      
      // Fix: gunakan postTeam bukan postUser
      if (postUser) {
        await postUser(submitData)
      } else {
        throw new Error('postTeam function not provided')
      }
      // Reset form
      setFormData({
        uid: '',
        name: '',
        level: '',
        position: '',
        email: '',
        password: '',
        status: '',
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
  return <>
    <form onSubmit={handleSubmit} noValidate>
      {/* Grid Container - 2 columns on medium screens and up */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Row 1: UID & Name */}
        <AInput
          id="uid"
          icon={User}
          name="uid"
          label="UID"
          placeholder="Masukkan UID"
          value={formData.uid}
          onChange={handleInputChange}
          error={showErrors ? errors.uid : ''}
          required
        />
        <AInput
          id="name"
          icon={User}
          name="name"
          label="Nama"
          placeholder="Masukkan Nama"
          value={formData.name}
          onChange={handleInputChange}
          error={showErrors ? errors.name : ''}
          required
        />
        
        {/* Row 2: Level & Position */}
        <ASelect
          id="level"
          name="level"
          label="Level"
          options={roles.map(role => ({ value: role.role_id, label: role.codename }))}
          value={formData.level}
          onChange={handleInputChange}
          error={showErrors ? errors.level : ''}
          required
        />
        <ASelect
          id="position"
          name="position"
          label="Position"
          options={positions.map(position => ({ value: position.pos_id, label: position.codename }))}
          value={formData.position}
          onChange={handleInputChange}
          error={showErrors ? errors.position : ''}
          required
        />
        
        {/* Row 3: Email & Password */}
        <AInput
          id="email"
          icon={User}
          name="email"
          label="Email"
          placeholder="Masukkan Email"
          value={formData.email}
          onChange={handleInputChange}
          error={showErrors ? errors.email : ''}
          required
        />
        <AInput
          id="password"
          icon={User}
          name="password"
          label="Password"
          placeholder="Masukkan Password"
          value={formData.password}
          onChange={handleInputChange}
          error={showErrors ? errors.password : ''}
          required
        />
        
        {/* Row 4: Status - Full width */}
        <div className="md:col-span-2">
          <ARadio
            id="status"
            name="status"
            label="Status"
            value={formData.status}
            onChange={handleInputChange}
            error={showErrors ? errors.status : ''}
            required
            options={[
              { value: 'on', label: 'on' },
              { value: 'off', label: 'off' },
            ]}
          />
        </div>
      </div>
      
      {/* Submit Button - Full width, with top margin */}
      <div className="mt-6">
        <Button type="submit" loading={loading} className="w-full">
          Simpan
        </Button>
      </div>
    </form>
  </>;
}
