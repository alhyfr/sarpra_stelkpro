'use client'

import { useEffect, useMemo, useState } from 'react'
import { Camera, KeyRound, UserRound } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import AInput from '@/components/AInput'
import AFile from '@/components/AFile'
import Button from '@/components/Button'
import DialogInfo from '@/components/DialogInfo'
import { useAuth } from '@/app/context/AuthContext'
import Api from '@/app/utils/Api'
import { getStorageUrl } from '@/helper/storageUrl'

export default function AkunPage() {
  const { user, updateUser, refreshUser } = useAuth()

  const [name, setName] = useState('')
  const [foto, setFoto] = useState(null)
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [dialogInfo, setDialogInfo] = useState({
    show: false,
    title: '',
    message: '',
    type: 'info',
  })
  const [localPreview, setLocalPreview] = useState(null)

  useEffect(() => {
    if (!user) return
    setName(user.name || '')
    setFoto(user.foto || null)
  }, [user])

  useEffect(() => {
    if (!(foto instanceof File)) {
      setLocalPreview(null)
      return undefined
    }
    const url = URL.createObjectURL(foto)
    setLocalPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [foto])

  const fotoValue = useMemo(() => {
    if (foto instanceof File) return foto
    if (typeof foto === 'string' && foto) return getStorageUrl(foto) || foto
    return null
  }, [foto])

  const avatarSrc = useMemo(() => {
    if (foto instanceof File) return null
    if (typeof foto === 'string' && foto) return getStorageUrl(foto) || foto
    return null
  }, [foto])

  const userInitials = useMemo(() => {
    return (user?.name || 'U')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'U'
  }, [user?.name])

  const showDialog = (title, message, type = 'info') => {
    setDialogInfo({ show: true, title, message, type })
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    const nextErrors = {}
    const trimmedName = String(name || '').trim()

    if (!trimmedName) nextErrors.name = 'Nama wajib diisi'
    else if (trimmedName.length < 2) nextErrors.name = 'Nama minimal 2 karakter'

    if (Object.keys(nextErrors).length) {
      setErrors((prev) => ({ ...prev, ...nextErrors }))
      return
    }

    setSavingProfile(true)
    setErrors((prev) => ({ ...prev, name: '', foto: '' }))

    try {
      let latestUser = user

      if (trimmedName !== (user?.name || '')) {
        const res = await Api.put('/sp/profile', { name: trimmedName })
        latestUser = res.data?.data || latestUser
      }

      if (foto instanceof File) {
        const formData = new FormData()
        formData.append('foto', foto)
        const res = await Api.post('/sp/profile/foto', formData)
        latestUser = res.data?.data || latestUser
        setFoto(latestUser?.foto || null)
      }

      if (latestUser) {
        updateUser(latestUser)
      } else {
        await refreshUser()
      }

      showDialog('Berhasil', 'Profil berhasil diperbarui', 'success')
    } catch (error) {
      const field = error.response?.data?.field
      const message =
        error.response?.data?.message ||
        error.message ||
        'Gagal memperbarui profil'

      if (field) {
        setErrors((prev) => ({ ...prev, [field]: message }))
      } else {
        showDialog('Error', message, 'error')
      }
    } finally {
      setSavingProfile(false)
    }
  }

  const handleSavePassword = async (e) => {
    e.preventDefault()
    const { oldPassword, newPassword, confirmPassword } = passwordForm
    const nextErrors = {}

    if (!oldPassword) nextErrors.oldPassword = 'Password lama wajib diisi'
    if (!newPassword) nextErrors.newPassword = 'Password baru wajib diisi'
    else if (newPassword.length < 8) nextErrors.newPassword = 'Password baru minimal 8 karakter'
    if (!confirmPassword) nextErrors.confirmPassword = 'Konfirmasi password wajib diisi'
    else if (newPassword !== confirmPassword) {
      nextErrors.confirmPassword = 'Konfirmasi password tidak cocok'
    }

    if (Object.keys(nextErrors).length) {
      setErrors((prev) => ({ ...prev, ...nextErrors }))
      return
    }

    setSavingPassword(true)
    setErrors((prev) => ({
      ...prev,
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    }))

    try {
      await Api.put('/sp/profile/password', {
        oldPassword,
        newPassword,
        confirmPassword,
      })
      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      showDialog('Berhasil', 'Password berhasil diperbarui', 'success')
    } catch (error) {
      const field = error.response?.data?.field
      const message =
        error.response?.data?.message ||
        error.message ||
        'Gagal memperbarui password'

      if (field) {
        setErrors((prev) => ({ ...prev, [field]: message }))
      } else {
        showDialog('Error', message, 'error')
      }
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Profil Saya
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Kelola foto profil dan password akun Anda
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Foto & Nama */}
          <form
            onSubmit={handleSaveProfile}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 sm:p-6 space-y-5"
            noValidate
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                <Camera className="w-5 h-5 text-[#B91C1C]" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Foto & Nama
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Perbarui identitas tampilan akun
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-lg font-semibold shrink-0">
                {localPreview || avatarSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={localPreview || avatarSrc}
                    alt="Foto profil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  userInitials
                )}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {user?.email || '-'}
                </p>
              </div>
            </div>

            <AInput
              id="name"
              name="name"
              label="Nama"
              icon={UserRound}
              value={name}
              required
              error={errors.name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
              }}
            />

            <AFile
              id="foto"
              name="foto"
              label="Foto Profil"
              value={fotoValue}
              accept="image/jpeg,image/png,image/jpg,image/webp"
              maxSize={2}
              error={errors.foto}
              helperText="JPG/PNG/WebP, maksimal 2MB"
              onChange={(e) => {
                setFoto(e.target.value)
                if (errors.foto) setErrors((prev) => ({ ...prev, foto: '' }))
              }}
            />

            <div className="flex justify-end">
              <Button type="submit" loading={savingProfile} disabled={savingProfile}>
                Simpan Profil
              </Button>
            </div>
          </form>

          {/* Ganti Password */}
          <form
            onSubmit={handleSavePassword}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 sm:p-6 space-y-5"
            noValidate
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-[#B91C1C]" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Ganti Password
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Gunakan password minimal 8 karakter
                </p>
              </div>
            </div>

            <AInput
              id="oldPassword"
              name="oldPassword"
              type="password"
              label="Password Lama"
              value={passwordForm.oldPassword}
              required
              error={errors.oldPassword}
              onChange={(e) => {
                setPasswordForm((prev) => ({ ...prev, oldPassword: e.target.value }))
                if (errors.oldPassword) {
                  setErrors((prev) => ({ ...prev, oldPassword: '' }))
                }
              }}
            />

            <AInput
              id="newPassword"
              name="newPassword"
              type="password"
              label="Password Baru"
              value={passwordForm.newPassword}
              required
              error={errors.newPassword}
              onChange={(e) => {
                setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                if (errors.newPassword) {
                  setErrors((prev) => ({ ...prev, newPassword: '' }))
                }
              }}
            />

            <AInput
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Konfirmasi Password Baru"
              value={passwordForm.confirmPassword}
              required
              error={errors.confirmPassword}
              onChange={(e) => {
                setPasswordForm((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
                if (errors.confirmPassword) {
                  setErrors((prev) => ({ ...prev, confirmPassword: '' }))
                }
              }}
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                loading={savingPassword}
                disabled={savingPassword}
              >
                Simpan Password
              </Button>
            </div>
          </form>
        </div>

        <DialogInfo
          show={dialogInfo.show}
          title={dialogInfo.title}
          message={dialogInfo.message}
          type={dialogInfo.type}
          autoClose={dialogInfo.type === 'success'}
          onClose={() => setDialogInfo((prev) => ({ ...prev, show: false }))}
        />
      </div>
    </ProtectedRoute>
  )
}
