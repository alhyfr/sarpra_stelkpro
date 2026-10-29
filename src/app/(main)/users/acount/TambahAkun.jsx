"use client";
import { useState, useEffect, useMemo } from "react";
import AInput from "@/components/AInput";
import ARadio from "@/components/ARadio";
import ASelect from "@/components/ASelect";
import Button from "@/components/Button";
import { validateAkunForm } from "./validatorAkun";
import { User } from "lucide-react";
import {
  LEVEL_OPTIONS,
  STATUS_OPTIONS,
  roleSelectOptions,
  positionSelectOptions,
} from "@/constants/rbac";

export default function TambahAkun({
  onClose = null,
  onSuccess = null,
  postUser = null,
  editingAkun = null,
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
    status: "on",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);

  const levelOptions = useMemo(() => {
    const fromApi = roleSelectOptions(roles);
    return fromApi.length ? fromApi : LEVEL_OPTIONS;
  }, [roles]);

  const positionOptions = useMemo(
    () => positionSelectOptions(positions),
    [positions]
  );

  useEffect(() => {
    if (isEditMode && editingAkun) {
      setFormData({
        uid: editingAkun.uid || "",
        name: editingAkun.name || "",
        level:
          editingAkun.level !== undefined && editingAkun.level !== null
            ? String(editingAkun.level)
            : "",
        position:
          editingAkun.position !== undefined && editingAkun.position !== null
            ? String(editingAkun.position)
            : "",
        email: editingAkun.email || "",
        password: "",
        status: editingAkun.status || "on",
      });
    } else if (!isEditMode) {
      setFormData({
        uid: "",
        name: "",
        level: "",
        position: "",
        email: "",
        password: "",
        status: "on",
      });
    }
  }, [isEditMode, editingAkun]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (showErrors && errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = validateAkunForm(formData, { isEditMode });
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
        uid: formData.uid,
        name: formData.name,
        level: Number(formData.level),
        position: Number(formData.position),
        email: formData.email,
        status: formData.status,
      };
      if (formData.password?.trim()) {
        submitData.password = formData.password;
      }

      if (postUser) {
        await postUser(submitData);
      } else {
        throw new Error("postUser function not provided");
      }

      setFormData({
        uid: "",
        name: "",
        level: "",
        position: "",
        email: "",
        password: "",
        status: "on",
      });
      setShowErrors(false);
      setErrors({});

      if (onSuccess) onSuccess(submitData);
      if (onClose) onClose();
    } catch (error) {
      console.error("Error saving user:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Terjadi kesalahan saat menyimpan data";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AInput
          id="uid"
          icon={User}
          name="uid"
          label="UID"
          placeholder="Masukkan UID"
          value={formData.uid}
          onChange={handleInputChange}
          error={showErrors ? errors.uid : ""}
          required
        />
        <AInput
          id="name"
          icon={User}
          name="name"
          label="Nama"
          placeholder="Masukkan nama lengkap"
          value={formData.name}
          onChange={handleInputChange}
          error={showErrors ? errors.name : ""}
          required
        />

        <ASelect
          id="level"
          name="level"
          label="Level hak akses"
          placeholder="Pilih level"
          options={levelOptions}
          value={formData.level}
          onChange={handleInputChange}
          error={showErrors ? errors.level : ""}
          helperText="Super Admin: semua akses. Operator: operasional. User: terbatas."
          required
        />
        <ASelect
          id="position"
          name="position"
          label="Jabatan"
          placeholder="Pilih jabatan"
          options={positionOptions}
          value={formData.position}
          onChange={handleInputChange}
          error={showErrors ? errors.position : ""}
          required
        />

        <AInput
          id="email"
          icon={User}
          name="email"
          label="Email / username"
          placeholder="Masukkan email"
          value={formData.email}
          onChange={handleInputChange}
          error={showErrors ? errors.email : ""}
          required
        />
        <AInput
          id="password"
          icon={User}
          name="password"
          label={isEditMode ? "Password baru" : "Password"}
          placeholder={
            isEditMode ? "Kosongkan jika tidak diubah" : "Masukkan password"
          }
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          error={showErrors ? errors.password : ""}
          required={!isEditMode}
        />

        <div className="md:col-span-2">
          <ARadio
            id="status"
            name="status"
            label="Status akun"
            value={formData.status}
            onChange={handleInputChange}
            error={showErrors ? errors.status : ""}
            required
            options={STATUS_OPTIONS}
          />
        </div>
      </div>

      <div className="mt-6">
        <Button type="submit" loading={loading} className="w-full">
          {isEditMode ? "Update User" : "Simpan User"}
        </Button>
      </div>
    </form>
  );
}
